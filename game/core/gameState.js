// Game state management
const gameState = {
    resources: {
        food: 50,
        wood: 0,
        stone: 0,
        gold: 20,
        population: 0
    },
    plots: [],
    selectedPlot: -1,
    showBuildMenu: false,
    showUpgradeMenu: false,
    nextPlotCost: 10,
    isStarving: false,
    lastFoodConsumption: Date.now(),
    foodConsumptionRate: 30000, // 30 seconds
    
    // Initialize plots
    init() {
        this.plots = [];
        for (let i = 0; i < 9; i++) {
            this.plots.push({
                unlocked: i === 4, // Center plot starts unlocked
                building: null,
                nextHarvest: 0,
                harvestReady: false,
                level: 1,
                evolution: 0,
                
                // Upgrade properties
                autoHarvest: false,
                productionSpeed: 1.0,
                harvestMultiplier: 1.0,
                speedLevel: 0,
                outputLevel: 0,
                hasAutomation: false
            });
        }
    }
};

// Population-based upgrades
const populationUpgrades = {
    autoHarvest: {
        name: 'Auto-Harvest',
        cost: 3,
        description: 'Building harvests automatically'
    },
    speedBoost: {
        name: 'Speed Boost',
        cost: 2,
        description: 'Doubles production speed'
    },
    outputMultiplier: {
        name: 'Output Boost',
        cost: 5,
        description: 'Doubles harvest output'
    }
};

// Evolution tier colors and names
const evolutionTiers = {
    0: { color: 0xFFFFFF, name: 'Base', maxLevel: 10 },     // White
    1: { color: 0x00FF00, name: 'Tier 1', maxLevel: 20 },  // Green
    2: { color: 0x0080FF, name: 'Tier 2', maxLevel: 30 },  // Blue
    3: { color: 0x8000FF, name: 'Tier 3', maxLevel: 40 },  // Purple
    4: { color: 0xFF8000, name: 'Tier 4', maxLevel: 50 },  // Orange
    5: { color: 0x000000, name: 'Tier 5', maxLevel: 60 },  // Black
    6: { color: 0xFFD700, name: 'Tier 6', maxLevel: 70 }   // Gold
};

// Building evolution chains
const buildingEvolutions = {
    shelter: [
        'Shelter', 'Peasant Hut', 'House', 'Mansion', 'Estate', 'Castle', 'Palace'
    ],
    wheatField: [
        'Wheat Field', 'Barley Farm', 'Grain Estate', 'Agricultural Manor', 
        'Harvest Plantation', 'Royal Granary', 'Imperial Breadbasket'
    ],
    woodcuttersHut: [
        "Woodcutter's Hut", 'Lumber Mill', 'Timber Yard', 'Forest Outpost',
        'Woodland Estate', 'Ancient Grove', 'World Tree'
    ]
};

// Building definitions with evolution support
const buildingTypes = {
    wheatField: {
        baseId: 'wheatField',
        evolution: 0,
        name: 'Wheat Field',
        cost: { food: 10 },
        harvestTime: 60000, // 60 seconds
        produces: { food: 10 },
        color: 0xDAA520,
        description: 'Produces 10 food every 60 seconds'
    },
    woodcuttersHut: {
        baseId: 'woodcuttersHut',
        evolution: 0,
        name: "Woodcutter's Hut",
        cost: { food: 10, wood: 10 },
        harvestTime: 10000, // 10 seconds
        produces: { wood: 1 },
        color: 0x8B4513,
        description: 'Produces 1 wood every 10 seconds'
    },
    shelter: {
        baseId: 'shelter',
        evolution: 0,
        name: 'Shelter',
        cost: { wood: 15 },
        harvestTime: 240000, // 4 minutes
        produces: { population: 1 },
        color: 0x654321,
        description: 'Produces 1 population every 240 seconds'
    }
};

// Initialize game state
gameState.init();