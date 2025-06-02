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