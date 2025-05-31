// Save/Load system with offline progress
const SaveSystem = {
    saveKey: 'kingdomBuilder_save',
    version: '1.0',
    
    save() {
        const saveData = {
            version: this.version,
            timestamp: Date.now(),
            resources: { ...gameState.resources },
            plots: gameState.plots.map(plot => ({
                unlocked: plot.unlocked,
                building: plot.building,
                nextHarvest: plot.nextHarvest,
                harvestReady: plot.harvestReady,
                level: plot.level,
                evolution: plot.evolution,
                autoHarvest: plot.autoHarvest,
                productionSpeed: plot.productionSpeed,
                harvestMultiplier: plot.harvestMultiplier,
                speedLevel: plot.speedLevel,
                outputLevel: plot.outputLevel,
                hasAutomation: plot.hasAutomation
            })),
            nextPlotCost: gameState.nextPlotCost,
            isStarving: gameState.isStarving,
            lastFoodConsumption: gameState.lastFoodConsumption
        };
        
        try {
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            console.log('Game saved successfully');
        } catch (error) {
            console.error('Failed to save game:', error);
        }
    },
    
    load() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            if (!saveData) {
                console.log('No save data found, starting new game');
                return false;
            }
            
            const data = JSON.parse(saveData);
            
            // Version check
            if (data.version !== this.version) {
                console.log('Save data version mismatch, starting new game');
                return false;
            }
            
            // Calculate offline progress
            const offlineTime = Date.now() - data.timestamp;
            
            // Restore game state
            gameState.resources = { ...data.resources };
            gameState.nextPlotCost = data.nextPlotCost || 10;
            gameState.isStarving = data.isStarving || false;
            gameState.lastFoodConsumption = data.lastFoodConsumption || Date.now();
            
            // Restore plots
            data.plots.forEach((savedPlot, index) => {
                const plot = gameState.plots[index];
                Object.assign(plot, savedPlot);
                
                // Apply offline progress for buildings in production
                if (plot.building && !plot.harvestReady && plot.nextHarvest > 0) {
                    const timeRemaining = plot.nextHarvest - data.timestamp;
                    if (timeRemaining <= offlineTime) {
                        // Building finished while offline
                        plot.harvestReady = true;
                        plot.nextHarvest = Date.now();
                        
                        // If auto-harvest is enabled, collect automatically
                        if (plot.autoHarvest) {
                            this.autoHarvestBuilding(plot, index);
                        }
                    } else {
                        // Update harvest time for remaining production
                        plot.nextHarvest = Date.now() + (timeRemaining - offlineTime);
                    }
                }
            });
            
            // Handle offline food consumption
            if (offlineTime > 0) {
                this.processOfflineFoodConsumption(offlineTime);
            }
            
            console.log(`Game loaded successfully. Offline time: ${Math.floor(offlineTime / 1000)}s`);
            return true;
            
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    },
    
    processOfflineFoodConsumption(offlineTime) {
        const consumptionInterval = gameState.foodConsumptionRate;
        const consumptionCycles = Math.floor(offlineTime / consumptionInterval);
        
        for (let i = 0; i < consumptionCycles; i++) {
            const foodNeeded = gameState.resources.population;
            
            if (gameState.resources.food >= foodNeeded) {
                gameState.resources.food -= foodNeeded;
                gameState.isStarving = false;
            } else {
                gameState.isStarving = true;
                break;
            }
        }
        
        gameState.lastFoodConsumption = Date.now() - (offlineTime % consumptionInterval);
    },
    
    autoHarvestBuilding(plot, plotIndex) {
        if (!plot.building || !plot.harvestReady) return;
        
        const buildingDef = buildingTypes[plot.building];
        const starvationMultiplier = gameState.isStarving ? 0.5 : 1;
        
        // Add resources with modifiers
        Object.keys(buildingDef.produces).forEach(resource => {
            const baseAmount = buildingDef.produces[resource];
            const finalAmount = Math.floor(baseAmount * plot.harvestMultiplier * starvationMultiplier);
            gameState.resources[resource] += finalAmount;
        });
        
        // Reset harvest timer
        const baseHarvestTime = buildingDef.harvestTime;
        const starvationTimeMultiplier = gameState.isStarving ? 2 : 1;
        const harvestTime = Math.floor(baseHarvestTime * starvationTimeMultiplier / plot.productionSpeed);
        
        plot.nextHarvest = Date.now() + harvestTime;
        plot.harvestReady = false;
    },
    
    autoSave() {
        this.save();
    },
    
    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            console.log('Save data deleted');
            return true;
        } catch (error) {
            console.error('Failed to delete save:', error);
            return false;
        }
    }
};