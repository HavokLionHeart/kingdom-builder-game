// Evolution system class
class EvolutionSystem {
    static getEvolutionLevel(buildingType, level) {
        return Math.floor(level / 10);
    }
    
    static getEvolutionName(buildingType, evolutionLevel) {
        const evolutions = buildingEvolutions[buildingType];
        if (!evolutions || evolutionLevel >= evolutions.length) {
            return buildingTypes[buildingType]?.name || 'Unknown Building';
        }
        return evolutions[evolutionLevel];
    }
    
    static canEvolve(buildingType, currentLevel) {
        const evolutionLevel = this.getEvolutionLevel(buildingType, currentLevel);
        const evolutions = buildingEvolutions[buildingType];
        return evolutions && evolutionLevel < evolutions.length - 1 && currentLevel % 10 === 0;
    }
    
    static getEvolutionCost(buildingType, evolutionLevel) {
        const baseCost = {
            shelter: { population: 5, wood: 20 },
            wheatField: { food: 50, wood: 10 },
            woodcuttersHut: { wood: 30, food: 20 }
        };
        
        const cost = {};
        const base = baseCost[buildingType] || {};
        
        Object.keys(base).forEach(resource => {
            cost[resource] = Math.floor(base[resource] * Math.pow(2, evolutionLevel));
        });
        
        return cost;
    }
    
    static evolveBuilding(plotIndex) {
        const plot = gameState.plots[plotIndex];
        if (!plot || !plot.building) return false;
        
        const buildingType = plot.building;
        const currentLevel = plot.level;
        
        if (!this.canEvolve(buildingType, currentLevel)) return false;
        
        const evolutionLevel = this.getEvolutionLevel(buildingType, currentLevel);
        const cost = this.getEvolutionCost(buildingType, evolutionLevel);
        
        // Check if player can afford evolution
        if (!ResourceSystem.canAfford(cost)) return false;

        // Spend resources and evolve
        ResourceSystem.spendResources(cost);
        plot.evolution = evolutionLevel + 1;
        
        return true;
    }
    
    static getEvolutionBonus(evolutionLevel) {
        // Each evolution tier provides cumulative bonuses
        return {
            speedMultiplier: 1 + (evolutionLevel * 0.2), // 20% faster per tier
            outputMultiplier: 1 + (evolutionLevel * 0.15) // 15% more output per tier
        };
    }
}