// Building Demolition and Enhancement System
class DemolitionSystem {
    constructor(scene) {
        this.scene = scene;
        this.demolitionMode = false;
        this.selectedBuilding = null;
        this.demolitionModal = null;
        this.longPressTimer = null;
        this.longPressDuration = 2000; // 2 seconds
        this.isLongPressing = false;
        
        // Demolition configuration
        this.resourceRecoveryRate = 0.25; // 25% recovery
        this.populationCostMultiplier = 1; // Base cost multiplier
        
        // Building enhancement tracking
        this.buildingAges = new Map(); // Track building placement times
        this.adjacencyBonuses = new Map(); // Track adjacency bonuses
        this.establishedBonusInterval = 10 * 60 * 1000; // 10 minutes
        this.maxEstablishedBonus = 1.0; // 100% max bonus
        this.establishedBonusIncrement = 0.05; // 5% per interval
    }
    
    // Initialize building ages for existing buildings
    initializeBuildingAges() {
        gameState.plots.forEach((plot, index) => {
            if (plot.building && !plot.placementTime) {
                // Set placement time for existing buildings
                plot.placementTime = Date.now();
                this.buildingAges.set(index, Date.now());
            } else if (plot.building && plot.placementTime) {
                this.buildingAges.set(index, plot.placementTime);
            }
        });
    }
    
    // Handle long press detection
    startLongPress(plotIndex, pointer) {
        if (this.isLongPressing) return;
        
        const plot = gameState.plots[plotIndex];
        if (!plot.building) return;
        
        this.isLongPressing = true;
        this.selectedBuilding = plotIndex;
        
        // Show visual feedback
        this.showLongPressIndicator(plotIndex);
        
        // Start timer for demolition mode
        this.longPressTimer = this.scene.time.delayedCall(this.longPressDuration, () => {
            this.enterDemolitionMode(plotIndex);
        });
    }
    
    cancelLongPress() {
        if (this.longPressTimer) {
            this.longPressTimer.remove();
            this.longPressTimer = null;
        }
        
        this.hideLongPressIndicator();
        this.isLongPressing = false;
        this.selectedBuilding = null;
    }
    
    showLongPressIndicator(plotIndex) {
        const gridSprite = this.scene.gridSprites[plotIndex];
        if (!gridSprite || !gridSprite.building) return;
        
        // Create red overlay for demolition mode indication
        this.longPressIndicator = this.scene.add.circle(
            gridSprite.building.x,
            gridSprite.building.y,
            30,
            0xFF0000,
            0.3
        );
        
        // Add to world container
        if (this.scene.worldContainer) {
            this.scene.worldContainer.add(this.longPressIndicator);
        }
        
        // Animate the indicator
        this.scene.tweens.add({
            targets: this.longPressIndicator,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0.6,
            duration: this.longPressDuration,
            ease: 'Power2'
        });
    }
    
    hideLongPressIndicator() {
        if (this.longPressIndicator) {
            this.longPressIndicator.destroy();
            this.longPressIndicator = null;
        }
    }
    
    enterDemolitionMode(plotIndex) {
        this.demolitionMode = true;
        this.selectedBuilding = plotIndex;
        this.hideLongPressIndicator();

        // Close any open upgrade menu first
        if (this.scene.menuSystem) {
            this.scene.menuSystem.hideUpgradeMenu();
        }
        // Also try the global MenuSystem
        if (typeof MenuSystem !== 'undefined') {
            MenuSystem.hideUpgradeMenu(this.scene);
        }

        // Apply red tint to building
        this.applyDemolitionTint(plotIndex);

        // Show demolition confirmation modal
        this.showDemolitionConfirmation(plotIndex);
    }
    
    exitDemolitionMode() {
        this.demolitionMode = false;
        this.removeDemolitionTint();
        this.selectedBuilding = null;
        this.closeDemolitionModal();
    }
    
    applyDemolitionTint(plotIndex) {
        const gridSprite = this.scene.gridSprites[plotIndex];
        if (gridSprite && gridSprite.building) {
            // Store original tint
            gridSprite.originalTint = gridSprite.building.tintTopLeft;
            // Apply red tint
            gridSprite.building.setTint(0xFF6666);
        }
    }
    
    removeDemolitionTint() {
        if (this.selectedBuilding !== null) {
            const gridSprite = this.scene.gridSprites[this.selectedBuilding];
            if (gridSprite && gridSprite.building) {
                // Restore original tint
                gridSprite.building.clearTint();
            }
        }
    }
    
    showDemolitionConfirmation(plotIndex) {
        const plot = gameState.plots[plotIndex];
        const buildingDef = buildingTypes[plot.building];
        
        // Calculate recovery resources
        const recovery = this.calculateResourceRecovery(buildingDef);
        
        // Calculate population cost
        const populationCost = this.calculatePopulationCost(buildingDef);
        
        // Check if player can afford demolition
        const canAfford = gameState.resources.population >= populationCost;
        
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;
        
        // Create modal container
        this.demolitionModal = this.scene.add.container(centerX, centerY);
        
        // Modal background
        const modalBg = this.scene.add.rectangle(0, 0, 350, 280, 0x2c1810, 0.95);
        modalBg.setStrokeStyle(3, 0x8b4513);
        
        // Title
        const title = this.scene.add.text(0, -110, `Demolish ${buildingDef.name}?`, {
            fontSize: '18px',
            fill: '#D4B896',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Recovery text
        const recoveryText = this.formatRecoveryText(recovery);
        const recoveryDisplay = this.scene.add.text(0, -70, `Recover: ${recoveryText}`, {
            fontSize: '14px',
            fill: '#90EE90',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);
        
        // Population cost text
        const costColor = canAfford ? '#FFFF00' : '#FF6666';
        const costText = this.scene.add.text(0, -40, `Required: ${populationCost} Population (consumed)`, {
            fontSize: '14px',
            fill: costColor,
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);
        
        // Warning text if can't afford
        let warningText = null;
        if (!canAfford) {
            warningText = this.scene.add.text(0, -10, 'Insufficient Population!', {
                fontSize: '12px',
                fill: '#FF0000',
                fontFamily: 'Courier New',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        }
        
        // Buttons
        const confirmBtn = this.createDemolitionButton(-80, 40, 'Confirm\nDemolition', canAfford, () => {
            this.executeDemolition(plotIndex);
        });
        
        const cancelBtn = this.createDemolitionButton(80, 40, 'Cancel', true, () => {
            this.exitDemolitionMode();
        });
        
        // Add all elements to modal
        const elements = [modalBg, title, recoveryDisplay, costText, ...confirmBtn, ...cancelBtn];
        if (warningText) elements.push(warningText);
        
        this.demolitionModal.add(elements);
        
        // Add to UI container
        if (this.scene.uiContainer) {
            this.scene.uiContainer.add(this.demolitionModal);
        }
    }
    
    createDemolitionButton(x, y, text, enabled, callback) {
        const bg = this.scene.add.rectangle(x, y, 120, 50, enabled ? 0x654321 : 0x444444);
        bg.setStrokeStyle(2, enabled ? 0x8b4513 : 0x666666);
        bg.setInteractive();
        
        const label = this.scene.add.text(x, y, text, {
            fontSize: '12px',
            fill: enabled ? '#D4B896' : '#666666',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);
        
        if (enabled) {
            bg.on('pointerdown', callback);
            bg.on('pointerover', () => bg.setFillStyle(0x8b4513));
            bg.on('pointerout', () => bg.setFillStyle(0x654321));
        }
        
        return [bg, label];
    }
    
    calculateResourceRecovery(buildingDef) {
        const recovery = {};
        
        Object.keys(buildingDef.cost).forEach(resource => {
            const originalCost = buildingDef.cost[resource];
            const recoveredAmount = Math.floor(originalCost * this.resourceRecoveryRate);
            if (recoveredAmount > 0) {
                recovery[resource] = recoveredAmount;
            }
        });
        
        return recovery;
    }
    
    calculatePopulationCost(buildingDef) {
        // Tier is based on building complexity/cost
        const tier = this.getBuildingTier(buildingDef);
        return Math.pow(tier, 2) * this.populationCostMultiplier;
    }
    
    getBuildingTier(buildingDef) {
        // Simple tier calculation based on total resource cost
        const totalCost = Object.values(buildingDef.cost).reduce((sum, cost) => sum + cost, 0);
        
        if (totalCost <= 10) return 1; // Tier 1: Simple buildings
        if (totalCost <= 25) return 2; // Tier 2: Moderate buildings
        if (totalCost <= 50) return 3; // Tier 3: Complex buildings
        return 4; // Tier 4: Advanced buildings
    }
    
    formatRecoveryText(recovery) {
        const parts = [];
        Object.keys(recovery).forEach(resource => {
            parts.push(`${recovery[resource]} ${resource}`);
        });
        return parts.length > 0 ? parts.join(', ') + ' (25% of original)' : 'No resources';
    }
    
    executeDemolition(plotIndex) {
        const plot = gameState.plots[plotIndex];
        const buildingDef = buildingTypes[plot.building];
        
        // Calculate costs and recovery
        const recovery = this.calculateResourceRecovery(buildingDef);
        const populationCost = this.calculatePopulationCost(buildingDef);
        
        // Verify player can afford it
        if (gameState.resources.population < populationCost) {
            console.log('Cannot afford demolition');
            return;
        }
        
        // Execute demolition
        gameState.resources.population -= populationCost;
        
        // Add recovered resources
        Object.keys(recovery).forEach(resource => {
            gameState.resources[resource] += recovery[resource];
        });
        
        // Remove building from plot
        plot.building = null;
        plot.nextHarvest = 0;
        plot.harvestReady = false;
        plot.placementTime = null;
        
        // Remove from tracking
        this.buildingAges.delete(plotIndex);
        this.adjacencyBonuses.delete(plotIndex);
        
        // Update visuals
        this.scene.recreatePlotVisual(plotIndex);
        
        // Recalculate adjacency bonuses for all buildings
        this.recalculateAllAdjacencyBonuses();
        
        // Update UI
        if (this.scene.updateUI) {
            this.scene.updateUI();
        }
        
        // Show demolition result
        this.showDemolitionResult(buildingDef.name, recovery, populationCost);
        
        // Exit demolition mode
        this.exitDemolitionMode();
    }
    
    showDemolitionResult(buildingName, recovery, populationCost) {
        const recoveryText = this.formatRecoveryText(recovery);
        
        const resultText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 100,
            `${buildingName} demolished!\nRecovered: ${recoveryText}\nCost: ${populationCost} population`,
            {
                fontSize: '14px',
                fill: '#FF6666',
                fontFamily: 'Courier New',
                align: 'center',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5);
        
        if (this.scene.uiContainer) {
            this.scene.uiContainer.add(resultText);
        }
        
        // Animate and remove
        this.scene.tweens.add({
            targets: resultText,
            y: resultText.y - 50,
            alpha: 0,
            duration: 3000,
            ease: 'Power2',
            onComplete: () => resultText.destroy()
        });
    }
    
    closeDemolitionModal() {
        if (this.demolitionModal) {
            this.demolitionModal.destroy();
            this.demolitionModal = null;
        }
    }
    
    // Building Enhancement Systems
    
    // Track building placement
    onBuildingPlaced(plotIndex) {
        const timestamp = Date.now();
        gameState.plots[plotIndex].placementTime = timestamp;
        this.buildingAges.set(plotIndex, timestamp);
        
        // Recalculate adjacency bonuses
        this.recalculateAllAdjacencyBonuses();
    }
    
    // Calculate adjacency bonus for a specific building
    calculateAdjacencyBonus(plotIndex) {
        const plot = gameState.plots[plotIndex];
        if (!plot.building) return 0;
        
        const adjacentPlots = this.getAdjacentPlots(plotIndex);
        let matchingAdjacent = 0;
        
        adjacentPlots.forEach(adjIndex => {
            const adjPlot = gameState.plots[adjIndex];
            if (adjPlot && adjPlot.building === plot.building) {
                matchingAdjacent++;
            }
        });
        
        // 10% bonus per adjacent matching building, max 30%
        return Math.min(matchingAdjacent * 0.1, 0.3);
    }
    
    // Get adjacent plot indices for a 3x3 grid
    getAdjacentPlots(plotIndex) {
        const row = Math.floor(plotIndex / 3);
        const col = plotIndex % 3;
        const adjacent = [];
        
        // Check all 8 directions
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue; // Skip self
                
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (newRow >= 0 && newRow < 3 && newCol >= 0 && newCol < 3) {
                    adjacent.push(newRow * 3 + newCol);
                }
            }
        }
        
        return adjacent;
    }
    
    // Recalculate adjacency bonuses for all buildings
    recalculateAllAdjacencyBonuses() {
        gameState.plots.forEach((plot, index) => {
            if (plot.building) {
                const bonus = this.calculateAdjacencyBonus(index);
                this.adjacencyBonuses.set(index, bonus);
                
                // Store in plot for easy access
                plot.adjacencyBonus = bonus;
            }
        });
    }
    
    // Calculate established building bonus
    calculateEstablishedBonus(plotIndex) {
        const placementTime = this.buildingAges.get(plotIndex);
        if (!placementTime) return 0;
        
        const age = Date.now() - placementTime;
        const intervals = Math.floor(age / this.establishedBonusInterval);
        const bonus = Math.min(intervals * this.establishedBonusIncrement, this.maxEstablishedBonus);
        
        return bonus;
    }
    
    // Get total efficiency bonus for a building
    getTotalEfficiencyBonus(plotIndex) {
        const adjacencyBonus = this.adjacencyBonuses.get(plotIndex) || 0;
        const establishedBonus = this.calculateEstablishedBonus(plotIndex);
        
        return adjacencyBonus + establishedBonus;
    }
    
    // Save/Load integration
    getSaveData() {
        return {
            buildingAges: Array.from(this.buildingAges.entries()),
            adjacencyBonuses: Array.from(this.adjacencyBonuses.entries())
        };
    }
    
    loadSaveData(data) {
        if (data.buildingAges) {
            this.buildingAges = new Map(data.buildingAges);
        }
        if (data.adjacencyBonuses) {
            this.adjacencyBonuses = new Map(data.adjacencyBonuses);
        }
        
        // Recalculate bonuses after loading
        this.recalculateAllAdjacencyBonuses();
    }
}

// Expose globally
window.DemolitionSystem = DemolitionSystem;
