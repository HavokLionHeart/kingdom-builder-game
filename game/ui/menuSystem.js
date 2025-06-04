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
        const menuBg = scene.add.rectangle(menuX, menuY, 160, 120, 0x2c1810, 0.9);
        menuBg.setStrokeStyle(2, 0x8b4513);
        
        // Title
        const title = scene.add.text(menuX, menuY - 75, 'Build:', {
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
                    scene.buildingSystem.placeBuilding(gameState.selectedPlot, 'wheatField');
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
                    scene.buildingSystem.placeBuilding(gameState.selectedPlot, 'woodcuttersHut');
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
                    scene.buildingSystem.placeBuilding(gameState.selectedPlot, 'shelter');
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
        
        // Menu background
        const menuBg = scene.add.rectangle(menuX, menuY, 200, 160, 0x2c1810, 0.9);
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
            const autoUpgrade = populationUpgrades.autoHarvest;
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
            const speedUpgrade = populationUpgrades.speedBoost;
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
            const multUpgrade = populationUpgrades.outputMultiplier;
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
        const menuBg = scene.add.rectangle(menuX, menuY, 160, 80, 0x2c1810, 0.9);
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
        const bg = scene.add.rectangle(x, y, 140, 20, enabled ? 0x654321 : 0x444444);
        bg.setStrokeStyle(1, enabled ? 0x8b4513 : 0x666666);
        bg.setInteractive();
        
        const label = scene.add.text(x, y, text, {
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