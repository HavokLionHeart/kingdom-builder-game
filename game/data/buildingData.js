// Extended building definitions with additional properties
// This extends the buildingTypes already defined in gameState.js

// Add extended building properties if needed
const buildingExtensions = {
    wheatField: {
        // Extended properties can go here
        category: 'food',
        tier: 'basic',
        unlockLevel: 1,
        maxLevel: 10
    },
    woodcuttersHut: {
        category: 'resource',
        tier: 'basic', 
        unlockLevel: 1,
        maxLevel: 10
    },
    shelter: {
        category: 'population',
        tier: 'basic',
        unlockLevel: 1, 
        maxLevel: 10
    }
};

// Apply extensions to existing buildingTypes
Object.keys(buildingExtensions).forEach(buildingKey => {
    if (buildingTypes[buildingKey]) {
        Object.assign(buildingTypes[buildingKey], buildingExtensions[buildingKey]);
    }
});

// Additional building type validation
const validateBuildingTypes = () => {
    Object.keys(buildingTypes).forEach(key => {
        const building = buildingTypes[key];
        
        // Ensure required properties exist
        if (!building.cost) building.cost = {};
        if (!building.produces) building.produces = {};
        if (!building.harvestTime) building.harvestTime = 60000;
        if (!building.color) building.color = 0xFFFFFF;
        if (!building.name) building.name = key;
        if (!building.description) building.description = `A ${building.name}`;
        
        // Set defaults for missing evolution properties
        if (building.baseId === undefined) building.baseId = key;
        if (building.evolution === undefined) building.evolution = 0;
    });
};

// Run validation when this file loads
validateBuildingTypes();