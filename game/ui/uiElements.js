class UIElements {
    constructor(scene) {
        this.scene = scene;
        this.elements = {};
        this.buildingSystem = null; // Will be set by GameScene
    }

    setBuildingSystem(buildingSystem) {
        this.buildingSystem = buildingSystem;
    }

    createUI() {
        // Resource display
        const uiY = 30;
        this.elements.foodText = this.scene.add.text(20, uiY, `Food: ${gameState.resources.food}`, {
            fontSize: '16px',
            fill: gameState.isStarving ? '#FF6666' : '#90EE90',
            fontFamily: 'Courier New'
        });
        
        this.elements.woodText = this.scene.add.text(20, uiY + 25, `Wood: ${gameState.resources.wood}`, {
            fontSize: '16px',
            fill: '#8B4513',
            fontFamily: 'Courier New'
        });
        
        this.elements.stoneText = this.scene.add.text(20, uiY + 50, `Stone: ${gameState.resources.stone}`, {
            fontSize: '16px',
            fill: '#A0A0A0',
            fontFamily: 'Courier New'
        });

        this.elements.goldText = this.scene.add.text(20, uiY + 75, `Gold: ${gameState.resources.gold}`, {
            fontSize: '16px',
            fill: '#87CEEB',
            fontFamily: 'Courier New'
        });
        
        this.elements.popText = this.scene.add.text(20, uiY + 100, `Population: ${gameState.resources.population}`, {
            fontSize: '16px',
            fill: '#87CEEB',
            fontFamily: 'Courier New'
        });

        // Starvation warning
        this.elements.starvationWarning = this.scene.add.text(20, uiY + 125, '', {
            fontSize: '14px',
            fill: '#FF0000',
            fontFamily: 'Courier New'
        });

        // Instructions
        this.scene.add.text(20, this.scene.cameras.main.height - 80, 'Left click: build/harvest', {
            fontSize: '14px',
            fill: '#D4B896',
            fontFamily: 'Courier New'
        });

        this.scene.add.text(20, this.scene.cameras.main.height - 60, 'Right click: upgrades (costs population)', {
            fontSize: '14px',
            fill: '#D4B896',
            fontFamily: 'Courier New'
        });
        
        this.scene.add.text(20, this.scene.cameras.main.height - 40, 'Yellow glow = ready to harvest', {
            fontSize: '14px',
            fill: '#D4B896',
            fontFamily: 'Courier New'
        });
            // Plot unlock cost display
    this.elements.plotCostText = this.scene.add.text(20, uiY + 150, `Next Plot Cost: ${gameState.nextPlotCost} gold`, {
        fontSize: '14px',
        fill: '#FFD700',
        fontFamily: 'Courier New'
    });
    
    // Selected plot info
    this.elements.plotInfoText = this.scene.add.text(20, uiY + 170, '', {
        fontSize: '14px',
        fill: '#FFFFFF',
        fontFamily: 'Courier New'
    });
        return this.elements;
    }

updateUI() {
    this.elements.foodText.setText(`Food: ${gameState.resources.food}`);
    this.elements.foodText.setFill(gameState.isStarving ? '#FF6666' : '#90EE90');
    this.elements.woodText.setText(`Wood: ${gameState.resources.wood}`);
    this.elements.stoneText.setText(`Stone: ${gameState.resources.stone}`);
    this.elements.goldText.setText(`Gold: ${gameState.resources.gold}`);
    this.elements.popText.setText(`Population: ${gameState.resources.population}`);

        // Update all integrated systems
    this.updatePlotInfo();
    
    // Update starvation warning based on ResourceSystem
    if (this.resourceSystem) {
        const starvationMessage = this.resourceSystem.getStarvationStatus();
        this.updateStarvationWarning(starvationMessage);
    }
}

setResourceSystem(resourceSystem) {
    this.resourceSystem = resourceSystem;
}

updateStarvationWarning(message) {
    this.elements.starvationWarning.setText(message);
}

updatePlotInfo() {
    if (gameState.selectedPlot >= 0 && gameState.selectedPlot < 9) {
        const plot = gameState.plots[gameState.selectedPlot];
        let info = `Plot ${gameState.selectedPlot + 1}: `;
        
        if (!plot.unlocked) {
            info += `Locked (${gameState.nextPlotCost} gold to unlock)`;
        } else if (!plot.building) {
            info += 'Empty - click to build';
        } else {
            const building = buildingTypes[plot.building];
            info += `${building.name} Lv.${plot.level}`;
            if (plot.harvestReady) {
                info += ' - Ready to harvest!';
            } else {
                const timeLeft = Math.ceil((plot.nextHarvest - Date.now()) / 1000);
                info += ` - ${timeLeft}s remaining`;
            }
        }
        
        this.elements.plotInfoText.setText(info);
        this.elements.plotCostText.setText(`Next Plot Cost: ${gameState.nextPlotCost} gold`);
    } else {
        this.elements.plotInfoText.setText('Select a plot to see info');
    }
}
}

// Static instance for backward compatibility
UIElements.instance = null;
UIElements.elements = {};

// Static methods for backward compatibility
UIElements.init = function(scene) {
    UIElements.instance = new UIElements(scene);
    UIElements.elements = UIElements.instance.createUI();
    return UIElements.elements;
};

UIElements.updateUI = function() {
    if (UIElements.instance) {
        UIElements.instance.updateUI();
    }
};

UIElements.setResourceSystem = function(resourceSystem) {
    if (UIElements.instance) {
        UIElements.instance.setResourceSystem(resourceSystem);
    }
};