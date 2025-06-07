// Upgrade System Data for Kingdom Builder
// Defines upgrade costs, evolution chains, and star tier configurations

// Star tier configuration
const STAR_TIERS = {
    1: { levels: [1, 10], color: 0xFFFFFF, name: 'White' },
    2: { levels: [11, 20], color: 0x00FF00, name: 'Green' },
    3: { levels: [21, 30], color: 0x0080FF, name: 'Blue' },
    4: { levels: [31, 40], color: 0x8000FF, name: 'Purple' },
    5: { levels: [41, 50], color: 0xFF8000, name: 'Orange' },
    6: { levels: [51, 60], color: 0x000000, name: 'Black' },
    7: { levels: [61, 70], color: 0xFFD700, name: 'Gold' }
};

// Evolution chains for each building type
const EVOLUTION_CHAINS = {
    shelter: [
        { evolution: 0, name: 'Shelter', color: 0xFFFFFF, maxLevel: 10 },
        { evolution: 1, name: 'Peasant Hut', color: 0x00FF00, maxLevel: 20 },
        { evolution: 2, name: 'House', color: 0x0080FF, maxLevel: 30 },
        { evolution: 3, name: 'Mansion', color: 0x8000FF, maxLevel: 40 },
        { evolution: 4, name: 'Estate', color: 0xFF8000, maxLevel: 50 },
        { evolution: 5, name: 'Castle', color: 0x000000, maxLevel: 60 },
        { evolution: 6, name: 'Citadel', color: 0xFFD700, maxLevel: 70 }
    ],
    wheatField: [
        { evolution: 0, name: 'Wheat Field', color: 0xFFFFFF, maxLevel: 10 },
        { evolution: 1, name: 'Grain Farm', color: 0x00FF00, maxLevel: 20 },
        { evolution: 2, name: 'Agricultural Plot', color: 0x0080FF, maxLevel: 30 },
        { evolution: 3, name: 'Fertile Grounds', color: 0x8000FF, maxLevel: 40 },
        { evolution: 4, name: 'Harvest Estate', color: 0xFF8000, maxLevel: 50 },
        { evolution: 5, name: 'Golden Fields', color: 0x000000, maxLevel: 60 },
        { evolution: 6, name: 'Eternal Harvest', color: 0xFFD700, maxLevel: 70 }
    ],
    woodcuttersHut: [
        { evolution: 0, name: "Woodcutter's Hut", color: 0xFFFFFF, maxLevel: 10 },
        { evolution: 1, name: 'Lumber Mill', color: 0x00FF00, maxLevel: 20 },
        { evolution: 2, name: 'Timber Yard', color: 0x0080FF, maxLevel: 30 },
        { evolution: 3, name: 'Forest Outpost', color: 0x8000FF, maxLevel: 40 },
        { evolution: 4, name: 'Woodland Estate', color: 0xFF8000, maxLevel: 50 },
        { evolution: 5, name: 'Ancient Grove', color: 0x000000, maxLevel: 60 },
        { evolution: 6, name: 'World Tree', color: 0xFFD700, maxLevel: 70 }
    ]
};

// Upgrade cost calculation functions
const UPGRADE_COSTS = {
    // Speed upgrade cost formula: base * (level^1.5) * evolutionMultiplier
    speed: {
        calculateCost: (level, evolution, baseId) => {
            const baseCosts = {
                shelter: { gold: 10 },
                wheatField: { gold: 5 },
                woodcuttersHut: { gold: 8 }
            };

            const base = baseCosts[baseId] || { gold: 10 };
            const evolutionMultiplier = 1 + (evolution * 0.5);
            const levelMultiplier = Math.pow(level + 1, 1.5);

            const result = {};
            Object.keys(base).forEach(resource => {
                result[resource] = Math.floor(base[resource] * levelMultiplier * evolutionMultiplier);
            });
            return result;
        }
    },

    // Output upgrade cost formula: base * (level^1.6) * evolutionMultiplier
    output: {
        calculateCost: (level, evolution, baseId) => {
            const baseCosts = {
                shelter: { gold: 15 },
                wheatField: { gold: 8 },
                woodcuttersHut: { gold: 12 }
            };

            const base = baseCosts[baseId] || { gold: 15 };
            const evolutionMultiplier = 1 + (evolution * 0.6);
            const levelMultiplier = Math.pow(level + 1, 1.6);

            const result = {};
            Object.keys(base).forEach(resource => {
                result[resource] = Math.floor(base[resource] * levelMultiplier * evolutionMultiplier);
            });
            return result;
        }
    },

    // Evolution cost formula: exponential scaling
    evolution: {
        calculateCost: (currentEvolution, baseId) => {
            const baseCosts = {
                shelter: { gold: 100, population: 5 },
                wheatField: { gold: 50, food: 100 },
                woodcuttersHut: { gold: 75, wood: 50 }
            };

            const base = baseCosts[baseId] || { gold: 100 };
            const evolutionMultiplier = Math.pow(2, currentEvolution);

            const result = {};
            Object.keys(base).forEach(resource => {
                result[resource] = Math.floor(base[resource] * evolutionMultiplier);
            });
            return result;
        }
    }
};

// Utility functions for upgrade system
const UpgradeUtils = {
    // Get maximum level for current evolution
    getMaxLevel: (baseId, evolution) => {
        const chain = EVOLUTION_CHAINS[baseId];
        if (!chain || !chain[evolution]) return 10;
        return chain[evolution].maxLevel;
    },

    // Get evolution data for building
    getEvolutionData: (baseId, evolution) => {
        const chain = EVOLUTION_CHAINS[baseId];
        if (!chain || !chain[evolution]) return null;
        return chain[evolution];
    },

    // Check if evolution is available
    canEvolve: (plot) => {
        if (!plot.building) return false;

        const buildingDef = buildingTypes[plot.building];
        const maxLevel = UpgradeUtils.getMaxLevel(buildingDef.baseId, buildingDef.evolution);

        return plot.speedLevel >= maxLevel && plot.outputLevel >= maxLevel;
    },

    // Get star tier for level
    getStarTier: (level) => {
        for (let tier = 1; tier <= 7; tier++) {
            const tierData = STAR_TIERS[tier];
            if (level >= tierData.levels[0] && level <= tierData.levels[1]) {
                return tier;
            }
        }
        return 1; // Default to tier 1
    },

    // Get star color for level
    getStarColor: (level) => {
        const tier = UpgradeUtils.getStarTier(level);
        return STAR_TIERS[tier].color;
    },

    // Calculate upgrade effect
    calculateSpeedBonus: (level) => {
        return level * 0.01; // 1% per level
    },

    calculateOutputBonus: (level) => {
        return level * 0.10; // 10% per level
    },

    // Format cost display
    formatCost: (cost) => {
        const parts = [];
        Object.keys(cost).forEach(resource => {
            const amount = cost[resource];
            const shortName = resource.charAt(0).toUpperCase();
            parts.push(`${amount}${shortName}`);
        });
        return parts.join(', ');
    },

    // Check if player can afford upgrade
    canAfford: (cost) => {
        return Object.keys(cost).every(resource => {
            return gameState.resources[resource] >= cost[resource];
        });
    },

    // Deduct cost from resources
    deductCost: (cost) => {
        Object.keys(cost).forEach(resource => {
            gameState.resources[resource] -= cost[resource];
        });
    }
};

// Expose to global scope
window.STAR_TIERS = STAR_TIERS;
window.EVOLUTION_CHAINS = EVOLUTION_CHAINS;
window.UPGRADE_COSTS = UPGRADE_COSTS;
window.UpgradeUtils = UpgradeUtils;