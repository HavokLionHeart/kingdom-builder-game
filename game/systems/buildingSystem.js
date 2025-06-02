// Building system for managing construction and production
class BuildingSystem {
    constructor(scene) {
        this.scene = scene;
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
    
     buildBuilding(plotIndex, buildingType) {
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
    class BuildingSystem {
    constructor(scene) {
        this.scene = scene;
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
        this.scene.recreatePlotVisual(plotIndex);
        
        this.scene.uiElements.updateUI();
        this.scene.menuSystem.hideBuildMenu();
    }

    harvestBuilding(plotIndex) {
        const plot = gameState.plots[plotIndex];
        if (!plot.building || !plot.harvestReady) return;
        
        const buildingDef = buildingTypes[plot.building];
        
        // Apply starvation penalty to output if starving
        const starvationMultiplier = gameState.isStarving ? 0.5 : 1;
        
        // Add resources (with starvation penalty and upgrade multipliers)
        Object.keys(buildingDef.produces).forEach(resource => {
            const baseAmount = buildingDef.produces[resource];
            const finalAmount = Math.floor(baseAmount * plot.harvestMultiplier * starvationMultiplier);
            gameState.resources[resource] += finalAmount;
        });
        
        // Reset harvest timer (with starvation penalty and upgrade speed multipliers)
        const baseHarvestTime = buildingDef.harvestTime;
        const starvationTimeMultiplier = gameState.isStarving ? 2 : 1;
        const harvestTime = Math.floor(baseHarvestTime * starvationTimeMultiplier / plot.productionSpeed);
        
        plot.nextHarvest = Date.now() + harvestTime;
        plot.harvestReady = false;
        
        // Remove harvest indicator and progress bar
        const gridSprite = this.scene.gridSprites[plotIndex];
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
        
        this.scene.uiElements.updateUI();
        SaveSystem.autoSave(); // Save after harvest
    }

    updateBuildings() {
        const currentTime = Date.now();
        
        gameState.plots.forEach((plot, index) => {
            const gridSprite = this.scene.gridSprites[index];
            
            if (plot.building && plot.unlocked) {
                const buildingDef = buildingTypes[plot.building];
                const timeRemaining = plot.nextHarvest - currentTime;
                
                // Auto-harvest if enabled
                if (plot.autoHarvest && timeRemaining <= 0 && !plot.harvestReady) {
                    plot.harvestReady = true;
                    this.harvestBuilding(index);
                    return; // Skip visual updates since we just harvested
                }
                
                if (timeRemaining <= 0 && !plot.harvestReady) {
                    // Ready to harvest
                    plot.harvestReady = true;
                    
                    // Show harvest indicator
                    if (!gridSprite.harvestIndicator) {
                        gridSprite.harvestIndicator = this.scene.add.circle(
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
                        gridSprite.progressBg = this.scene.add.rectangle(
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
                    gridSprite.progressBar = this.scene.add.rectangle(
                        gridSprite.base.x - 24 + barWidth/2, 
                        gridSprite.base.y + 35, 
                        barWidth, 4, 
                        0x00FF00
                    );
                }
            }
        });
    }

    canAffordCost(cost) {
        for (let resource in cost) {
            if (gameState.resources[resource] < cost[resource]) {
                return false;
            }
        }
        return true;
    }

    formatCost(cost) {
        const parts = [];
        for (let resource in cost) {
            parts.push(`${cost[resource]} ${resource.charAt(0)}`);
        }
        return parts.join(', ');
    }
}
}