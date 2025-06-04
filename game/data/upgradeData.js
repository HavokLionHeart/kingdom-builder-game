// Upgrade data and configuration - NO CLASS DEFINITIONS
// This file contains only data, the UpgradeSystem class is in upgradeSystem.js

// Note: populationUpgradeCosts is now defined in gameState.js to avoid dependency issues

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