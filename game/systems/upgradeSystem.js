// Unified upgrade system for managing building improvements
class UpgradeSystem {
    static getSpeedUpgradeCost(buildingId, currentLevel) {
        // Exponential cost scaling
        return Math.floor(10 * Math.pow(1.5, currentLevel));
    }
    
    static getOutputUpgradeCost(buildingId, currentLevel) {
        // Exponential cost scaling  
        return Math.floor(15 * Math.pow(1.5, currentLevel));
    }
    
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
        
        // Apply automation
        if (plot.hasAutomation) {
            plot.autoHarvest = true;
        }
    }
    
    static canAffordCost(cost) {
        for (let resource in cost) {
            if (gameState.resources[resource] < cost[resource]) {
                return false;
            }
        }
        return true;
    }
    
    static formatCost(cost) {
        const parts = [];
        for (let resource in cost) {
            parts.push(`${cost[resource]} ${resource.charAt(0)}`);
        }
        return parts.join(', ');
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
    
    static purchaseUpgrade(plotIndex, upgradeType) {
        const plot = gameState.plots[plotIndex];
        if (!plot.building || !plot.unlocked) return false;
        
        const upgrade = populationUpgrades[upgradeType];
        if (!upgrade) return false;
        
        // Check if can afford
        if (gameState.resources.population < upgrade.cost) return false;
        
        // Check if already has upgrade (for single-purchase upgrades)
        if (upgradeType === 'autoHarvest' && plot.autoHarvest) return false;
        
        // Purchase upgrade
        gameState.resources.population -= upgrade.cost;
        
        // Apply upgrade effect
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
    
    static applyPopulationUpgrade(plotIndex, upgradeType) {
        return this.purchaseUpgrade(plotIndex, upgradeType);
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
        available.push({
            type: 'speedBoost',
            ...populationUpgrades.speedBoost,
            canAfford: gameState.resources.population >= populationUpgrades.speedBoost.cost
        });
        
        // Output multiplier upgrade
        available.push({
            type: 'outputMultiplier',
            ...populationUpgrades.outputMultiplier,
            canAfford: gameState.resources.population >= populationUpgrades.outputMultiplier.cost
        });
        
        return available;
    }
    
    static hasUpgrades(plotIndex) {
        return this.getAvailableUpgrades(plotIndex).length > 0;
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