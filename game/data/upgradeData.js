// Upgrade system class for managing building upgrades
class UpgradeSystem {
    static applyUpgrades(plot) {
        // Reset to base values
        plot.productionSpeed = 1.0;
        plot.harvestMultiplier = 1.0;
        
        // Apply speed upgrades
        if (plot.speedLevel > 0) {
            plot.productionSpeed = Math.pow(1.5, plot.speedLevel);
        }
        
        // Apply output upgrades
        if (plot.outputLevel > 0) {
            plot.harvestMultiplier = Math.pow(1.3, plot.outputLevel);
        }
        
        // Apply evolution bonuses if building has evolved
        if (plot.evolution > 0) {
            const evolutionBonus = EvolutionSystem.getEvolutionBonus(plot.evolution);
            plot.productionSpeed *= evolutionBonus.speedMultiplier;
            plot.harvestMultiplier *= evolutionBonus.outputMultiplier;
        }
    }
    
    static getSpeedUpgradeCost(buildingType, currentLevel) {
        return Math.floor(10 * Math.pow(2, currentLevel));
    }
    
    static getOutputUpgradeCost(buildingType, currentLevel) {
        return Math.floor(20 * Math.pow(2, currentLevel));
    }
    
    static upgradeSpeed(plotIndex) {
        const plot = gameState.plots[plotIndex];
        if (!plot || !plot.building) return false;
        
        const cost = this.getSpeedUpgradeCost(plot.building, plot.speedLevel);
        
        // Check if player can afford upgrade (costs gold)
        if (gameState.resources.gold < cost) return false;
        
        // Spend gold and upgrade
        gameState.resources.gold -= cost;
        plot.speedLevel++;
        
        // Reapply all upgrades
        this.applyUpgrades(plot);
        
        return true;
    }
    
    static upgradeOutput(plotIndex) {
        const plot = gameState.plots[plotIndex];
        if (!plot || !plot.building) return false;
        
        const cost = this.getOutputUpgradeCost(plot.building, plot.outputLevel);
        
        // Check if player can afford upgrade (costs gold)
        if (gameState.resources.gold < cost) return false;
        
        // Spend gold and upgrade
        gameState.resources.gold -= cost;
        plot.outputLevel++;
        
        // Reapply all upgrades
        this.applyUpgrades(plot);
        
        return true;
    }
    
    static applyPopulationUpgrade(plotIndex, upgradeType) {
        const plot = gameState.plots[plotIndex];
        if (!plot || !plot.building) return false;
        
        const upgrade = populationUpgrades[upgradeType];
        if (!upgrade) return false;
        
        // Check if player has enough population
        if (gameState.resources.population < upgrade.cost) return false;
        
        // Spend population and apply upgrade
        gameState.resources.population -= upgrade.cost;
        
        switch (upgradeType) {
            case 'autoHarvest':
                plot.autoHarvest = true;
                plot.hasAutomation = true;
                break;
            case 'speedBoost':
                plot.speedLevel++;
                break;
            case 'outputMultiplier':
                plot.outputLevel++;
                break;
        }
        
        // Reapply all upgrades
        this.applyUpgrades(plot);
        
        return true;
    }
    
    static canAffordPopulationUpgrade(upgradeType) {
        const upgrade = populationUpgrades[upgradeType];
        return upgrade && gameState.resources.population >= upgrade.cost;
    }
    
    static canAffordSpeedUpgrade(plotIndex) {
        const plot = gameState.plots[plotIndex];
        if (!plot || !plot.building) return false;
        
        const cost = this.getSpeedUpgradeCost(plot.building, plot.speedLevel);
        return gameState.resources.gold >= cost;
    }
    
    static canAffordOutputUpgrade(plotIndex) {
        const plot = gameState.plots[plotIndex];
        if (!plot || !plot.building) return false;
        
        const cost = this.getOutputUpgradeCost(plot.building, plot.outputLevel);
        return gameState.resources.gold >= cost;
    }
}