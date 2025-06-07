// Upgrade Menu System for Kingdom Builder
// Handles the upgrade interface with star indicators, evolution, and automation

class UpgradeMenu {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.currentPlotIndex = -1;
        this.container = null;
        this.starContainers = { speed: null, output: null };
        this.tooltipContainer = null;
    }

    // Open upgrade menu for specific plot
    openMenu(plotIndex) {
        if (this.isOpen) {
            this.closeMenu();
        }

        const plot = gameState.plots[plotIndex];
        if (!plot.building) return;

        this.currentPlotIndex = plotIndex;
        this.isOpen = true;
        this.createMenuUI(plot);
    }

    // Close upgrade menu
    closeMenu() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.currentPlotIndex = -1;

        if (this.container) {
            this.container.destroy();
            this.container = null;
        }

        if (this.tooltipContainer) {
            this.tooltipContainer.destroy();
            this.tooltipContainer = null;
        }

        this.starContainers = { speed: null, output: null };
    }

    // Create the main upgrade menu UI
    createMenuUI(plot) {
        const buildingDef = buildingTypes[plot.building];
        const evolutionData = UpgradeUtils.getEvolutionData(buildingDef.baseId, buildingDef.evolution);
        
        // Calculate menu position
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;
        const menuWidth = 400;
        const menuHeight = 500;

        // Create main container
        this.container = this.scene.add.container(centerX, centerY);
        this.container.setDepth(1500);
        this.container.setScrollFactor(0);

        // Background overlay
        const overlay = this.scene.add.rectangle(0, 0, 
            this.scene.cameras.main.width, 
            this.scene.cameras.main.height, 
            0x000000, 0.5);
        overlay.setInteractive();
        overlay.on('pointerdown', () => this.closeMenu());
        this.container.add(overlay);

        // Menu background
        const menuBg = this.scene.add.rectangle(0, 0, menuWidth, menuHeight, 0x2c1810, 0.95);
        menuBg.setStrokeStyle(3, 0x8b4513);
        this.container.add(menuBg);

        // Title with building name and evolution
        const titleText = evolutionData ? evolutionData.name : buildingDef.name;
        const title = this.scene.add.text(0, -menuHeight/2 + 30, titleText, {
            fontSize: '20px',
            fill: evolutionData ? `#${evolutionData.color.toString(16).padStart(6, '0')}` : '#D4B896',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.container.add(title);

        // Close button
        const closeButton = this.scene.add.rectangle(menuWidth/2 - 25, -menuHeight/2 + 25, 20, 20, 0x654321);
        closeButton.setStrokeStyle(2, 0x8b4513);
        closeButton.setInteractive();
        closeButton.on('pointerdown', () => this.closeMenu());
        this.container.add(closeButton);

        const closeText = this.scene.add.text(menuWidth/2 - 25, -menuHeight/2 + 25, '×', {
            fontSize: '16px',
            fill: '#D4B896',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        this.container.add(closeText);

        // Create upgrade sections
        this.createSpeedUpgradeSection(plot, -menuHeight/2 + 80);
        this.createOutputUpgradeSection(plot, -menuHeight/2 + 180);
        this.createAutomationSection(plot, -menuHeight/2 + 280);
        this.createEvolutionSection(plot, -menuHeight/2 + 350);
    }

    // Create speed upgrade section with star indicators
    createSpeedUpgradeSection(plot, yPos) {
        const buildingDef = buildingTypes[plot.building];
        const currentLevel = plot.speedLevel || 0;
        const maxLevel = UpgradeUtils.getMaxLevel(buildingDef.baseId, buildingDef.evolution);
        
        // Section title
        const title = this.scene.add.text(-180, yPos, 'Speed Upgrade', {
            fontSize: '16px',
            fill: '#D4B896',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        });
        this.container.add(title);

        // Current effect display
        const speedBonus = UpgradeUtils.calculateSpeedBonus(currentLevel);
        const effectText = this.scene.add.text(-180, yPos + 20, 
            `Level ${currentLevel}/${maxLevel} (+${(speedBonus * 100).toFixed(0)}% speed)`, {
            fontSize: '12px',
            fill: '#90EE90',
            fontFamily: 'Courier New'
        });
        this.container.add(effectText);

        // Star indicators
        this.createStarIndicators('speed', currentLevel, maxLevel, -180, yPos + 40);

        // Upgrade button
        if (currentLevel < maxLevel) {
            const cost = UPGRADE_COSTS.speed.calculateCost(currentLevel, buildingDef.evolution, buildingDef.baseId);
            const canAfford = UpgradeUtils.canAfford(cost);
            
            const upgradeButton = this.scene.add.rectangle(100, yPos + 50, 120, 30, 
                canAfford ? 0x654321 : 0x444444);
            upgradeButton.setStrokeStyle(2, canAfford ? 0x8b4513 : 0x666666);
            
            if (canAfford) {
                upgradeButton.setInteractive();
                upgradeButton.on('pointerdown', () => this.purchaseSpeedUpgrade(plot));
            }
            
            this.container.add(upgradeButton);

            const buttonText = this.scene.add.text(100, yPos + 50, 
                `Upgrade (${UpgradeUtils.formatCost(cost)})`, {
                fontSize: '10px',
                fill: canAfford ? '#D4B896' : '#666666',
                fontFamily: 'Courier New'
            }).setOrigin(0.5);
            this.container.add(buttonText);
        }
    }

    // Create output upgrade section with star indicators
    createOutputUpgradeSection(plot, yPos) {
        const buildingDef = buildingTypes[plot.building];
        const currentLevel = plot.outputLevel || 0;
        const maxLevel = UpgradeUtils.getMaxLevel(buildingDef.baseId, buildingDef.evolution);
        
        // Section title
        const title = this.scene.add.text(-180, yPos, 'Output Upgrade', {
            fontSize: '16px',
            fill: '#D4B896',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        });
        this.container.add(title);

        // Current effect display
        const outputBonus = UpgradeUtils.calculateOutputBonus(currentLevel);
        const effectText = this.scene.add.text(-180, yPos + 20, 
            `Level ${currentLevel}/${maxLevel} (+${(outputBonus * 100).toFixed(0)}% output)`, {
            fontSize: '12px',
            fill: '#90EE90',
            fontFamily: 'Courier New'
        });
        this.container.add(effectText);

        // Star indicators
        this.createStarIndicators('output', currentLevel, maxLevel, -180, yPos + 40);

        // Upgrade button
        if (currentLevel < maxLevel) {
            const cost = UPGRADE_COSTS.output.calculateCost(currentLevel, buildingDef.evolution, buildingDef.baseId);
            const canAfford = UpgradeUtils.canAfford(cost);
            
            const upgradeButton = this.scene.add.rectangle(100, yPos + 50, 120, 30, 
                canAfford ? 0x654321 : 0x444444);
            upgradeButton.setStrokeStyle(2, canAfford ? 0x8b4513 : 0x666666);
            
            if (canAfford) {
                upgradeButton.setInteractive();
                upgradeButton.on('pointerdown', () => this.purchaseOutputUpgrade(plot));
            }
            
            this.container.add(upgradeButton);

            const buttonText = this.scene.add.text(100, yPos + 50, 
                `Upgrade (${UpgradeUtils.formatCost(cost)})`, {
                fontSize: '10px',
                fill: canAfford ? '#D4B896' : '#666666',
                fontFamily: 'Courier New'
            }).setOrigin(0.5);
            this.container.add(buttonText);
        }
    }

    // Create star indicators for upgrade levels
    createStarIndicators(upgradeType, currentLevel, maxLevel, x, y) {
        const starSize = 12;
        const starSpacing = 16;
        const starsPerRow = 10;
        
        this.starContainers[upgradeType] = this.scene.add.container(x, y);
        this.container.add(this.starContainers[upgradeType]);

        for (let i = 1; i <= maxLevel; i++) {
            const row = Math.floor((i - 1) / starsPerRow);
            const col = (i - 1) % starsPerRow;
            const starX = col * starSpacing;
            const starY = row * 20;

            // Determine star color and state
            let starColor = 0x333333; // Grey for locked
            if (i <= currentLevel) {
                starColor = UpgradeUtils.getStarColor(i);
            }

            // Create star shape
            const star = this.scene.add.star(starX, starY, 5, starSize/2, starSize/4, starColor);
            star.setStrokeStyle(1, 0x000000);
            star.setInteractive();
            
            // Add tooltip on hover
            star.on('pointerover', () => {
                this.showStarTooltip(upgradeType, i, currentLevel, maxLevel, starX + x, starY + y);
            });
            
            star.on('pointerout', () => {
                this.hideTooltip();
            });

            this.starContainers[upgradeType].add(star);
        }
    }

    // Create automation section
    createAutomationSection(plot, yPos) {
        const title = this.scene.add.text(-180, yPos, 'Automation', {
            fontSize: '16px',
            fill: '#D4B896',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        });
        this.container.add(title);

        if (plot.autoHarvest) {
            const statusText = this.scene.add.text(-180, yPos + 20, 'Auto-harvest enabled', {
                fontSize: '12px',
                fill: '#00FF00',
                fontFamily: 'Courier New'
            });
            this.container.add(statusText);
        } else {
            const statusText = this.scene.add.text(-180, yPos + 20, 'Auto-harvest disabled', {
                fontSize: '12px',
                fill: '#FF6666',
                fontFamily: 'Courier New'
            });
            this.container.add(statusText);

            // Automation button (placeholder - requires automation tokens)
            const autoButton = this.scene.add.rectangle(100, yPos + 30, 120, 30, 0x444444);
            autoButton.setStrokeStyle(2, 0x666666);
            this.container.add(autoButton);

            const buttonText = this.scene.add.text(100, yPos + 30, 'Requires Token', {
                fontSize: '10px',
                fill: '#666666',
                fontFamily: 'Courier New'
            }).setOrigin(0.5);
            this.container.add(buttonText);
        }
    }

    // Create evolution section
    createEvolutionSection(plot, yPos) {
        const buildingDef = buildingTypes[plot.building];
        const canEvolve = UpgradeUtils.canEvolve(plot);
        const nextEvolution = buildingDef.evolution + 1;
        const evolutionData = UpgradeUtils.getEvolutionData(buildingDef.baseId, nextEvolution);

        const title = this.scene.add.text(-180, yPos, 'Evolution', {
            fontSize: '16px',
            fill: '#D4B896',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        });
        this.container.add(title);

        if (evolutionData && canEvolve) {
            const cost = UPGRADE_COSTS.evolution.calculateCost(buildingDef.evolution, buildingDef.baseId);
            const canAfford = UpgradeUtils.canAfford(cost);

            const statusText = this.scene.add.text(-180, yPos + 20, 
                `Evolve to ${evolutionData.name}`, {
                fontSize: '12px',
                fill: '#FFD700',
                fontFamily: 'Courier New'
            });
            this.container.add(statusText);

            const evolveButton = this.scene.add.rectangle(100, yPos + 30, 120, 30, 
                canAfford ? 0x654321 : 0x444444);
            evolveButton.setStrokeStyle(2, canAfford ? 0x8b4513 : 0x666666);
            
            if (canAfford) {
                evolveButton.setInteractive();
                evolveButton.on('pointerdown', () => this.purchaseEvolution(plot));
            }
            
            this.container.add(evolveButton);

            const buttonText = this.scene.add.text(100, yPos + 30, 
                `Evolve (${UpgradeUtils.formatCost(cost)})`, {
                fontSize: '10px',
                fill: canAfford ? '#D4B896' : '#666666',
                fontFamily: 'Courier New'
            }).setOrigin(0.5);
            this.container.add(buttonText);
        } else if (!evolutionData) {
            const statusText = this.scene.add.text(-180, yPos + 20, 'Max evolution reached', {
                fontSize: '12px',
                fill: '#888888',
                fontFamily: 'Courier New'
            });
            this.container.add(statusText);
        } else {
            const statusText = this.scene.add.text(-180, yPos + 20, 
                'Max both upgrades to unlock', {
                fontSize: '12px',
                fill: '#FF6666',
                fontFamily: 'Courier New'
            });
            this.container.add(statusText);
        }
    }

    // Show tooltip for star hover
    showStarTooltip(upgradeType, level, currentLevel, maxLevel, x, y) {
        this.hideTooltip();

        const buildingDef = buildingTypes[gameState.plots[this.currentPlotIndex].building];
        const cost = upgradeType === 'speed' ?
            UPGRADE_COSTS.speed.calculateCost(level - 1, buildingDef.evolution, buildingDef.baseId) :
            UPGRADE_COSTS.output.calculateCost(level - 1, buildingDef.evolution, buildingDef.baseId);

        const status = level <= currentLevel ? 'Owned' :
                      level === currentLevel + 1 ? `Next: ${UpgradeUtils.formatCost(cost)}` :
                      'Locked';

        this.tooltipContainer = this.scene.add.container(x, y - 30);
        this.tooltipContainer.setDepth(2000);
        this.tooltipContainer.setScrollFactor(0);

        const tooltipBg = this.scene.add.rectangle(0, 0, 120, 40, 0x000000, 0.9);
        tooltipBg.setStrokeStyle(1, 0xFFFFFF);
        this.tooltipContainer.add(tooltipBg);

        const tooltipText = this.scene.add.text(0, 0, `Level ${level}/${maxLevel}\n${status}`, {
            fontSize: '10px',
            fill: '#FFFFFF',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);
        this.tooltipContainer.add(tooltipText);

        this.container.add(this.tooltipContainer);
    }

    // Hide tooltip
    hideTooltip() {
        if (this.tooltipContainer) {
            this.tooltipContainer.destroy();
            this.tooltipContainer = null;
        }
    }

    // Purchase speed upgrade
    purchaseSpeedUpgrade(plot) {
        const buildingDef = buildingTypes[plot.building];
        const currentLevel = plot.speedLevel || 0;
        const cost = UPGRADE_COSTS.speed.calculateCost(currentLevel, buildingDef.evolution, buildingDef.baseId);

        if (UpgradeUtils.canAfford(cost)) {
            UpgradeUtils.deductCost(cost);
            plot.speedLevel = currentLevel + 1;

            // Update production speed
            const speedBonus = UpgradeUtils.calculateSpeedBonus(plot.speedLevel);
            plot.productionSpeed = 1.0 + speedBonus;

            // Refresh menu
            this.closeMenu();
            this.openMenu(this.currentPlotIndex);

            // Update UI
            if (this.scene.uiInstance) {
                this.scene.uiInstance.updateUI();
            }
        }
    }

    // Purchase output upgrade
    purchaseOutputUpgrade(plot) {
        const buildingDef = buildingTypes[plot.building];
        const currentLevel = plot.outputLevel || 0;
        const cost = UPGRADE_COSTS.output.calculateCost(currentLevel, buildingDef.evolution, buildingDef.baseId);

        if (UpgradeUtils.canAfford(cost)) {
            UpgradeUtils.deductCost(cost);
            plot.outputLevel = currentLevel + 1;

            // Update harvest multiplier
            const outputBonus = UpgradeUtils.calculateOutputBonus(plot.outputLevel);
            plot.harvestMultiplier = 1.0 + outputBonus;

            // Refresh menu
            this.closeMenu();
            this.openMenu(this.currentPlotIndex);

            // Update UI
            if (this.scene.uiInstance) {
                this.scene.uiInstance.updateUI();
            }
        }
    }

    // Purchase evolution
    purchaseEvolution(plot) {
        const buildingDef = buildingTypes[plot.building];
        const cost = UPGRADE_COSTS.evolution.calculateCost(buildingDef.evolution, buildingDef.baseId);

        if (UpgradeUtils.canAfford(cost) && UpgradeUtils.canEvolve(plot)) {
            UpgradeUtils.deductCost(cost);

            // Reset upgrade levels
            plot.speedLevel = 0;
            plot.outputLevel = 0;
            plot.productionSpeed = 1.0;
            plot.harvestMultiplier = 1.0;

            // Evolve building
            buildingDef.evolution += 1;
            const evolutionData = UpgradeUtils.getEvolutionData(buildingDef.baseId, buildingDef.evolution);
            if (evolutionData) {
                buildingDef.name = evolutionData.name;
                buildingDef.color = evolutionData.color;
            }

            // Refresh menu
            this.closeMenu();
            this.openMenu(this.currentPlotIndex);

            // Update visuals
            if (this.scene.recreatePlotVisual) {
                this.scene.recreatePlotVisual(this.currentPlotIndex);
            }

            // Update UI
            if (this.scene.uiInstance) {
                this.scene.uiInstance.updateUI();
            }
        }
    }

    // Check if menu is open for specific plot
    isOpenForPlot(plotIndex) {
        return this.isOpen && this.currentPlotIndex === plotIndex;
    }
}

// Expose to global scope
window.UpgradeMenu = UpgradeMenu;
