// Building system for managing construction and production
class BuildingSystem {
    static canAffordBuilding(buildingType) {
        const cost = buildingTypes[buildingType].cost;
        for (let resource in cost) {
            if (gameState.resources[resource] < cost[resource]) {
                return false;
            }
        }
        return true;
    }
    
    static buildBuilding(plotIndex, buildingType) {
        const plot = gameState.plots[plotIndex];
        const buildingDef = buildingTypes[buildingType];
        
        if (!plot.unlocked || plot.building || !this.canAffordBuilding(buildingType)) {
            return false;
        }
        
        // Deduct cost
        Object.keys(buildingDef.cost).forEach(resource => {
            gameState.resources[resource] -= buildingDef.cost[resource];
        });
        
        // Create building
        plot.building = buildingType;
        plot.level = 1;
        plot.speedLevel = 0;
        plot.outputLevel = 0;
        plot.autoHarvest = false;
        plot.productionSpeed = 1.0;
        plot.harvestMultiplier = 1.0;
        plot.harvestReady = false;
        
        // Set initial harvest time
        this.resetHarvestTimer(plotIndex);
        
        return true;
    }
    
    static resetHarvestTimer(plotIndex) {
        const plot = gameState.plots[plotIndex];
        if (!plot.building) return;
        
        const buildingDef = buildingTypes[plot.building];
        const baseHarvestTime = buildingDef.harvestTime;
        
        // Apply starvation penalty and production speed
        const starvationMultiplier = gameState.isStarving ? 2 : 1;
        const effectiveHarvestTime = Math.floor(baseHarvestTime * starvationMultiplier / plot.productionSpeed);
        
        plot.nextHarvest = Date.now() + effectiveHarvestTime;
        plot.harvestReady = false;
    }
    
    static harvestBuilding(plotIndex) {
        const plot = gameState.plots[plotIndex];
        if (!plot.building || !plot.harvestReady || plot.autoHarvest) return false;
        
        const buildingDef = buildingTypes[plot.building];
        
        // Apply starvation penalty to output
        const starvationMultiplier = gameState.isStarving ? 0.5 : 1;
        
        // Add resources with multipliers
        Object.keys(buildingDef.produces).forEach(resource => {
            const baseAmount = buildingDef.produces[resource];
            const finalAmount = Math.floor(baseAmount * plot.harvestMultiplier * starvationMultiplier);
            gameState.resources[resource] += finalAmount;
        });
        
        // Reset harvest timer
        this.resetHarvestTimer(plotIndex);
        
        return true;
    }
    
    static updateBuildings() {
        const currentTime = Date.now();
        
        gameState.plots.forEach((plot, index) => {
            if (plot.building && plot.unlocked && !plot.harvestReady) {
                if (currentTime >= plot.nextHarvest) {
                    plot.harvestReady = true;
                    
                    // Auto-harvest if enabled
                    if (plot.autoHarvest) {
                        this.harvestBuilding(index);
                    }
                }
            }
        });
    }
    
    static getBuildingProgress(plotIndex) {
        const plot = gameState.plots[plotIndex];
        if (!plot.building || plot.harvestReady) return 1;
        
        const buildingDef = buildingTypes[plot.building];
        const currentTime = Date.now();
        const timeRemaining = plot.nextHarvest - currentTime;
        
        if (timeRemaining <= 0) return 1;
        
        const totalTime = buildingDef.harvestTime / plot.productionSpeed;
        return Math.max(0, 1 - (timeRemaining / totalTime));
    }
    
    static getAvailableBuildings(plotIndex) {
        const plot = gameState.plots[plotIndex];
        if (!plot.unlocked || plot.building) return [];
        
        const available = [];
        
        Object.keys(buildingTypes).forEach(buildingType => {
            const buildingDef = buildingTypes[buildingType];
            available.push({
                type: buildingType,
                ...buildingDef,
                canAfford: this.canAffordBuilding(buildingType)
            });
        });
        
        return available;
    }
}