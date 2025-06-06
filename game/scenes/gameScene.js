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
        this.eventSystem = new EventSystem(this);
        this.demolitionSystem = new DemolitionSystem(this);

        // Load save data
        this.saveSystem.loadGame();

        // Initialize building ages and bonuses
        this.demolitionSystem.initializeBuildingAges();

        // Setup camera system for zoom/pan
        this.setupCameraControls();

        // Create separate containers for world and UI
        this.worldContainer = this.add.container(0, 0);
        this.uiContainer = this.add.container(0, 0);

        // Set UI container to ignore camera transforms
        this.uiContainer.setScrollFactor(0);

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

    setupCameraControls() {
        // Camera control variables
        this.cameraZoom = 1;
        this.minZoom = 0.5;
        this.maxZoom = 2.0;
        this.isDragging = false;
        this.lastPanPoint = null;
        this.isPinching = false;
        this.lastPinchDistance = 0;

        // Set initial camera bounds
        this.cameras.main.setBounds(-400, -300, 1600, 1200);
        this.cameras.main.setZoom(this.cameraZoom);

        // Center camera on the grid initially
        this.cameras.main.centerOn(400, 300);
    }

    createGrid() {
        // Use fixed world coordinates instead of camera-relative
        const centerX = 400; // Fixed world center
        const centerY = 300; // Fixed world center
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

        // Add all plot elements to world container
        const plotElements = [base, plotText];
        if (buildingSprite) {
            plotElements.push(buildingSprite);
        }
        this.worldContainer.add(plotElements);

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

        // Click handler with mobile support
        base.on('pointerdown', (pointer, localX, localY, event) => {
            this.handlePointerDown(pointer, plotIndex, event);
        });

        base.on('pointerup', (pointer) => {
            this.handlePointerUp(pointer, plotIndex);
        });
        
        if (buildingSprite) {
            buildingSprite.setInteractive();
            buildingSprite.on('pointerdown', (pointer, localX, localY, event) => {
                this.handlePointerDown(pointer, plotIndex, event);
            });

            buildingSprite.on('pointerup', (pointer) => {
                this.handlePointerUp(pointer, plotIndex);
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

        // Mobile-specific touch optimizations
        this.input.addPointer(2); // Support multi-touch

        // Track touch/hold for mobile right-click simulation
        this.touchHoldTimer = null;
        this.touchHoldDuration = 500; // 500ms hold for "right-click"
        this.isTouchHolding = false;

        // Camera control input handlers
        this.setupCameraInput();
    }

    handlePointerDown(pointer, plotIndex, event) {
        // Check for right-click on desktop
        if (event && event.button === 2) {
            // Only show upgrade menu for buildings
            const plot = gameState.plots[plotIndex];
            if (plot.building && plot.unlocked) {
                MenuSystem.showUpgradeMenu(this, plotIndex);
            }
            return;
        }

        const plot = gameState.plots[plotIndex];

        // Start touch hold detection for all plots
        if (pointer.isDown && !this.isTouchHolding) {
            this.isTouchHolding = true;
            this.currentTouchPlot = plotIndex;

            // For buildings, add visual feedback and start upgrade menu timer
            if (plot.building && plot.unlocked) {
                // Add visual feedback for touch hold
                this.showTouchHoldIndicator(plotIndex);

                // Start upgrade menu timer (0.5 seconds)
                this.touchHoldTimer = this.time.delayedCall(this.touchHoldDuration, () => {
                    if (this.isTouchHolding && this.currentTouchPlot === plotIndex) {
                        // Show upgrade menu on long press
                        MenuSystem.showUpgradeMenu(this, plotIndex);
                        this.isTouchHolding = false;
                        this.hideTouchHoldIndicator();
                    }
                });
            }
        }
    }

    handlePointerUp(pointer, plotIndex) {
        // Cancel hold timer if touch is released early
        if (this.touchHoldTimer) {
            this.touchHoldTimer.remove();
            this.touchHoldTimer = null;
        }

        // Hide touch hold indicator
        this.hideTouchHoldIndicator();

        // If it was a short tap (not a hold), handle normal click
        if (this.isTouchHolding && this.currentTouchPlot === plotIndex) {
            this.handlePlotClick(plotIndex);
        }

        // Reset touch holding state
        this.isTouchHolding = false;
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
            this.worldContainer.add(gridSprite.building);
            
            // Add click handler to building sprite
            gridSprite.building.on('pointerdown', (pointer, localX, localY, event) => {
                this.handlePointerDown(pointer, plotIndex, event);
            });

            gridSprite.building.on('pointerup', (pointer) => {
                this.handlePointerUp(pointer, plotIndex);
            });
            
            // Create upgrade indicators array
            gridSprite.upgradeIndicators = [];
            
            // Add upgrade indicators
            if (plot.autoHarvest) {
                const autoIcon = this.add.circle(x + 15, y - 15, 4, 0x00FF00);
                autoIcon.setStrokeStyle(1, 0x000000);
                gridSprite.upgradeIndicators.push(autoIcon);
                this.worldContainer.add(autoIcon);
            }

            if (plot.productionSpeed > 1.0) {
                const speedIcon = this.add.circle(x - 15, y - 15, 4, 0x0080FF);
                speedIcon.setStrokeStyle(1, 0x000000);
                gridSprite.upgradeIndicators.push(speedIcon);
                this.worldContainer.add(speedIcon);
            }

            if (plot.harvestMultiplier > 1.0) {
                const multIcon = this.add.circle(x + 15, y + 15, 4, 0xFF8000);
                multIcon.setStrokeStyle(1, 0x000000);
                gridSprite.upgradeIndicators.push(multIcon);
                this.worldContainer.add(multIcon);
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
                this.worldContainer.add(levelText);
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
                    // Show harvest indicator only for manual harvest buildings
                    if (!plot.autoHarvest && !gridSprite.harvestIndicator) {
                        gridSprite.harvestIndicator = this.add.circle(
                            gridSprite.base.x,
                            gridSprite.base.y,
                            35,
                            0xFFFF00,
                            0.3
                        );
                        this.worldContainer.add(gridSprite.harvestIndicator);
                    }
                    
                    // Hide progress bar
                    if (gridSprite.progressBar) {
                        gridSprite.progressBar.destroy();
                        gridSprite.progressBg.destroy();
                        gridSprite.progressBar = null;
                        gridSprite.progressBg = null;
                    }
                } else if (timeRemaining > 0 && !plot.harvestReady) {
                    // Calculate effective harvest time with bonuses
                    const starvationMultiplier = gameState.isStarving ? 2 : 1;
                    let efficiencyBonus = 1.0;
                    if (this.demolitionSystem) {
                        const totalBonus = this.demolitionSystem.getTotalEfficiencyBonus(index);
                        efficiencyBonus = 1.0 + totalBonus;
                    }
                    const effectiveHarvestTime = Math.floor(buildingDef.harvestTime * starvationMultiplier / (plot.productionSpeed * efficiencyBonus));

                    // Calculate progress based on effective time
                    const progress = 1 - (timeRemaining / effectiveHarvestTime);
                    
                    if (!gridSprite.progressBg) {
                        // Create progress bar background
                        gridSprite.progressBg = this.add.rectangle(
                            gridSprite.base.x,
                            gridSprite.base.y + 35,
                            50, 6,
                            0x333333
                        );
                        gridSprite.progressBg.setStrokeStyle(1, 0x000000);
                        this.worldContainer.add(gridSprite.progressBg);
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
                    this.worldContainer.add(gridSprite.progressBar);
                    
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

    // Touch hold indicator for mobile upgrade access
    showTouchHoldIndicator(plotIndex) {
        this.hideTouchHoldIndicator(); // Remove any existing indicator

        const gridSprite = this.gridSprites[plotIndex];
        if (gridSprite && gridSprite.base) {
            this.touchHoldIndicator = this.add.circle(
                gridSprite.base.x,
                gridSprite.base.y,
                40,
                0xFFFFFF,
                0.3
            );
            this.worldContainer.add(this.touchHoldIndicator);

            // Animate the indicator
            this.tweens.add({
                targets: this.touchHoldIndicator,
                scaleX: 1.2,
                scaleY: 1.2,
                alpha: 0.6,
                duration: this.touchHoldDuration,
                ease: 'Power2'
            });
        }
    }

    hideTouchHoldIndicator() {
        if (this.touchHoldIndicator) {
            this.touchHoldIndicator.destroy();
            this.touchHoldIndicator = null;
        }
    }

    setupCameraInput() {
        // Mouse wheel zoom
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            this.handleZoom(deltaY > 0 ? -0.1 : 0.1, pointer.worldX, pointer.worldY);
        });

        // Touch/mouse pan
        this.input.on('pointerdown', (pointer) => {
            if (pointer.buttons === 4 || this.input.activePointer.pointersTotal >= 2) {
                // Middle mouse button or two-finger touch
                this.isDragging = true;
                this.lastPanPoint = { x: pointer.x, y: pointer.y };
            }
        });

        this.input.on('pointermove', (pointer) => {
            // Handle panning
            if (this.isDragging && this.lastPanPoint) {
                const deltaX = pointer.x - this.lastPanPoint.x;
                const deltaY = pointer.y - this.lastPanPoint.y;

                this.cameras.main.scrollX -= deltaX / this.cameraZoom;
                this.cameras.main.scrollY -= deltaY / this.cameraZoom;

                this.lastPanPoint = { x: pointer.x, y: pointer.y };
            }

            // Handle pinch zoom
            if (this.input.activePointer.pointersTotal === 2) {
                const pointer1 = this.input.activePointer;
                const pointer2 = this.input.pointer2;

                if (pointer1.isDown && pointer2.isDown) {
                    const distance = Phaser.Math.Distance.Between(
                        pointer1.x, pointer1.y,
                        pointer2.x, pointer2.y
                    );

                    if (this.lastPinchDistance > 0) {
                        const zoomDelta = (distance - this.lastPinchDistance) * 0.01;
                        const centerX = (pointer1.x + pointer2.x) / 2;
                        const centerY = (pointer1.y + pointer2.y) / 2;
                        this.handleZoom(zoomDelta, centerX, centerY);
                    }

                    this.lastPinchDistance = distance;
                    this.isPinching = true;
                }
            }
        });

        this.input.on('pointerup', (pointer) => {
            if (pointer.buttons === 0) {
                this.isDragging = false;
                this.lastPanPoint = null;
            }

            if (this.input.activePointer.pointersTotal < 2) {
                this.isPinching = false;
                this.lastPinchDistance = 0;
            }
        });
    }

    handleZoom(zoomDelta, centerX, centerY) {
        const newZoom = Phaser.Math.Clamp(
            this.cameraZoom + zoomDelta,
            this.minZoom,
            this.maxZoom
        );

        if (newZoom !== this.cameraZoom) {
            // Calculate world position of zoom center
            const worldX = centerX + this.cameras.main.scrollX;
            const worldY = centerY + this.cameras.main.scrollY;

            // Update zoom
            this.cameraZoom = newZoom;
            this.cameras.main.setZoom(this.cameraZoom);

            // Adjust camera position to zoom towards the center point
            const newWorldX = centerX + this.cameras.main.scrollX;
            const newWorldY = centerY + this.cameras.main.scrollY;

            this.cameras.main.scrollX += (worldX - newWorldX);
            this.cameras.main.scrollY += (worldY - newWorldY);
        }
    }
}

// Add GameScene to the config after it's defined
if (typeof config !== 'undefined') {
    config.scene = [GameScene];
}