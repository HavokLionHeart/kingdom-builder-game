class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.gridSprites = [];
        this.uiElements = {};
        this.buildMenu = null;
        this.upgradeMenu = null;
        this.starTooltip = null;
        
        // System instances will be created in create()
        this.buildingSystem = null;
        this.resourceSystem = null;
        this.saveSystem = null;
    }

    preload() {
        // We'll create textures in the create method instead
    }

    create() {
        this.cameras.main.setBackgroundColor('#4a6741');
        
        // Create textures using graphics
        this.createTextures();
        
        // Initialize system instances
        this.buildingSystem = new BuildingSystem(this);
        this.resourceSystem = new ResourceSystem(this);
        this.saveSystem = new SaveSystem(this);
        
        // Load save data
        this.saveSystem.loadGame();
        
        this.createGrid();
        
        // Initialize UI system
        UIElements.init(this);
        this.uiElements = UIElements.elements;
        this.uiInstance = UIElements.instance;

        // Connect ResourceSystem to UIElements
        this.uiInstance.setResourceSystem(this.resourceSystem);
        
        this.setupInput();
        
        // Auto-save every 30 seconds
        this.time.addEvent({
            delay: 30000,
            callback: () => this.saveSystem.autoSave(),
            callbackScope: this,
            loop: true
        });
        
        // Start game loop
        this.time.addEvent({
            delay: 1000,
            callback: this.updateBuildings,
            callbackScope: this,
            loop: true
        });

        // Food consumption timer
        this.time.addEvent({
            delay: gameState.foodConsumptionRate,
            callback: () => this.resourceSystem.consumeFood(),
            callbackScope: this,
            loop: true
        });                   
    }

    createTextures() {
        // Create a 1x1 white pixel texture
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 1, 1);
        graphics.generateTexture('pixel', 1, 1);
        graphics.destroy();
    }

    createGrid() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const tileSize = 80;
        const gridWidth = 3 * tileSize;
        const gridHeight = 3 * tileSize;
        const startX = centerX - gridWidth / 2 + tileSize / 2;
        const startY = centerY - gridHeight / 2 + tileSize / 2;

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const plotIndex = row * 3 + col;
                const x = startX + col * tileSize;
                const y = startY + row * tileSize;
                
                this.createPlot(x, y, plotIndex);
            }
        }
    }

    createPlot(x, y, plotIndex) {
        const plot = gameState.plots[plotIndex];
        
        // Base plot
        const baseColor = plot.unlocked ? 0x8FBC8F : 0x654321;
        const base = this.add.rectangle(x, y, 64, 64, baseColor);
        base.setStrokeStyle(2, 0x2F4F2F);
        base.setInteractive();
        
        // Building sprite (if exists)
        let buildingSprite = null;
        if (plot.building) {
            const buildingDef = buildingTypes[plot.building];
            buildingSprite = this.add.rectangle(x, y, 48, 48, buildingDef.color);
            buildingSprite.setStrokeStyle(2, 0x000000);
        
            // Add upgrade indicators
            if (plot.autoHarvest) {
                const autoIcon = this.add.circle(x + 15, y - 15, 4, 0x00FF00);
            }
            if (plot.productionSpeed > 1.0) {
                const speedIcon = this.add.circle(x - 15, y - 15, 4, 0x0080FF);
            }
            if (plot.harvestMultiplier > 1.0) {
                const multIcon = this.add.circle(x + 15, y + 15, 4, 0xFF8000);
            }
        }

        // Plot number text
        const plotText = this.add.text(x - 25, y - 25, (plotIndex + 1).toString(), {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Courier New'
        });

        // Store references
        this.gridSprites[plotIndex] = {
            base: base,
            building: buildingSprite,
            plotText: plotText,
            harvestIndicator: null,
            progressBar: null,
            progressBg: null,
            upgradeIndicators: []
        };

        // Click handler
        base.on('pointerdown', (pointer, localX, localY, event) => {
            if (event.button === 2) { // Right click for upgrades
                MenuSystem.showUpgradeMenu(this, plotIndex);
            } else {
                this.handlePlotClick(plotIndex);
            }
        });
        
        if (buildingSprite) {
            buildingSprite.setInteractive();
            buildingSprite.on('pointerdown', (pointer, localX, localY, event) => {
                if (event.button === 2) { // Right click for upgrades
                    MenuSystem.showUpgradeMenu(this, plotIndex);
                } else {
                    this.handlePlotClick(plotIndex);
                }
            });
        }
    }

    setupInput() {
        // Handle clicking outside menus to close them
        this.input.on('pointerdown', (pointer, currentlyOver) => {
            if ((gameState.showBuildMenu || gameState.showUpgradeMenu) && currentlyOver.length === 0) {
                MenuSystem.hideBuildMenu(this);
                MenuSystem.hideUpgradeMenu(this);
            }
        });

        // Enable right-click context menu prevention
        this.input.mouse.disableContextMenu();
    }

    handlePlotClick(plotIndex) {
        const plot = gameState.plots[plotIndex];
        
        if (!plot.unlocked) {
            MenuSystem.showBuyPlotMenu(this, plotIndex);
        } else if (plot.building) {
            if (plot.autoHarvest) {
                return; // Auto-harvest buildings don't need manual harvesting
            }
            this.harvestBuilding(plotIndex);
        } else {
            MenuSystem.showBuildMenu(this, plotIndex);
        }
    }

    recreatePlotVisual(plotIndex) {
        const plot = gameState.plots[plotIndex];
        const gridSprite = this.gridSprites[plotIndex];
        
        // Clean up existing building sprite and indicators
        if (gridSprite.building) {
            gridSprite.building.destroy();
            gridSprite.building = null;
        }
        
        // Clean up existing upgrade indicators
        if (gridSprite.upgradeIndicators) {
            gridSprite.upgradeIndicators.forEach(indicator => indicator.destroy());
            gridSprite.upgradeIndicators = [];
        }
        
        // Clean up progress elements
        if (gridSprite.progressBar) {
            gridSprite.progressBar.destroy();
            gridSprite.progressBg.destroy();
            gridSprite.progressBar = null;
            gridSprite.progressBg = null;
        }
        
        // Clean up harvest indicator
        if (gridSprite.harvestIndicator) {
            gridSprite.harvestIndicator.destroy();
            gridSprite.harvestIndicator = null;
        }
        
        // Create new building sprite if building exists
        if (plot.building) {
            const buildingDef = buildingTypes[plot.building];
            const x = gridSprite.base.x;
            const y = gridSprite.base.y;
            
            // Create building sprite
            gridSprite.building = this.add.rectangle(x, y, 48, 48, buildingDef.color);
            gridSprite.building.setStrokeStyle(2, 0x000000);
            gridSprite.building.setInteractive();
            
            // Add click handler to building sprite
            gridSprite.building.on('pointerdown', (pointer, localX, localY, event) => {
                if (event.button === 2) { // Right click for upgrades
                    MenuSystem.showUpgradeMenu(this, plotIndex);
                } else {
                    this.handlePlotClick(plotIndex);
                }
            });
            
            // Create upgrade indicators array
            gridSprite.upgradeIndicators = [];
            
            // Add upgrade indicators
            if (plot.autoHarvest) {
                const autoIcon = this.add.circle(x + 15, y - 15, 4, 0x00FF00);
                autoIcon.setStrokeStyle(1, 0x000000);
                gridSprite.upgradeIndicators.push(autoIcon);
            }
            
            if (plot.productionSpeed > 1.0) {
                const speedIcon = this.add.circle(x - 15, y - 15, 4, 0x0080FF);
                speedIcon.setStrokeStyle(1, 0x000000);
                gridSprite.upgradeIndicators.push(speedIcon);
            }
            
            if (plot.harvestMultiplier > 1.0) {
                const multIcon = this.add.circle(x + 15, y + 15, 4, 0xFF8000);
                multIcon.setStrokeStyle(1, 0x000000);
                gridSprite.upgradeIndicators.push(multIcon);
            }
            
            // Add building level indicator if above level 1
            if (plot.level > 1) {
                const levelText = this.add.text(x - 15, y + 15, plot.level.toString(), {
                    fontSize: '10px',
                    fill: '#ffffff',
                    fontFamily: 'Courier New',
                    backgroundColor: '#000000',
                    padding: { x: 2, y: 1 }
                }).setOrigin(0.5);
                gridSprite.upgradeIndicators.push(levelText);
            }
        }
    }

    harvestBuilding(plotIndex) {
        // Delegate to BuildingSystem instead of handling directly
        this.buildingSystem.harvestBuilding(plotIndex);
        
        // Update visual elements after harvest
        this.updatePlotHarvestVisual(plotIndex);
        
        // Update UI
        UIElements.updateUI();
    }

    updatePlotHarvestVisual(plotIndex) {
        const gridSprite = this.gridSprites[plotIndex];
        
        // Remove harvest indicator and progress bar after harvest
        if (gridSprite.harvestIndicator) {
            gridSprite.harvestIndicator.destroy();
            gridSprite.harvestIndicator = null;
        }
        if (gridSprite.progressBar) {
            gridSprite.progressBar.destroy();
            gridSprite.progressBg.destroy();
            gridSprite.progressBar = null;
            gridSprite.progressBg = null;
        }
    }

    updateBuildings() {
        // Delegate harvest timing updates to BuildingSystem
        this.buildingSystem.updateBuildings();

        // Update visual elements
        this.updateBuildingVisuals();
    }

    updateBuildingVisuals() {
        const currentTime = Date.now();
        
        gameState.plots.forEach((plot, index) => {
            const gridSprite = this.gridSprites[index];
            
            if (plot.building && plot.unlocked) {
                const buildingDef = buildingTypes[plot.building];
                const timeRemaining = plot.nextHarvest - currentTime;
                
                if (timeRemaining <= 0 && plot.harvestReady) {
                    // Show harvest indicator
                    if (!gridSprite.harvestIndicator) {
                        gridSprite.harvestIndicator = this.add.circle(
                            gridSprite.base.x, 
                            gridSprite.base.y, 
                            35, 
                            0xFFFF00, 
                            0.3
                        );
                    }
                    
                    // Hide progress bar
                    if (gridSprite.progressBar) {
                        gridSprite.progressBar.destroy();
                        gridSprite.progressBg.destroy();
                        gridSprite.progressBar = null;
                        gridSprite.progressBg = null;
                    }
                } else if (timeRemaining > 0 && !plot.harvestReady) {
                    // Show progress bar
                    const progress = 1 - (timeRemaining / buildingDef.harvestTime);
                    
                    if (!gridSprite.progressBg) {
                        // Create progress bar background
                        gridSprite.progressBg = this.add.rectangle(
                            gridSprite.base.x, 
                            gridSprite.base.y + 35, 
                            50, 6, 
                            0x333333
                        );
                        gridSprite.progressBg.setStrokeStyle(1, 0x000000);
                    }
                    
                    if (gridSprite.progressBar) {
                        gridSprite.progressBar.destroy();
                    }
                    
                    // Create progress bar fill
                    const barWidth = Math.max(2, 48 * progress);
                    gridSprite.progressBar = this.add.rectangle(
                        gridSprite.base.x - 24 + barWidth/2, 
                        gridSprite.base.y + 35, 
                        barWidth, 4, 
                        0x00FF00
                    );
                    
                    // Hide harvest indicator while building
                    if (gridSprite.harvestIndicator) {
                        gridSprite.harvestIndicator.destroy();
                        gridSprite.harvestIndicator = null;
                    }
                }
            }
        });
    }

    // Method for external systems to update UI
    updateUI() {
        if (this.uiInstance) {
            this.uiInstance.updateUI();
        }
    }
}

// Add GameScene to the config after it's defined
if (typeof config !== 'undefined') {
    config.scene = [GameScene];
}