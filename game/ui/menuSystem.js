class MenuSystem {
    static showBuildMenu(scene, plotIndex) {
        this.hideBuildMenu(scene);
        this.hideUpgradeMenu(scene);
        
        gameState.selectedPlot = plotIndex;
        gameState.showBuildMenu = true;
        
        const plot = scene.gridSprites[plotIndex];
        const menuX = plot.base.x + 60;
        const menuY = plot.base.y - 80;
        
        // Menu background
        const menuBg = scene.add.rectangle(menuX, menuY, 208, 210, 0x2c1810, 0.9);
        menuBg.setStrokeStyle(2, 0x8b4513);
        
        // Title
        const title = scene.add.text(menuX, menuY - 95, 'Build:', {
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
            scene, menuX, menuY + yOffset, 
            `Wheat Field (${wheatCost.food}f)`, 
            canBuildWheat,
            () => {
                if (scene.buildingSystem) {
                    scene.buildingSystem.buildBuilding(gameState.selectedPlot, 'wheatField');
                }
                this.hideBuildMenu(scene);
            }
        );
        buttons.push(...wheatBtn);
        yOffset += 30;
        
        // Woodcutter's Hut button
        const hutCost = buildingTypes.woodcuttersHut.cost;
        const canBuildHut = this.canAffordBuilding('woodcuttersHut');
        const hutBtn = this.createMenuButton(
            scene, menuX, menuY + yOffset,
            `Woodcutter's Hut (${hutCost.food}f,${hutCost.wood}w)`,
            canBuildHut,
            () => {
                if (scene.buildingSystem) {
                    scene.buildingSystem.buildBuilding(gameState.selectedPlot, 'woodcuttersHut');
                }
                this.hideBuildMenu(scene);
            }
        );
        buttons.push(...hutBtn);
        yOffset += 30;
        
        // Shelter button
        const shelterCost = buildingTypes.shelter.cost;
        const canBuildShelter = this.canAffordBuilding('shelter');
        const shelterBtn = this.createMenuButton(
            scene, menuX, menuY + yOffset,
            `Shelter (${shelterCost.wood}w)`,
            canBuildShelter,
            () => {
                if (scene.buildingSystem) {
                    scene.buildingSystem.buildBuilding(gameState.selectedPlot, 'shelter');
                }
                this.hideBuildMenu(scene);
            }
        );
        buttons.push(...shelterBtn);
        yOffset += 30;
        
        // Close button
        const closeBtn = this.createMenuButton(
            scene, menuX, menuY + yOffset,
            'Close',
            true,
            () => this.hideBuildMenu(scene)
        );
        buttons.push(...closeBtn);
        
        scene.buildMenu = {
            background: menuBg,
            title: title,
            buttons: buttons
        };
    }

    static showUpgradeMenu(scene, plotIndex) {
        const plot = gameState.plots[plotIndex];
        if (!plot.building || !plot.unlocked) return;

        this.hideBuildMenu(scene);
        this.hideUpgradeMenu(scene);
        
        gameState.selectedPlot = plotIndex;
        gameState.showUpgradeMenu = true;
        
        const plotSprite = scene.gridSprites[plotIndex];
        const menuX = plotSprite.base.x - 60;
        const menuY = plotSprite.base.y - 80;
        
        // Menu background (made taller for demolition button)
        const menuBg = scene.add.rectangle(menuX, menuY, 220, 190, 0x2c1810, 0.9);
        menuBg.setStrokeStyle(2, 0x8b4513);
        
        // Title
        const title = scene.add.text(menuX, menuY - 65, 'Upgrades (Population):', {
            fontSize: '12px',
            fill: '#D4B896',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);
        
        let yOffset = -40;
        const buttons = [];
        
        // Auto-harvest upgrade
        if (!plot.autoHarvest) {
            const autoUpgrade = populationUpgradeCosts.autoHarvest;
            const canAfford = gameState.resources.population >= autoUpgrade.cost;
            const autoBtn = this.createMenuButton(
                scene, menuX, menuY + yOffset,
                `${autoUpgrade.name} (${autoUpgrade.cost}p)`,
                canAfford,
                () => this.purchaseUpgrade(scene, plotIndex, 'autoHarvest')
            );
            buttons.push(...autoBtn);
            yOffset += 25;
        }

        // Speed boost upgrade
        if (plot.productionSpeed < 2.0) {
            const speedUpgrade = populationUpgradeCosts.speedBoost;
            const canAfford = gameState.resources.population >= speedUpgrade.cost;
            const speedBtn = this.createMenuButton(
                scene, menuX, menuY + yOffset,
                `${speedUpgrade.name} (${speedUpgrade.cost}p)`,
                canAfford,
                () => this.purchaseUpgrade(scene, plotIndex, 'speedBoost')
            );
            buttons.push(...speedBtn);
            yOffset += 25;
        }

        // Output multiplier upgrade
        if (plot.harvestMultiplier < 2.0) {
            const multUpgrade = populationUpgradeCosts.outputMultiplier;
            const canAfford = gameState.resources.population >= multUpgrade.cost;
            const multBtn = this.createMenuButton(
                scene, menuX, menuY + yOffset,
                `${multUpgrade.name} (${multUpgrade.cost}p)`,
                canAfford,
                () => this.purchaseUpgrade(scene, plotIndex, 'outputMultiplier')
            );
            buttons.push(...multBtn);
            yOffset += 25;
        }

        // Demolition button
        yOffset += 10; // Add some spacing
        const demolitionBtn = this.createDemolitionButton(
            scene, menuX, menuY + yOffset, plotIndex
        );
        buttons.push(...demolitionBtn);
        yOffset += 25;

        // Close button
        const closeBtn = this.createMenuButton(
            scene, menuX, menuY + yOffset,
            'Close',
            true,
            () => this.hideUpgradeMenu(scene)
        );
        buttons.push(...closeBtn);
        
        scene.upgradeMenu = {
            background: menuBg,
            title: title,
            buttons: buttons
        };
    }

    static showBuyPlotMenu(scene, plotIndex) {
        this.hideBuildMenu(scene);
        this.hideUpgradeMenu(scene);
        
        gameState.selectedPlot = plotIndex;
        gameState.showBuildMenu = true;
        
        const plot = scene.gridSprites[plotIndex];
        const menuX = plot.base.x + 40;
        const menuY = plot.base.y;
        
        // Menu background
        const menuBg = scene.add.rectangle(menuX, menuY, 200, 80, 0x2c1810, 0.9);
        menuBg.setStrokeStyle(2, 0x8b4513);
        
        // Title
        const title = scene.add.text(menuX, menuY - 25, 'Locked Plot', {
            fontSize: '14px',
            fill: '#D4B896',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);
        
        const buttons = [];
        
        // Buy plot button
        const canBuy = gameState.resources.gold >= gameState.nextPlotCost;
        const buyBtn = this.createMenuButton(
            scene, menuX, menuY,
            `Buy (${gameState.nextPlotCost}g)`,
            canBuy,
            () => this.buyPlot(scene, plotIndex)
        );
        buttons.push(...buyBtn);
        
        // Close button
        const closeBtn = this.createMenuButton(
            scene, menuX, menuY + 25,
            'Close',
            true,
            () => this.hideBuildMenu(scene)
        );
        buttons.push(...closeBtn);
        
        scene.buildMenu = {
            background: menuBg,
            title: title,
            buttons: buttons
        };
    }

    static createMenuButton(scene, x, y, text, enabled, callback) {
        const bg = scene.add.rectangle(x, y, 180, 20, enabled ? 0x654321 : 0x444444);
        bg.setStrokeStyle(1, enabled ? 0x8b4513 : 0x666666);
        bg.setInteractive();
        
        const label = scene.add.text(x, y, text, {
            fontSize: '12px',
            fill: enabled ? '#D4B896' : '#666666',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        
        if (enabled) {
            // Use pointerup for better mobile responsiveness
            bg.on('pointerup', (pointer, localX, localY, event) => {
                // Prevent event if it was a drag/swipe
                if (pointer.getDistance() < 10) {
                    callback();
                }
            });

            // Visual feedback for touch
            bg.on('pointerdown', () => bg.setFillStyle(0x8b4513));
            bg.on('pointerup', () => bg.setFillStyle(0x654321));
            bg.on('pointerout', () => bg.setFillStyle(0x654321));
            bg.on('pointerover', () => {
                // Only show hover on non-touch devices
                if (!pointer || !pointer.isDown) {
                    bg.setFillStyle(0x8b4513);
                }
            });
        }
        
        return [bg, label];
    }

    static createDemolitionButton(scene, x, y, plotIndex) {
        const plot = gameState.plots[plotIndex];
        const buildingDef = buildingTypes[plot.building];

        // Calculate demolition info
        const recovery = scene.demolitionSystem.calculateResourceRecovery(buildingDef);
        const populationCost = scene.demolitionSystem.calculatePopulationCost(buildingDef);
        const canAfford = gameState.resources.population >= populationCost;

        // Create button with red styling for demolition
        const bg = scene.add.rectangle(x, y, 180, 20, canAfford ? 0x8B0000 : 0x444444);
        bg.setStrokeStyle(1, canAfford ? 0xFF0000 : 0x666666);
        bg.setInteractive();

        const label = scene.add.text(x, y, `Demolish (${populationCost}p)`, {
            fontSize: '12px',
            fill: canAfford ? '#FFB6C1' : '#666666',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        if (canAfford) {
            bg.on('pointerup', (pointer, localX, localY, event) => {
                if (pointer.getDistance() < 10) {
                    // Hide upgrade menu and show demolition confirmation
                    this.hideUpgradeMenu(scene);
                    this.showDemolitionConfirmation(scene, plotIndex);
                }
            });

            // Visual feedback
            bg.on('pointerdown', () => bg.setFillStyle(0xFF0000));
            bg.on('pointerup', () => bg.setFillStyle(0x8B0000));
            bg.on('pointerout', () => bg.setFillStyle(0x8B0000));
            bg.on('pointerover', () => {
                if (!pointer || !pointer.isDown) {
                    bg.setFillStyle(0xFF0000);
                }
            });
        }

        return [bg, label];
    }

    static showDemolitionConfirmation(scene, plotIndex) {
        const plot = gameState.plots[plotIndex];
        const buildingDef = buildingTypes[plot.building];

        // Calculate recovery resources
        const recovery = scene.demolitionSystem.calculateResourceRecovery(buildingDef);
        const populationCost = scene.demolitionSystem.calculatePopulationCost(buildingDef);

        const centerX = scene.cameras.main.width / 2;
        const centerY = scene.cameras.main.height / 2;

        // Create modal container
        scene.demolitionConfirmModal = scene.add.container(centerX, centerY);

        // Modal background
        const modalBg = scene.add.rectangle(0, 0, 350, 280, 0x2c1810, 0.95);
        modalBg.setStrokeStyle(3, 0x8b4513);

        // Title
        const title = scene.add.text(0, -110, `Demolish ${buildingDef.name}?`, {
            fontSize: '18px',
            fill: '#D4B896',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Recovery text
        const recoveryText = scene.demolitionSystem.formatRecoveryText(recovery);
        const recoveryDisplay = scene.add.text(0, -70, `Recover: ${recoveryText}`, {
            fontSize: '14px',
            fill: '#90EE90',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);

        // Population cost text
        const costText = scene.add.text(0, -40, `Required: ${populationCost} Population (consumed)`, {
            fontSize: '14px',
            fill: '#FFFF00',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);

        // Instruction text
        const instructionText = scene.add.text(0, -10, 'Hold "Confirm" button for 2 seconds to demolish', {
            fontSize: '12px',
            fill: '#CCCCCC',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);

        // Long-press confirm button
        const confirmBtn = this.createLongPressButton(
            scene, -80, 40, 'Confirm\nDemolition', true,
            () => {
                // Execute demolition
                scene.demolitionSystem.executeDemolition(plotIndex);
                this.hideDemolitionConfirmation(scene);
            }
        );

        // Cancel button
        const cancelBtn = this.createMenuButton(
            scene, 80, 40, 'Cancel', true,
            () => this.hideDemolitionConfirmation(scene)
        );

        // Add all elements to modal
        scene.demolitionConfirmModal.add([
            modalBg, title, recoveryDisplay, costText, instructionText,
            ...confirmBtn, ...cancelBtn
        ]);

        // Add to UI container
        if (scene.uiContainer) {
            scene.uiContainer.add(scene.demolitionConfirmModal);
        }
    }

    static createLongPressButton(scene, x, y, text, enabled, callback) {
        const bg = scene.add.rectangle(x, y, 120, 50, enabled ? 0x654321 : 0x444444);
        bg.setStrokeStyle(2, enabled ? 0x8b4513 : 0x666666);
        bg.setInteractive();

        const label = scene.add.text(x, y, text, {
            fontSize: '12px',
            fill: enabled ? '#D4B896' : '#666666',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);

        if (enabled) {
            let longPressTimer = null;
            let isLongPressing = false;
            let progressIndicator = null;

            bg.on('pointerdown', () => {
                if (isLongPressing) return;

                isLongPressing = true;
                bg.setFillStyle(0x8b4513);

                // Create progress indicator
                progressIndicator = scene.add.circle(x, y, 30, 0xFF0000, 0.3);
                scene.demolitionConfirmModal.add(progressIndicator);

                // Animate progress indicator
                scene.tweens.add({
                    targets: progressIndicator,
                    scaleX: 1.5,
                    scaleY: 1.5,
                    alpha: 0.7,
                    duration: 2000,
                    ease: 'Power2'
                });

                // Start long press timer (2 seconds)
                longPressTimer = scene.time.delayedCall(2000, () => {
                    if (isLongPressing) {
                        callback();
                    }
                });
            });

            bg.on('pointerup', () => {
                if (longPressTimer) {
                    longPressTimer.remove();
                    longPressTimer = null;
                }
                if (progressIndicator) {
                    progressIndicator.destroy();
                    progressIndicator = null;
                }
                isLongPressing = false;
                bg.setFillStyle(0x654321);
            });

            bg.on('pointerout', () => {
                if (longPressTimer) {
                    longPressTimer.remove();
                    longPressTimer = null;
                }
                if (progressIndicator) {
                    progressIndicator.destroy();
                    progressIndicator = null;
                }
                isLongPressing = false;
                bg.setFillStyle(0x654321);
            });
        }

        return [bg, label];
    }

    static hideDemolitionConfirmation(scene) {
        if (scene.demolitionConfirmModal) {
            scene.demolitionConfirmModal.destroy();
            scene.demolitionConfirmModal = null;
        }
    }

    static hideBuildMenu(scene) {
        if (scene.buildMenu) {
            scene.buildMenu.background.destroy();
            scene.buildMenu.title.destroy();
            scene.buildMenu.buttons.forEach(btnArray => {
                if (Array.isArray(btnArray)) {
                    btnArray.forEach(element => element.destroy());
                } else {
                    btnArray.destroy();
                }
            });
            scene.buildMenu = null;
        }
        gameState.showBuildMenu = false;
        gameState.selectedPlot = -1;
    }

    static hideUpgradeMenu(scene) {
        if (scene.upgradeMenu) {
            scene.upgradeMenu.background.destroy();
            scene.upgradeMenu.title.destroy();
            scene.upgradeMenu.buttons.forEach(btnArray => {
                if (Array.isArray(btnArray)) {
                    btnArray.forEach(element => element.destroy());
                } else {
                    btnArray.destroy();
                }
            });
            scene.upgradeMenu = null;
        }
        gameState.showUpgradeMenu = false;
        gameState.selectedPlot = -1;
    }

    static canAffordBuilding(buildingType) {
        const cost = buildingTypes[buildingType].cost;
        for (let resource in cost) {
            if (gameState.resources[resource] < cost[resource]) {
                return false;
            }
        }
        return true;
    }

    static buyPlot(scene, plotIndex) {
        const plot = gameState.plots[plotIndex];
        
        if (gameState.resources.gold < gameState.nextPlotCost) return;
        
        // Deduct cost
        gameState.resources.gold -= gameState.nextPlotCost;
        
        // Unlock plot
        plot.unlocked = true;
        
        // Update visual
        const gridSprite = scene.gridSprites[plotIndex];
        gridSprite.base.setFillStyle(0x8FBC8F);
        
        // Increase next plot cost
        gameState.nextPlotCost = Math.floor(gameState.nextPlotCost * 2);
        
        // Update UI through scene
        if (scene.updateUI) {
            scene.updateUI();
        }
        this.hideBuildMenu(scene);
    }

    static purchaseUpgrade(scene, plotIndex, upgradeType) {
        const plot = gameState.plots[plotIndex];
        const upgrade = populationUpgradeCosts[upgradeType];
        
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
        
        // Update UI through scene
        if (scene.updateUI) {
            scene.updateUI();
        }
        this.hideUpgradeMenu(scene);
        
        // Update plot visual if method exists
        if (scene.updatePlotVisual) {
            scene.updatePlotVisual(plotIndex);
        }
    }
}