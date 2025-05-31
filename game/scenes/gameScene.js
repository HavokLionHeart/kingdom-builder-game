        class GameScene extends Phaser.Scene {
            constructor() {
                super({ key: 'GameScene' });
                this.gridSprites = [];
                this.uiElements = {};
                this.buildMenu = null;
                this.upgradeMenu = null;
                this.starTooltip = null;
            }

            preload() {
                // We'll create textures in the create method instead
            }

            create() {
                this.cameras.main.setBackgroundColor('#4a6741');
                
                // Create textures using graphics
                this.createTextures();
                
                // Load save data
                SaveSystem.load();
                
                this.createGrid();
                this.createUI();
                this.setupInput();
                
                // Auto-save every 30 seconds
                this.time.addEvent({
                    delay: 30000,
                    callback: SaveSystem.autoSave,
                    callbackScope: SaveSystem,
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
                    callback: this.consumeFood,
                    callbackScope: this,
                    loop: true
                });                   
        }
                consumeFood() {
                    const foodNeeded = gameState.resources.population;
                    
                    if (gameState.resources.food >= foodNeeded) {
                        gameState.resources.food -= foodNeeded;
                        gameState.isStarving = false;
                        this.uiElements.starvationWarning.setText('');
                    } else {
                        gameState.isStarving = true;
                        this.uiElements.starvationWarning.setText('⚠️ STARVING! Production halved until fed!');
                            
                            // Apply starvation penalty to all buildings
                    gameState.plots.forEach((plot, index) => {
                        if (plot.building && plot.unlocked && !plot.harvestReady) {
                            // Double the remaining time for current productions
                            const currentTime = Date.now();
                            const timeRemaining = plot.nextHarvest - currentTime;
                            if (timeRemaining > 0) {
                                plot.nextHarvest = currentTime + (timeRemaining * 2);
                            }
                        }
                    });
                    }
                    
                    gameState.lastFoodConsumption = Date.now();
                    this.updateUI();
                    
                    // Update food text color based on starvation status
                    this.uiElements.foodText.setFill(gameState.isStarving ? '#FF6666' : '#90EE90');
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
                        this.showUpgradeMenu(plotIndex);
                    } else {
                        this.handlePlotClick(plotIndex);
                    }
                });
                
                if (buildingSprite) {
                    buildingSprite.setInteractive();
                    buildingSprite.on('pointerdown', (pointer, localX, localY, event) => {
                        if (event.button === 2) { // Right click for upgrades
                            this.showUpgradeMenu(plotIndex);
                        } else {
                            this.handlePlotClick(plotIndex);
                        }
                    });
                }
            }

            createUI() {
                // Resource display
                const uiY = 30;
                this.uiElements.foodText = this.add.text(20, uiY, `Food: ${gameState.resources.food}`, {
                    fontSize: '16px',
                    fill: gameState.isStarving ? '#FF6666' : '#90EE90',
                    fontFamily: 'Courier New'
                });
                
                this.uiElements.woodText = this.add.text(20, uiY + 25, `Wood: ${gameState.resources.wood}`, {
                    fontSize: '16px',
                    fill: '#8B4513',
                    fontFamily: 'Courier New'
                });
                
                this.uiElements.stoneText = this.add.text(20, uiY + 50, `Stone: ${gameState.resources.stone}`, {
                    fontSize: '16px',
                    fill: '#A0A0A0',
                    fontFamily: 'Courier New'
                });

                this.uiElements.goldText = this.add.text(20, uiY + 75, `Gold: ${gameState.resources.gold}`, {
                    fontSize: '16px',
                    fill: '#87CEEB',
                    fontFamily: 'Courier New'
                });
                
                this.uiElements.popText = this.add.text(20, uiY + 100, `Population: ${gameState.resources.population}`, {
                    fontSize: '16px',
                    fill: '#87CEEB',
                    fontFamily: 'Courier New'
                });

                // Starvation warning
                this.uiElements.starvationWarning = this.add.text(20, uiY + 125, '', {
                    fontSize: '14px',
                    fill: '#FF0000',
                    fontFamily: 'Courier New'
                });

                // Instructions
                this.add.text(20, this.cameras.main.height - 80, 'Left click: build/harvest', {
                    fontSize: '14px',
                    fill: '#D4B896',
                    fontFamily: 'Courier New'
                });

                this.add.text(20, this.cameras.main.height - 60, 'Right click: upgrades (costs population)', {
                    fontSize: '14px',
                    fill: '#D4B896',
                    fontFamily: 'Courier New'
                });
                
                this.add.text(20, this.cameras.main.height - 40, 'Yellow glow = ready to harvest', {
                    fontSize: '14px',
                    fill: '#D4B896',
                    fontFamily: 'Courier New'
                });
            }

            setupInput() {
                // Handle clicking outside menus to close them
                this.input.on('pointerdown', (pointer, currentlyOver) => {
                    if ((gameState.showBuildMenu || gameState.showUpgradeMenu) && currentlyOver.length === 0) {
                        this.hideBuildMenu();
                        this.hideUpgradeMenu();
                    }
                });

                // Enable right-click context menu prevention
                this.input.mouse.disableContextMenu();
            }

            handlePlotClick(plotIndex) {
                const plot = gameState.plots[plotIndex];
                
                if (!plot.unlocked) {
                    this.showBuyPlotMenu(plotIndex);
                } else if (plot.building) {
                    if (plot.autoHarvest) {
                        return; // Auto-harvest buildings don't need manual harvesting
                    }
                    this.harvestBuilding(plotIndex);
                } else {
                    this.showBuildMenu(plotIndex);
                }
            }

            showBuildMenu(plotIndex) {
                this.hideBuildMenu();
                this.hideUpgradeMenu();
                
                gameState.selectedPlot = plotIndex;
                gameState.showBuildMenu = true;
                
                const plot = this.gridSprites[plotIndex];
                const menuX = plot.base.x + 60;
                const menuY = plot.base.y - 80;
                
                // Menu background
                const menuBg = this.add.rectangle(menuX, menuY, 160, 120, 0x2c1810, 0.9);
                menuBg.setStrokeStyle(2, 0x8b4513);
                
                // Title
                const title = this.add.text(menuX, menuY - 75, 'Build:', {
                    fontSize: '14px',
                    fill: '#D4B896',
                    fontFamily: 'Courier New',
                    align: 'center'
                }).setOrigin(0.5);
                
                // Build options
                let yOffset = -50;
                const buttons = [];
                
                 // Wheat Field button
                const wheatCost = buildingTypes.wheatField.cost;
                const canBuildWheat = this.canAffordBuilding('wheatField');
                const wheatBtn = this.createMenuButton(
                    menuX, menuY + yOffset, 
                    `Wheat Field (${wheatCost.food}f)`, 
                    canBuildWheat,
                    () => this.buildBuilding('wheatField')
                );
                buttons.push(...wheatBtn);
                yOffset += 30;
                
                // Woodcutter's Hut button
                const hutCost = buildingTypes.woodcuttersHut.cost;
                const canBuildHut = this.canAffordBuilding('woodcuttersHut');
                const hutBtn = this.createMenuButton(
                    menuX, menuY + yOffset,
                    `Woodcutter's Hut (${hutCost.food}f,${hutCost.wood}w)`,
                    canBuildHut,
                    () => this.buildBuilding('woodcuttersHut')
                );
                buttons.push(...hutBtn);
                yOffset += 30;
                
                // Shelter button
                const shelterCost = buildingTypes.shelter.cost;
                const canBuildShelter = this.canAffordBuilding('shelter');
                const shelterBtn = this.createMenuButton(
                    menuX, menuY + yOffset,
                    `Shelter (${shelterCost.wood}w)`,
                    canBuildShelter,
                    () => this.buildBuilding('shelter')
                );
                buttons.push(...shelterBtn);
                yOffset += 30;
                
                // Close button
                const closeBtn = this.createMenuButton(
                    menuX, menuY + yOffset,
                    'Close',
                    true,
                    () => this.hideBuildMenu()
                );
                buttons.push(...closeBtn);
                
                this.buildMenu = {
                    background: menuBg,
                    title: title,
                    buttons: buttons
                };
            }
                        showUpgradeMenu(plotIndex) {
                const plot = gameState.plots[plotIndex];
                if (!plot.building || !plot.unlocked) return;

                this.hideBuildMenu();
                this.hideUpgradeMenu();
                
                gameState.selectedPlot = plotIndex;
                gameState.showUpgradeMenu = true;
                
                const plotSprite = this.gridSprites[plotIndex];
                const menuX = plotSprite.base.x - 60;
                const menuY = plotSprite.base.y - 80;
                
                // Menu background
                const menuBg = this.add.rectangle(menuX, menuY, 200, 160, 0x2c1810, 0.9);
                menuBg.setStrokeStyle(2, 0x8b4513);
                
                // Title
                const title = this.add.text(menuX, menuY - 65, 'Upgrades (Population):', {
                    fontSize: '12px',
                    fill: '#D4B896',
                    fontFamily: 'Courier New',
                    align: 'center'
                }).setOrigin(0.5);
                
                let yOffset = -40;
                const buttons = [];
                
                // Auto-harvest upgrade
                if (!plot.autoHarvest) {
                    const autoUpgrade = populationUpgrades.autoHarvest;
                    const canAfford = gameState.resources.population >= autoUpgrade.cost;
                    const autoBtn = this.createMenuButton(
                        menuX, menuY + yOffset,
                        `${autoUpgrade.name} (${autoUpgrade.cost}p)`,
                        canAfford,
                        () => this.purchaseUpgrade(plotIndex, 'autoHarvest')
                    );
                    buttons.push(...autoBtn);
                    yOffset += 25;
                }
                
                // Speed boost upgrade
                if (plot.productionSpeed < 2.0) {
                    const speedUpgrade = populationUpgrades.speedBoost;
                    const canAfford = gameState.resources.population >= speedUpgrade.cost;
                    const speedBtn = this.createMenuButton(
                        menuX, menuY + yOffset,
                        `${speedUpgrade.name} (${speedUpgrade.cost}p)`,
                        canAfford,
                        () => this.purchaseUpgrade(plotIndex, 'speedBoost')
                    );
                    buttons.push(...speedBtn);
                    yOffset += 25;
                }
                
                // Output multiplier upgrade
                if (plot.harvestMultiplier < 2.0) {
                    const multUpgrade = populationUpgrades.outputMultiplier;
                    const canAfford = gameState.resources.population >= multUpgrade.cost;
                    const multBtn = this.createMenuButton(
                        menuX, menuY + yOffset,
                        `${multUpgrade.name} (${multUpgrade.cost}p)`,
                        canAfford,
                        () => this.purchaseUpgrade(plotIndex, 'outputMultiplier')
                    );
                    buttons.push(...multBtn);
                    yOffset += 25;
                }
                
                // Close button
                const closeBtn = this.createMenuButton(
                    menuX, menuY + yOffset,
                    'Close',
                    true,
                    () => this.hideUpgradeMenu()
                );
                buttons.push(...closeBtn);
                
                this.upgradeMenu = {
                    background: menuBg,
                    title: title,
                    buttons: buttons
                };
            }

            showBuyPlotMenu(plotIndex) {
                this.hideBuildMenu();
                this.hideUpgradeMenu();
                
                gameState.selectedPlot = plotIndex;
                gameState.showBuildMenu = true;
                
                const plot = this.gridSprites[plotIndex];
                const menuX = plot.base.x + 40;
                const menuY = plot.base.y;
                
                // Menu background
                const menuBg = this.add.rectangle(menuX, menuY, 160, 80, 0x2c1810, 0.9);
                menuBg.setStrokeStyle(2, 0x8b4513);
                
                // Title
                const title = this.add.text(menuX, menuY - 25, 'Locked Plot', {
                    fontSize: '14px',
                    fill: '#D4B896',
                    fontFamily: 'Courier New',
                    align: 'center'
                }).setOrigin(0.5);
                
                const buttons = [];
                
                // Buy plot button
                const canBuy = gameState.resources.gold >= gameState.nextPlotCost;
                const buyBtn = this.createMenuButton(
                    menuX, menuY,
                    `Buy (${gameState.nextPlotCost}g)`,
                    canBuy,
                    () => this.buyPlot(plotIndex)
                );
                buttons.push(...buyBtn);
                
                // Close button
                const closeBtn = this.createMenuButton(
                    menuX, menuY + 25,
                    'Close',
                    true,
                    () => this.hideBuildMenu()
                );
                buttons.push(...closeBtn);
                
                this.buildMenu = {
                    background: menuBg,
                    title: title,
                    buttons: buttons
                };
            }

            createMenuButton(x, y, text, enabled, callback) {
                const bg = this.add.rectangle(x, y, 140, 20, enabled ? 0x654321 : 0x444444);
                bg.setStrokeStyle(1, enabled ? 0x8b4513 : 0x666666);
                bg.setInteractive();
                
                const label = this.add.text(x, y, text, {
                    fontSize: '12px',
                    fill: enabled ? '#D4B896' : '#666666',
                    fontFamily: 'Courier New'
                }).setOrigin(0.5);
                
                if (enabled) {
                    bg.on('pointerdown', callback);
                    bg.on('pointerover', () => bg.setFillStyle(0x8b4513));
                    bg.on('pointerout', () => bg.setFillStyle(0x654321));
                }
                
                return [bg, label];
            }

            hideBuildMenu() {
                if (this.buildMenu) {
                    this.buildMenu.background.destroy();
                    this.buildMenu.title.destroy();
                    this.buildMenu.buttons.forEach(btnArray => {
                        if (Array.isArray(btnArray)) {
                            btnArray.forEach(element => element.destroy());
                        } else {
                            btnArray.destroy();
                        }
                    });
                    this.buildMenu = null;
                }
                gameState.showBuildMenu = false;
                gameState.selectedPlot = -1;
            }

                        hideUpgradeMenu() {
                if (this.upgradeMenu) {
                    this.upgradeMenu.background.destroy();
                    this.upgradeMenu.title.destroy();
                    this.upgradeMenu.buttons.forEach(btnArray => {
                        if (Array.isArray(btnArray)) {
                            btnArray.forEach(element => element.destroy());
                        } else {
                            btnArray.destroy();
                        }
                    });
                    this.upgradeMenu = null;
                }
                gameState.showUpgradeMenu = false;
                gameState.selectedPlot = -1;
            }

            canAffordBuilding(buildingType) {
                const cost = buildingTypes[buildingType].cost;
                for (let resource in cost) {
                    if (gameState.resources[resource] < cost[resource]) {
                        return false;
                    }
                }
                return true;
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
                            this.showUpgradeMenu(plotIndex);
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


            buildBuilding(type) {
                const plotIndex = gameState.selectedPlot;
                const plot = gameState.plots[plotIndex];
                const buildingDef = buildingTypes[type];
                
                 if (!this.canAffordBuilding(type)) return;
                
                // Deduct cost
                Object.keys(buildingDef.cost).forEach(resource => {
                gameState.resources[resource] -= buildingDef.cost[resource];
                });

                // Create building
                plot.building = type;
                // Apply starvation penalty to harvest time if starving
                const baseHarvestTime = buildingDef.harvestTime;
                const starvationMultiplier = gameState.isStarving ? 2 : 1;
                const effectiveHarvestTime = Math.floor(baseHarvestTime * starvationMultiplier / plot.productionSpeed);
                
                plot.nextHarvest = Date.now() + effectiveHarvestTime;
                
                // Update visual - need to recreate the entire plot
                this.recreatePlotVisual(plotIndex);
                
                this.updateUI();
                this.hideBuildMenu();
            }

            buyPlot(plotIndex) {
                const plot = gameState.plots[plotIndex];
                
                if (gameState.resources.gold < gameState.nextPlotCost) return;
                
                // Deduct cost
                gameState.resources.gold -= gameState.nextPlotCost;
                
                // Unlock plot
                plot.unlocked = true;
                
                // Update visual
                const gridSprite = this.gridSprites[plotIndex];
                gridSprite.base.setFillStyle(0x8FBC8F);
                
                // Increase next plot cost
                gameState.nextPlotCost = Math.floor(gameState.nextPlotCost * 2);
                
                this.updateUI();
                this.hideBuildMenu();
            }
            
                purchaseUpgrade(plotIndex, upgradeType) {
        const plot = gameState.plots[plotIndex];
        const upgrade = populationUpgrades[upgradeType];
        
        if (gameState.resources.population < upgrade.cost) return;
        
        // Deduct cost
        gameState.resources.population -= upgrade.cost;
        
        // Apply upgrade
        switch(upgradeType) {
            case 'autoHarvest':
                plot.autoHarvest = true;
                break;
            case 'speedBoost':
                plot.productionSpeed = 2.0;
                break;
            case 'outputMultiplier':
                plot.harvestMultiplier = 2.0;
                break;
        }
        
        this.updateUI();
        this.hideUpgradeMenu();
        this.recreatePlotVisual(plotIndex);
    }