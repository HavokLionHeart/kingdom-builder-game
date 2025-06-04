// Resource management system
class ResourceSystem {
    constructor(scene) {
        this.scene = scene;
    }

    consumeFood() {
        const foodNeeded = gameState.resources.population;
        
        if (gameState.resources.food >= foodNeeded) {
            gameState.resources.food -= foodNeeded;
            gameState.isStarving = false;
            if (this.scene && this.scene.uiInstance) {
                this.scene.uiInstance.updateStarvationWarning('');
            }
        } else {
            gameState.isStarving = true;
            if (this.scene && this.scene.uiInstance) {
                this.scene.uiInstance.updateStarvationWarning('⚠️ STARVING! Production halved until fed!');
            }
                
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
        if (this.scene && this.scene.uiInstance) {
            this.scene.uiInstance.updateUI();
        }
    }

    processOfflineProgress(offlineTime) {
        if (offlineTime <= 0) return;
        
        // Simulate offline progress for auto-harvest buildings only
        gameState.plots.forEach((plot, index) => {
            if (plot.building && plot.unlocked && plot.autoHarvest) {
                const buildingDef = buildingTypes[plot.building];
                const harvestTime = buildingDef.harvestTime / plot.productionSpeed;
                const harvests = Math.floor(offlineTime / harvestTime);
                
                if (harvests > 0) {
                    Object.keys(buildingDef.produces).forEach(resource => {
                        const baseAmount = buildingDef.produces[resource];
                        const totalAmount = baseAmount * plot.harvestMultiplier * harvests;
                        gameState.resources[resource] += Math.floor(totalAmount);
                    });
                    
                    // Update next harvest time
                    const remainingTime = offlineTime % harvestTime;
                    plot.nextHarvest = Date.now() + (harvestTime - remainingTime);
                    plot.harvestReady = false;
                }
            }
        });
        
        // Process offline food consumption
        const consumptionCycles = Math.floor(offlineTime / gameState.foodConsumptionRate);
        for (let i = 0; i < consumptionCycles; i++) {
            this.consumeFood();
        }
        
        // Update last consumption time
        const remainingConsumptionTime = offlineTime % gameState.foodConsumptionRate;
        gameState.lastFoodConsumption = Date.now() - remainingConsumptionTime;
    }
    
    canAffordCost(cost) {
        for (let resource in cost) {
            if (gameState.resources[resource] < cost[resource]) {
                return false;
            }
        }
        return true;
    }
    
    deductCost(cost) {
        if (!this.canAffordCost(cost)) return false;
        
        for (let resource in cost) {
            gameState.resources[resource] -= cost[resource];
        }
        return true;
    }
    
    formatCost(cost) {
        const parts = [];
        for (let resource in cost) {
            const abbreviation = this.getResourceAbbreviation(resource);
            parts.push(`${cost[resource]}${abbreviation}`);
        }
        return parts.join(', ');
    }
    
    getResourceAbbreviation(resource) {
        const abbreviations = {
            food: 'f',
            wood: 'w', 
            stone: 's',
            gold: 'g',
            population: 'p'
        };
        return abbreviations[resource] || resource.charAt(0);
    }
    
    getResourceColor(resource) {
        // Safe fallback colors if GAME_CONSTANTS not defined
        const defaultColors = {
            food: gameState.isStarving ? 0xFF0000 : 0x00FF00,
            wood: 0x8B4513,
            stone: 0x808080,
            gold: 0xFFD700,
            population: 0x0080FF
        };
        
        if (typeof GAME_CONSTANTS !== 'undefined' && GAME_CONSTANTS.COLORS) {
            const colors = {
                food: gameState.isStarving ? GAME_CONSTANTS.COLORS.FOOD_STARVING : GAME_CONSTANTS.COLORS.FOOD_NORMAL,
                wood: GAME_CONSTANTS.COLORS.WOOD,
                stone: GAME_CONSTANTS.COLORS.STONE,
                gold: GAME_CONSTANTS.COLORS.GOLD,
                population: GAME_CONSTANTS.COLORS.POPULATION
            };
            return colors[resource] || GAME_CONSTANTS.COLORS.TEXT_PRIMARY;
        }
        
        return defaultColors[resource] || 0xFFFFFF;
    }

    buyPlot(plotIndex) {
        const plot = gameState.plots[plotIndex];
        
        if (gameState.resources.gold < gameState.nextPlotCost) return;
        
        // Deduct cost
        gameState.resources.gold -= gameState.nextPlotCost;
        
        // Unlock plot
        plot.unlocked = true;
        
        // Update visual if scene exists
        if (this.scene && this.scene.gridSprites && this.scene.gridSprites[plotIndex]) {
            const gridSprite = this.scene.gridSprites[plotIndex];
            if (gridSprite.base) {
                gridSprite.base.setFillStyle(0x8FBC8F);
            }
        }
        
        // Increase next plot cost
        gameState.nextPlotCost = Math.floor(gameState.nextPlotCost * 2);
        
        if (this.scene && this.scene.uiInstance) {
            this.scene.uiInstance.updateUI();
        }
        if (this.scene && this.scene.menuSystem) {
            this.scene.menuSystem.hideBuildMenu();
        }
    }

    purchaseUpgrade(plotIndex, upgradeType) {
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
        
        if (this.scene && this.scene.uiInstance) {
            this.scene.uiInstance.updateUI();
        }
        if (this.scene && this.scene.menuSystem) {
            this.scene.menuSystem.hideUpgradeMenu();
        }
        if (this.scene && this.scene.recreatePlotVisual) {
            this.scene.recreatePlotVisual(plotIndex);
        }
    }

    // Convenience methods for backward compatibility with static calls
    static canAfford(cost) {
        // Static method that works without scene reference
        for (let resource in cost) {
            if (gameState.resources[resource] < cost[resource]) {
                return false;
            }
        }
        return true;
    }

    static spendResources(cost) {
        // Static method that works without scene reference
        if (!this.canAfford(cost)) return false;
        
        for (let resource in cost) {
            gameState.resources[resource] -= cost[resource];
        }
        return true;
    }

    static addResources(resources) {
        // Static method that works without scene reference
        for (let resource in resources) {
            if (gameState.resources.hasOwnProperty(resource)) {
                gameState.resources[resource] += resources[resource];
            }
        }
    }

    getStarvationStatus() {
        if (gameState.isStarving) {
            return '⚠️ STARVING! Production halved until fed!';
        }
        return '';
    }

    static checkFoodConsumption() {
        // Static method for checking if food consumption is due
        const currentTime = Date.now();
        return currentTime - gameState.lastFoodConsumption >= gameState.foodConsumptionRate;
    }
}