// Random Event System for Medieval Kingdom Builder
class EventSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeEvent = null;
        this.eventTimer = null;
        this.eventIcon = null;
        this.eventModal = null;
        this.isEventActive = false;
        
        // Event configuration (reduced for testing)
        this.eventInterval = 30 * 1000; // 30 seconds for testing
        this.eventDuration = 3 * 60 * 1000; // 3 minutes auto-dismiss
        this.minInterval = 20 * 1000; // 20 seconds minimum for testing
        this.maxInterval = 60 * 1000; // 60 seconds maximum for testing
        
        // Event pool - starting with Wandering Trader
        this.eventPool = [
            {
                id: 'wandering_trader',
                name: 'The Wandering Trader',
                weight: 1.0,
                handler: this.handleWanderingTrader.bind(this)
            },
            {
                id: 'bountiful_harvest',
                name: 'Bountiful Harvest',
                weight: 0.3,
                handler: this.handleBountifulHarvest.bind(this)
            },
            {
                id: 'royal_tax',
                name: 'Royal Tax Collector',
                weight: 0.2,
                handler: this.handleRoyalTax.bind(this)
            }
            // More events can be added here
        ];
        
        // Trade ratios for Wandering Trader
        this.tradeRatios = {
            'food_to_wood': { give: 2, receive: 1, giveResource: 'food', receiveResource: 'wood' },
            'food_to_gold': { give: 3, receive: 1, giveResource: 'food', receiveResource: 'gold' },
            'wood_to_food': { give: 1, receive: 1.5, giveResource: 'wood', receiveResource: 'food' },
            'wood_to_gold': { give: 2, receive: 1, giveResource: 'wood', receiveResource: 'gold' },
            'gold_to_food': { give: 1, receive: 4, giveResource: 'gold', receiveResource: 'food' },
            'gold_to_wood': { give: 1, receive: 2, giveResource: 'gold', receiveResource: 'wood' }
        };
        
        this.startEventTimer();
    }
    
    startEventTimer() {
        // Clear existing timer
        if (this.eventTimer) {
            this.eventTimer.remove();
        }
        
        // Random interval between min and max
        const randomInterval = Phaser.Math.Between(this.minInterval, this.maxInterval);
        
        this.eventTimer = this.scene.time.delayedCall(randomInterval, () => {
            this.triggerRandomEvent();
        });
        
        console.log(`Next event in ${Math.round(randomInterval / 60000)} minutes`);
    }
    
    triggerRandomEvent() {
        if (this.isEventActive) return;
        
        // Select random event from pool (weighted)
        const selectedEvent = this.selectRandomEvent();
        if (selectedEvent) {
            this.activeEvent = selectedEvent;
            this.isEventActive = true;
            
            // Show event icon
            this.showEventIcon(selectedEvent);
            
            // Auto-dismiss timer
            this.scene.time.delayedCall(this.eventDuration, () => {
                this.dismissEvent();
            });
            
            console.log(`Event triggered: ${selectedEvent.name}`);
        }
    }
    
    selectRandomEvent() {
        // Weighted probability system
        const totalWeight = this.eventPool.reduce((sum, event) => sum + event.weight, 0);
        let random = Math.random() * totalWeight;

        for (const event of this.eventPool) {
            random -= event.weight;
            if (random <= 0) {
                return event;
            }
        }

        // Fallback to first event
        return this.eventPool[0];
    }
    
    showEventIcon(event) {
        // Create trader icon on right side of screen
        const iconX = this.scene.cameras.main.width - 60;
        const iconY = this.scene.cameras.main.height / 2;
        
        // Create icon background
        this.eventIcon = this.scene.add.container(iconX, iconY);
        
        const iconBg = this.scene.add.circle(0, 0, 25, 0x8B4513);
        iconBg.setStrokeStyle(3, 0xFFD700);
        iconBg.setInteractive();
        
        // Create trader symbol (simple merchant icon)
        const traderSymbol = this.scene.add.text(0, 0, '🛒', {
            fontSize: '24px'
        }).setOrigin(0.5);
        
        this.eventIcon.add([iconBg, traderSymbol]);
        
        // Add to UI container so it stays fixed
        if (this.scene.uiContainer) {
            this.scene.uiContainer.add(this.eventIcon);
        }
        
        // Pulsing animation
        this.scene.tweens.add({
            targets: this.eventIcon,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Click handler
        iconBg.on('pointerdown', () => {
            this.openEventModal(event);
        });
        
        // Touch feedback
        iconBg.on('pointerover', () => iconBg.setFillStyle(0xA0522D));
        iconBg.on('pointerout', () => iconBg.setFillStyle(0x8B4513));
    }
    
    openEventModal(event) {
        if (this.eventModal) return; // Prevent multiple modals
        
        // Call the specific event handler
        event.handler();
    }
    
    handleWanderingTrader() {
        // Generate random trade offer
        const tradeKeys = Object.keys(this.tradeRatios);
        const randomTrade = tradeKeys[Math.floor(Math.random() * tradeKeys.length)];
        const trade = this.tradeRatios[randomTrade];
        
        // Calculate trade amounts based on player resources
        const playerResource = gameState.resources[trade.giveResource];
        const maxTradeAmount = Math.floor(playerResource / trade.give);
        
        if (maxTradeAmount <= 0) {
            // Player can't afford any trade, offer a different one or dismiss
            this.dismissEvent();
            return;
        }
        
        // Reasonable trade amount (25-75% of what player can afford)
        const tradeAmount = Math.max(1, Math.floor(maxTradeAmount * (0.25 + Math.random() * 0.5)));
        const giveAmount = tradeAmount * trade.give;
        const receiveAmount = Math.floor(tradeAmount * trade.receive);
        
        this.showTraderModal(trade, giveAmount, receiveAmount);
    }
    
    showTraderModal(trade, giveAmount, receiveAmount) {
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;
        
        // Create modal container
        this.eventModal = this.scene.add.container(centerX, centerY);
        
        // Modal background
        const modalBg = this.scene.add.rectangle(0, 0, 320, 240, 0x2c1810, 0.95);
        modalBg.setStrokeStyle(3, 0x8b4513);
        
        // Title
        const title = this.scene.add.text(0, -90, 'The Wandering Trader', {
            fontSize: '18px',
            fill: '#D4B896',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Trade offer text
        const offerText = this.scene.add.text(0, -50, 
            `"I'll trade you ${receiveAmount} ${trade.receiveResource}\nfor ${giveAmount} ${trade.giveResource}"`, {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);
        
        // Buttons
        const buttons = [];
        
        // Deal button
        const dealBtn = this.createModalButton(-80, 20, 'Deal', true, () => {
            this.executeTrade(trade, giveAmount, receiveAmount, 1);
        });
        buttons.push(...dealBtn);
        
        // Special Deal button (ad multiplier)
        const specialBtn = this.createModalButton(80, 20, 'Special Deal\n(Watch Ad)', true, () => {
            this.executeSpecialTrade(trade, giveAmount, receiveAmount);
        });
        buttons.push(...specialBtn);
        
        // Close button
        const closeBtn = this.createModalButton(0, 70, 'Close', true, () => {
            this.closeEventModal();
        });
        buttons.push(...closeBtn);
        
        // Add all elements to modal
        this.eventModal.add([modalBg, title, offerText, ...buttons]);
        
        // Add to UI container
        if (this.scene.uiContainer) {
            this.scene.uiContainer.add(this.eventModal);
        }
        
        // Store trade data for later use
        this.currentTrade = { trade, giveAmount, receiveAmount };
    }
    
    createModalButton(x, y, text, enabled, callback) {
        const bg = this.scene.add.rectangle(x, y, 120, 35, enabled ? 0x654321 : 0x444444);
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
    
    executeTrade(trade, giveAmount, receiveAmount, multiplier = 1) {
        // Check if player has enough resources
        if (gameState.resources[trade.giveResource] < giveAmount) {
            console.log('Not enough resources for trade');
            return;
        }
        
        // Execute the trade
        gameState.resources[trade.giveResource] -= giveAmount;
        gameState.resources[trade.receiveResource] += Math.floor(receiveAmount * multiplier);
        
        // Update UI
        if (this.scene.updateUI) {
            this.scene.updateUI();
        }
        
        // Show trade result
        this.showTradeResult(trade, giveAmount, Math.floor(receiveAmount * multiplier));
        
        // Close modal and dismiss event
        this.closeEventModal();
        this.dismissEvent();
    }
    
    executeSpecialTrade(trade, giveAmount, receiveAmount) {
        // Mock ad watching with delay
        this.showAdWatchingModal();
        
        this.scene.time.delayedCall(2000, () => {
            // Random multiplier between 1.5x and 5x
            const multiplier = 1.5 + Math.random() * 3.5;
            this.hideAdWatchingModal();
            this.executeTrade(trade, giveAmount, receiveAmount, multiplier);
        });
    }
    
    showAdWatchingModal() {
        // Simple "watching ad" overlay
        this.adModal = this.scene.add.container(
            this.scene.cameras.main.width / 2, 
            this.scene.cameras.main.height / 2
        );
        
        const adBg = this.scene.add.rectangle(0, 0, 200, 100, 0x000000, 0.8);
        const adText = this.scene.add.text(0, 0, 'Watching Ad...\n(Mock)', {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);
        
        this.adModal.add([adBg, adText]);
        
        if (this.scene.uiContainer) {
            this.scene.uiContainer.add(this.adModal);
        }
    }
    
    hideAdWatchingModal() {
        if (this.adModal) {
            this.adModal.destroy();
            this.adModal = null;
        }
    }
    
    showTradeResult(trade, gaveAmount, receivedAmount) {
        // Show floating text with trade result
        const resultText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 100,
            `Traded ${gaveAmount} ${trade.giveResource}\nfor ${receivedAmount} ${trade.receiveResource}!`,
            {
                fontSize: '16px',
                fill: '#00FF00',
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
            duration: 2000,
            ease: 'Power2',
            onComplete: () => resultText.destroy()
        });
    }
    
    closeEventModal() {
        if (this.eventModal) {
            this.eventModal.destroy();
            this.eventModal = null;
        }
    }
    
    dismissEvent() {
        // Remove event icon
        if (this.eventIcon) {
            this.eventIcon.destroy();
            this.eventIcon = null;
        }
        
        // Close any open modals
        this.closeEventModal();
        this.hideAdWatchingModal();
        
        // Reset event state
        this.activeEvent = null;
        this.isEventActive = false;
        this.currentTrade = null;
        
        // Start timer for next event
        this.startEventTimer();
        
        console.log('Event dismissed, next event timer started');
    }
    
    // Save/Load integration
    getSaveData() {
        return {
            isEventActive: this.isEventActive,
            activeEventId: this.activeEvent ? this.activeEvent.id : null,
            nextEventTime: this.eventTimer ? Date.now() + this.eventTimer.delay : null
        };
    }
    
    loadSaveData(data) {
        if (data.isEventActive && data.activeEventId) {
            // Restore active event if it was saved
            const event = this.eventPool.find(e => e.id === data.activeEventId);
            if (event) {
                this.activeEvent = event;
                this.isEventActive = true;
                this.showEventIcon(event);
            }
        }
        
        if (data.nextEventTime && data.nextEventTime > Date.now()) {
            // Restore event timer
            const remainingTime = data.nextEventTime - Date.now();
            this.eventTimer = this.scene.time.delayedCall(remainingTime, () => {
                this.triggerRandomEvent();
            });
        }
    }

    // Additional Event Handlers
    handleBountifulHarvest() {
        // Give player bonus resources
        const bonusFood = Math.floor(10 + Math.random() * 20);
        const bonusWood = Math.floor(5 + Math.random() * 10);

        this.showSimpleEventModal(
            'Bountiful Harvest',
            `The gods smile upon your kingdom!\nReceive ${bonusFood} food and ${bonusWood} wood.`,
            () => {
                gameState.resources.food += bonusFood;
                gameState.resources.wood += bonusWood;
                this.showTradeResult(
                    { giveResource: '', receiveResource: 'resources' },
                    0,
                    `${bonusFood} food, ${bonusWood} wood`
                );
                if (this.scene.updateUI) this.scene.updateUI();
            }
        );
    }

    handleRoyalTax() {
        // Tax player's gold
        const taxAmount = Math.floor(gameState.resources.gold * 0.2); // 20% tax

        if (taxAmount <= 0) {
            this.dismissEvent();
            return;
        }

        this.showSimpleEventModal(
            'Royal Tax Collector',
            `"By order of the King, you owe ${taxAmount} gold in taxes."`,
            () => {
                gameState.resources.gold = Math.max(0, gameState.resources.gold - taxAmount);
                this.showTradeResult(
                    { giveResource: 'gold', receiveResource: '' },
                    taxAmount,
                    'royal favor'
                );
                if (this.scene.updateUI) this.scene.updateUI();
            }
        );
    }

    showSimpleEventModal(title, message, acceptCallback) {
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;

        // Create modal container
        this.eventModal = this.scene.add.container(centerX, centerY);

        // Modal background
        const modalBg = this.scene.add.rectangle(0, 0, 320, 200, 0x2c1810, 0.95);
        modalBg.setStrokeStyle(3, 0x8b4513);

        // Title
        const titleText = this.scene.add.text(0, -70, title, {
            fontSize: '18px',
            fill: '#D4B896',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Message
        const messageText = this.scene.add.text(0, -20, message, {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Courier New',
            align: 'center'
        }).setOrigin(0.5);

        // Accept button
        const acceptBtn = this.createModalButton(-60, 40, 'Accept', true, () => {
            acceptCallback();
            this.closeEventModal();
            this.dismissEvent();
        });

        // Close button
        const closeBtn = this.createModalButton(60, 40, 'Close', true, () => {
            this.closeEventModal();
            this.dismissEvent();
        });

        // Add all elements to modal
        this.eventModal.add([modalBg, titleText, messageText, ...acceptBtn, ...closeBtn]);

        // Add to UI container
        if (this.scene.uiContainer) {
            this.scene.uiContainer.add(this.eventModal);
        }
    }
}

// Expose globally
window.EventSystem = EventSystem;
