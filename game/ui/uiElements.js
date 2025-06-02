class UIElements {
    constructor(scene) {
        this.scene = scene;
        this.elements = {};
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

        return this.elements;
    }

    updateUI() {
        this.elements.foodText.setText(`Food: ${gameState.resources.food}`);
        this.elements.foodText.setFill(gameState.isStarving ? '#FF6666' : '#90EE90');
        this.elements.woodText.setText(`Wood: ${gameState.resources.wood}`);
        this.elements.stoneText.setText(`Stone: ${gameState.resources.stone}`);
        this.elements.goldText.setText(`Gold: ${gameState.resources.gold}`);
        this.elements.popText.setText(`Population: ${gameState.resources.population}`);
    }

    updateStarvationWarning(message) {
        this.elements.starvationWarning.setText(message);
    }
}