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
}