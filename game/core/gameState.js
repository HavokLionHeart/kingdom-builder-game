        const gameState = {
            resources: {
                food: 50,
                wood: 0,
                stone: 0,
                gold: 0,
                population: 2
            },
            plots: Array(9).fill(null).map((_, i) => ({
                unlocked: i < 2,
                building: null,
                harvestReady: false,
                nextHarvest: 0,
                // Future upgrade system
                level: 1,
                productionSpeed: 1.0,
                harvestMultiplier: 1.0,
                autoHarvest: false
            })),
            nextPlotCost: 100,
            selectedPlot: -1,
            showBuildMenu: false,
            showUpgradeMenu: false,
            lastSaved: Date.now(),
            totalPlayTime: 0,
            // Food consumption tracking
            lastFoodConsumption: Date.now(),
            foodConsumptionRate: 120000, // 2 minutes per food consumption
            isStarving: false
        };