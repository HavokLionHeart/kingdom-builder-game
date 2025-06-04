// Upgrade data and configuration - NO CLASS DEFINITIONS
// This file contains only data, the UpgradeSystem class is in upgradeSystem.js

// Population-based upgrade costs and descriptions
const populationUpgradeCosts = {
    autoHarvest: {
        name: 'Auto-Harvest',
        cost: 3,
        description: 'Building harvests automatically'
    },
    speedBoost: {
        name: 'Speed Boost', 
        cost: 2,
        description: 'Increases production speed'
    },
    outputMultiplier: {
        name: 'Output Boost',
        cost: 5,
        description: 'Increases harvest output'
    }
};

// Gold-based upgrade cost formulas
const upgradeFormulas = {
    speed: {
        baseCost: 10,
        multiplier: 2,
        calculateCost: (level) => Math.floor(10 * Math.pow(2, level))
    },
    output: {
        baseCost: 20,
        multiplier: 2,
        calculateCost: (level) => Math.floor(20 * Math.pow(2, level))
    }
};

// Upgrade effect multipliers
const upgradeEffects = {
    speedMultiplier: 1.5,
    outputMultiplier: 1.3
};