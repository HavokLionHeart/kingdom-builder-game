// Resource management system
class ResourceSystem {
    static consumeFood() {
        const foodNeeded = gameState.resources.population;
        
        if (gameState.resources.food >= foodNeeded) {
            gameState.resources.food -= foodNeeded;
            gameState.isStarving = false;
        } else {
            gameState.isStarving = true;
            
            // Apply starvation penalty to all buildings in progress
            gameState.plots.forEach((plot, index) => {
                if (plot.building && plot.unlocked && !plot.harvestReady) {
                    const currentTime = Date.now();
                    const timeRemaining = plot.nextHarvest - currentTime;
                    if (timeRemaining > 0) {
                        // Double the remaining time
                        plot.nextHarvest = currentTime + (timeRemaining * 2);
                    }
                }
            });
        }
        
        gameState.lastFoodConsumption = Date.now();
    }
    
    static processOfflineProgress(offlineTime) {
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
    
    static canAffordCost(cost) {
        for (let resource in cost) {
            if (gameState.resources[resource] < cost[resource]) {
                return false;
            }
        }
        return true;
    }
    
    static deductCost(cost) {
        if (!this.canAffordCost(cost)) return false;
        
        for (let resource in cost) {
            gameState.resources[resource] -= cost[resource];
        }
        return true;
    }
    
    static formatCost(cost) {
        const parts = [];
        for (let resource in cost) {
            const abbreviation = this.getResourceAbbreviation(resource);
            parts.push(`${cost[resource]}${abbreviation}`);
        }
        return parts.join(', ');
    }
    
    static getResourceAbbreviation(resource) {
        const abbreviations = {
            food: 'f',
            wood: 'w', 
            stone: 's',
            gold: 'g',
            population: 'p'
        };
        return abbreviations[resource] || resource.charAt(0);
    }
    
    static getResourceColor(resource) {
        const colors = {
            food: gameState.isStarving ? GAME_CONSTANTS.COLORS.FOOD_STARVING : GAME_CONSTANTS.COLORS.FOOD_NORMAL,
            wood: GAME_CONSTANTS.COLORS.WOOD,
            stone: GAME_CONSTANTS.COLORS.STONE,
            gold: GAME_CONSTANTS.COLORS.GOLD,
            population: GAME_CONSTANTS.COLORS.POPULATION
        };
        return colors[resource] || GAME_CONSTANTS.COLORS.TEXT_PRIMARY;
    }
}