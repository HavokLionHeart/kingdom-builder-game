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
        
        // Notify demolition system of new building
        if (this.scene && this.scene.demolitionSystem) {
            this.scene.demolitionSystem.onBuildingPlaced(plotIndex);
        }

        // Update visual if scene exists
        if (this.scene && this.scene.recreatePlotVisual) {
            this.scene.recreatePlotVisual(plotIndex);
        }

        // Update UI if available
        if (this.scene && this.scene.uiInstance) {
            this.scene.uiInstance.updateUI();
        }
        
        // Hide build menu if available
        if (this.scene && this.scene.menuSystem) {
            this.scene.menuSystem.hideBuildMenu();
        }
        
        return true;
    }
    
    resetHarvestTimer(plotIndex) {
        const plot = gameState.plots[plotIndex];
        if (!plot.building) return;

        const buildingDef = buildingTypes[plot.building];
        const baseHarvestTime = buildingDef.harvestTime;

        // Apply starvation penalty and production speed
        const starvationMultiplier = gameState.isStarving ? 2 : 1;

        // Apply efficiency bonuses from demolition system
        let efficiencyBonus = 1.0;
        if (this.scene && this.scene.demolitionSystem) {
            const totalBonus = this.scene.demolitionSystem.getTotalEfficiencyBonus(plotIndex);
            efficiencyBonus = 1.0 + totalBonus; // Convert bonus to multiplier
        }

        const effectiveHarvestTime = Math.floor(baseHarvestTime * starvationMultiplier / (plot.productionSpeed * efficiencyBonus));

        plot.nextHarvest = Date.now() + effectiveHarvestTime;
        plot.harvestReady = false;
    }
    
    harvestBuilding(plotIndex) {
        const plot = gameState.plots[plotIndex];
        if (!plot.building || !plot.harvestReady) return false;

        // Prevent manual harvesting of auto-harvest buildings
        if (plot.autoHarvest) return false;

        return this.performHarvest(plotIndex);
    }

    performHarvest(plotIndex) {
        const plot = gameState.plots[plotIndex];
        if (!plot.building || !plot.harvestReady) {
            return false;
        }

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

        // Remove harvest indicator and progress bar if scene exists
        if (this.scene && this.scene.gridSprites) {
            const gridSprite = this.scene.gridSprites[plotIndex];
            if (gridSprite && gridSprite.harvestIndicator) {
                gridSprite.harvestIndicator.destroy();
                gridSprite.harvestIndicator = null;
            }
            if (gridSprite && gridSprite.progressBar) {
                gridSprite.progressBar.destroy();
                gridSprite.progressBg.destroy();
                gridSprite.progressBar = null;
                gridSprite.progressBg = null;
            }
        }

        // Update UI if available
        if (this.scene && this.scene.uiInstance) {
            this.scene.uiInstance.updateUI();
        }

        // Auto-save if SaveSystem exists
        if (typeof SaveSystem !== 'undefined' && SaveSystem.autoSave) {
            SaveSystem.autoSave();
        }

        return true;
    }
    
    updateBuildings() {
        const currentTime = Date.now();
        
        gameState.plots.forEach((plot, index) => {
            if (plot.building && plot.unlocked) {
                // Check if harvest is ready
                if (!plot.harvestReady && currentTime >= plot.nextHarvest) {
                    plot.harvestReady = true;
                }

                // Auto-harvest if enabled and ready
                if (plot.harvestReady && plot.autoHarvest) {
                    this.performHarvest(index);
                }
            }
            
            // Update visual progress if scene exists
            if (this.scene && this.scene.gridSprites) {
                this.updateBuildingVisuals(index, plot, currentTime);
            }
        });
    }
    
    updateBuildingVisuals(index, plot, currentTime) {
        if (!this.scene.gridSprites[index]) return;
        
        const gridSprite = this.scene.gridSprites[index];
        
        if (plot.building && plot.unlocked) {
            const buildingDef = buildingTypes[plot.building];
            const timeRemaining = plot.nextHarvest - currentTime;
            
            if (timeRemaining <= 0 && plot.harvestReady) {
                // Show harvest indicator only for manual harvest buildings
                if (!plot.autoHarvest && !gridSprite.harvestIndicator) {
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
                // Calculate effective harvest time with bonuses
                const starvationMultiplier = gameState.isStarving ? 2 : 1;
                let efficiencyBonus = 1.0;
                if (this.scene && this.scene.demolitionSystem) {
                    const totalBonus = this.scene.demolitionSystem.getTotalEfficiencyBonus(index);
                    efficiencyBonus = 1.0 + totalBonus;
                }
                const effectiveHarvestTime = Math.floor(buildingDef.harvestTime * starvationMultiplier / (plot.productionSpeed * efficiencyBonus));

                // Calculate progress based on effective time
                const progress = 1 - (timeRemaining / effectiveHarvestTime);

                if (!gridSprite.progressBg) {
                    // Create progress bar background
                    gridSprite.progressBg = this.scene.add.rectangle(
                        gridSprite.base.x,
                        gridSprite.base.y + 35,
                        50, 6,
                        0x333333
                    );
                    gridSprite.progressBg.setStrokeStyle(1, 0x000000);

                    // Add to world container
                    if (this.scene.worldContainer) {
                        this.scene.worldContainer.add(gridSprite.progressBg);
                    }
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

                // Add to world container
                if (this.scene.worldContainer) {
                    this.scene.worldContainer.add(gridSprite.progressBar);
                }
            }
        }
    }
    
    getBuildingProgress(plotIndex) {
        const plot = gameState.plots[plotIndex];
        if (!plot.building || plot.harvestReady) return 1;

        const buildingDef = buildingTypes[plot.building];
        const currentTime = Date.now();
        const timeRemaining = plot.nextHarvest - currentTime;

        if (timeRemaining <= 0) return 1;

        // Calculate effective harvest time with all bonuses
        const starvationMultiplier = gameState.isStarving ? 2 : 1;
        let efficiencyBonus = 1.0;
        if (this.scene && this.scene.demolitionSystem) {
            const totalBonus = this.scene.demolitionSystem.getTotalEfficiencyBonus(plotIndex);
            efficiencyBonus = 1.0 + totalBonus;
        }
        const effectiveHarvestTime = Math.floor(buildingDef.harvestTime * starvationMultiplier / (plot.productionSpeed * efficiencyBonus));

        return Math.max(0, 1 - (timeRemaining / effectiveHarvestTime));
    }
    
    getAvailableBuildings(plotIndex) {
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