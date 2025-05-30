// Building definitions - Fixed to match README
        const buildingTypes = {
            wheatField: {
                name: 'Wheat Field',
                cost: { food: 10 }, // Changed from gold to food
                harvestTime: 60000, // 60 seconds
                produces: { food: 10 }, // Changed from gold to food
                color: 0xDAA520,
                description: 'Produces 10 food every 60 seconds'
            },
            woodcuttersHut: {
                name: "Woodcutter's Hut",
                cost: { food: 10, wood: 10 },
                harvestTime: 10000, // 10 seconds as per README
                produces: { wood: 1 },
                color: 0x8B4513,
                description: 'Produces 1 wood every 10 seconds'
            },
            shelter: {
                name: 'Shelter',
                cost: { wood: 15 }, // Changed from food to wood
                harvestTime: 240000, // 4 minutes (240 seconds)
                produces: { population: 1 },
                color: 0x654321,
                description: 'Produces 1 population every 240 seconds'
            }
        };

        // Population upgrade costs and effects
        const populationUpgrades = {
            autoHarvest: {
                name: 'Auto-Harvest',
                cost: 3,
                description: 'Building harvests automatically'
            },
            speedBoost: {
                name: 'Speed Boost',
                cost: 2,
                description: '+25% production speed'
            },
            outputMultiplier: {
                name: 'Output Boost',
                cost: 5,
                description: '+50% resource output'
            }
        };