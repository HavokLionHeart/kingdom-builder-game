// Population-based upgrade definitions
const populationUpgrades = {
    autoHarvest: {
        name: 'Auto-Harvest',
        description: 'Automatically harvest when ready',
        cost: 2,
        effect: 'autoHarvest'
    },
    speedBoost: {
        name: 'Speed Boost',
        description: 'Double production speed',
        cost: 3,
        effect: 'productionSpeed',
        multiplier: 2.0
    },
    outputMultiplier: {
        name: 'Output Boost',
        description: 'Double harvest output',
        cost: 5,
        effect: 'harvestMultiplier',
        multiplier: 2.0
    }
};

// Upgrade system class for managing building upgrades
class UpgradeSystem {
    static applyUpgrades(plot) {
        // Reset to base values
        plot.productionSpeed = 1.0;
        plot.harvestMultiplier = 1.0;
        
        // Apply upgrades based on plot properties
        if (plot.speedLevel > 0) {
            plot.productionSpeed = Math.pow(1.5, plot.speedLevel);
        }
        
        if (plot.outputLevel > 0) {
            plot.harvestMultiplier = Math.pow(1.3, plot.outputLevel);
        }
    }
    
    static getSpeedUpgradeCost(buildingType, currentLevel) {
        return Math.floor(10 * Math.pow(2, currentLevel));
    }
    
    static getOutputUpgradeCost(buildingType, currentLevel) {
        return Math.floor(20 * Math.pow(2, currentLevel));
    }
}