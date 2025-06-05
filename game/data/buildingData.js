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
        category: 'wood',
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

// Function to apply extensions when buildingTypes is ready
function applyBuildingExtensions() {
    if (typeof buildingTypes !== 'undefined') {
        Object.keys(buildingExtensions).forEach(buildingKey => {
            if (buildingTypes[buildingKey]) {
                Object.assign(buildingTypes[buildingKey], buildingExtensions[buildingKey]);
            }
        });
        console.log('Building extensions applied successfully');
        return true;
    }
    return false;
}

// Try to apply immediately, or wait for DOM ready
if (!applyBuildingExtensions()) {
    // If buildingTypes isn't ready, wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyBuildingExtensions);
    } else {
        // Try again after a short delay
        setTimeout(applyBuildingExtensions, 10);
    }
}

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