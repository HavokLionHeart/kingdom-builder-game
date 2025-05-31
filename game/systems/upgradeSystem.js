// Upgrade system for managing building improvements
class BuildingUpgradeSystem {
    static purchaseUpgrade(plotIndex, upgradeType) {
        const plot = gameState.plots[plotIndex];
        if (!plot.building || !plot.unlocked) return false;
        
        const upgrade = populationUpgrades[upgradeType];
        if (!upgrade) return false;
        
        // Check if can afford
        if (gameState.resources.population < upgrade.cost) return false;
        
        // Check if already has upgrade (for single-purchase upgrades)
        if (upgradeType === 'autoHarvest' && plot.autoHarvest) return false;
        if (upgradeType === 'speedBoost' && plot.productionSpeed >= 2.0) return false;
        if (upgradeType === 'outputMultiplier' && plot.harvestMultiplier >= 2.0) return false;
        
        // Purchase upgrade
        gameState.resources.population -= upgrade.cost;
        
        // Apply upgrade effect
        switch (upgradeType) {
            case 'autoHarvest':
                plot.autoHarvest = true;
                break;
            case 'speedBoost':
                plot.productionSpeed = upgrade.multiplier;
                // Adjust current harvest time if in progress
                if (plot.nextHarvest > Date.now()) {
                    const timeRemaining = plot.nextHarvest - Date.now();
                    plot.nextHarvest = Date.now() + Math.floor(timeRemaining / upgrade.multiplier);
                }
                break;
            case 'outputMultiplier':
                plot.harvestMultiplier = upgrade.multiplier;
                break;
        }
        
        return true;
    }
    
    static getAvailableUpgrades(plotIndex) {
        const plot = gameState.plots[plotIndex];
        if (!plot.building || !plot.unlocked) return [];
        
        const available = [];
        
        // Auto-harvest upgrade
        if (!plot.autoHarvest) {
            available.push({
                type: 'autoHarvest',
                ...populationUpgrades.autoHarvest,
                canAfford: gameState.resources.population >= populationUpgrades.autoHarvest.cost
            });
        }
        
        // Speed boost upgrade
        if (plot.productionSpeed < 2.0) {
            available.push({
                type: 'speedBoost',
                ...populationUpgrades.speedBoost,
                canAfford: gameState.resources.population >= populationUpgrades.speedBoost.cost
            });
        }
        
        // Output multiplier upgrade
        if (plot.harvestMultiplier < 2.0) {
            available.push({
                type: 'outputMultiplier',
                ...populationUpgrades.outputMultiplier,
                canAfford: gameState.resources.population >= populationUpgrades.outputMultiplier.cost
            });
        }
        
        return available;
    }
    
    static hasUpgrades(plotIndex) {
        return this.getAvailableUpgrades(plotIndex).length > 0;
    }
}