// Canvas-based Settings System for Medieval Kingdom Builder
class SettingsSystem {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.currentTab = 'audio';

        this.settings = {
            // Audio Settings
            masterVolume: 100,
            musicVolume: 80,
            sfxVolume: 90,
            muteAll: false,

            // Visual Settings
            screenShake: true,
            particleEffects: 'high', // high, medium, low, off
            animationSpeed: 'normal', // fast, normal, slow
            darkMode: false,

            // Accessibility Settings
            colorblindSupport: false,
            textSize: 'medium', // small, medium, large, extra-large
            highContrast: false,
            reducedMotion: false,

            // Gameplay Settings
            autoSaveInterval: 5, // minutes
            notifyRandomEvents: true,
            notifyResourceFull: true,
            notifyProductionComplete: true,
            tutorialTips: true,
            confirmationDialogs: true,

            // Data Management
            gameVersion: '1.0.0'
        };

        this.defaultSettings = { ...this.settings };
        this.loadSettings();
        this.applySettings();
        this.createSettingsButton();
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('game_settings');
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                // Merge with defaults to handle new settings
                this.settings = { ...this.defaultSettings, ...parsedSettings };
            }
        } catch (error) {
            console.warn('Failed to load settings, using defaults:', error);
            this.settings = { ...this.defaultSettings };
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('game_settings', JSON.stringify(this.settings));
            localStorage.setItem('game_settings_last_tab', this.currentTab || 'audio');
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySetting(key, value);
    }
    
    applySetting(key, value) {
        switch (key) {
            case 'darkMode':
                this.applyDarkMode(value);
                break;
            case 'textSize':
                this.applyTextSize(value);
                break;
            case 'highContrast':
                this.applyHighContrast(value);
                break;
            case 'colorblindSupport':
                this.applyColorblindSupport(value);
                break;
            case 'reducedMotion':
                this.applyReducedMotion(value);
                break;
            case 'masterVolume':
            case 'musicVolume':
            case 'sfxVolume':
            case 'muteAll':
                this.applyAudioSettings();
                break;
        }
    }
    
    applySettings() {
        // Apply all settings on startup
        Object.keys(this.settings).forEach(key => {
            this.applySetting(key, this.settings[key]);
        });
    }
    
    applyDarkMode(enabled) {
        // Store theme preference for canvas rendering
        this.scene.darkMode = enabled;
        console.log('Dark mode:', enabled ? 'enabled' : 'disabled');
    }

    applyTextSize(size) {
        // Store text size preference for canvas rendering
        this.scene.textSize = size;
        console.log('Text size set to:', size);
    }

    applyHighContrast(enabled) {
        // Store high contrast preference for canvas rendering
        this.scene.highContrast = enabled;
        console.log('High contrast:', enabled ? 'enabled' : 'disabled');
    }

    applyColorblindSupport(enabled) {
        // Store colorblind support preference for canvas rendering
        this.scene.colorblindSupport = enabled;
        console.log('Colorblind support:', enabled ? 'enabled' : 'disabled');
    }

    applyReducedMotion(enabled) {
        // Store reduced motion preference for canvas rendering
        this.scene.reducedMotion = enabled;
        console.log('Reduced motion:', enabled ? 'enabled' : 'disabled');
    }
    
    applyAudioSettings() {
        // Placeholder for future audio system integration
        const masterVol = this.settings.muteAll ? 0 : this.settings.masterVolume / 100;
        const musicVol = masterVol * (this.settings.musicVolume / 100);
        const sfxVol = masterVol * (this.settings.sfxVolume / 100);
        
        // Store for future audio system
        window.audioSettings = {
            master: masterVol,
            music: musicVol,
            sfx: sfxVol,
            muted: this.settings.muteAll
        };
    }
    
    createSettingsButton() {
        // Create settings button in top-right corner
        const buttonSize = 44;
        const margin = 20;

        this.settingsButton = this.scene.add.rectangle(
            this.scene.cameras.main.width - margin - buttonSize/2,
            margin + buttonSize/2,
            buttonSize,
            buttonSize,
            0x2c1810,
            0.9
        );
        this.settingsButton.setStrokeStyle(2, 0x8b4513);
        this.settingsButton.setInteractive();
        this.settingsButton.setScrollFactor(0); // Fixed position
        this.settingsButton.setDepth(999);

        // Settings icon text
        this.settingsIcon = this.scene.add.text(
            this.scene.cameras.main.width - margin - buttonSize/2,
            margin + buttonSize/2,
            '⚙️',
            {
                fontSize: '20px',
                fill: '#D4B896'
            }
        ).setOrigin(0.5);
        this.settingsIcon.setScrollFactor(0);
        this.settingsIcon.setDepth(1000);

        // Click handler
        this.settingsButton.on('pointerdown', () => {
            this.openSettingsMenu();
        });

        // Hover effects
        this.settingsButton.on('pointerover', () => {
            this.settingsButton.setAlpha(1);
            this.settingsButton.setScale(1.1);
        });

        this.settingsButton.on('pointerout', () => {
            this.settingsButton.setAlpha(0.9);
            this.settingsButton.setScale(1);
        });
    }
    
    openSettingsMenu() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.createSettingsModal();
    }

    createSettingsModal() {
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;
        const modalWidth = Math.min(600, this.scene.cameras.main.width * 0.9);
        const modalHeight = Math.min(500, this.scene.cameras.main.height * 0.8);

        // Create container for all modal elements
        this.modalContainer = this.scene.add.container(centerX, centerY);
        this.modalContainer.setDepth(2000);
        this.modalContainer.setScrollFactor(0);

        // Semi-transparent overlay
        this.overlay = this.scene.add.rectangle(0, 0,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000, 0.7);
        this.overlay.setInteractive();
        this.overlay.on('pointerdown', () => this.closeSettingsMenu());
        this.modalContainer.add(this.overlay);

        // Modal background
        this.modalBg = this.scene.add.rectangle(0, 0, modalWidth, modalHeight, 0x2c1810, 0.95);
        this.modalBg.setStrokeStyle(3, 0x8b4513);
        this.modalContainer.add(this.modalBg);

        // Title
        this.title = this.scene.add.text(0, -modalHeight/2 + 40, 'Settings', {
            fontSize: '24px',
            fill: '#D4B896',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.modalContainer.add(this.title);

        // Close button
        this.closeButton = this.scene.add.rectangle(modalWidth/2 - 30, -modalHeight/2 + 30, 24, 24, 0x654321);
        this.closeButton.setStrokeStyle(2, 0x8b4513);
        this.closeButton.setInteractive();
        this.closeButton.on('pointerdown', () => this.closeSettingsMenu());
        this.modalContainer.add(this.closeButton);

        this.closeButtonText = this.scene.add.text(modalWidth/2 - 30, -modalHeight/2 + 30, '×', {
            fontSize: '18px',
            fill: '#D4B896',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        this.modalContainer.add(this.closeButtonText);

        // Create tabs
        this.createTabs(modalWidth, modalHeight);

        // Create content area
        this.createContentArea(modalWidth, modalHeight);

        // Show initial tab
        this.showTab(this.currentTab);
    }

    createTabs(modalWidth, modalHeight) {
        const tabs = ['Audio', 'Visual', 'Access', 'Game', 'Data'];
        const tabKeys = ['audio', 'visual', 'accessibility', 'gameplay', 'data'];
        const tabWidth = modalWidth / tabs.length;
        const tabHeight = 40;
        const tabY = -modalHeight/2 + 80;

        this.tabButtons = [];
        this.tabTexts = [];

        tabs.forEach((tabName, index) => {
            const tabX = -modalWidth/2 + tabWidth/2 + (index * tabWidth);
            const tabKey = tabKeys[index];

            // Tab button background
            const tabButton = this.scene.add.rectangle(tabX, tabY, tabWidth - 2, tabHeight,
                tabKey === this.currentTab ? 0x654321 : 0x2c1810);
            tabButton.setStrokeStyle(1, 0x8b4513);
            tabButton.setInteractive();
            tabButton.setData('tabKey', tabKey);

            tabButton.on('pointerdown', () => {
                this.switchTab(tabKey);
            });

            this.tabButtons.push(tabButton);
            this.modalContainer.add(tabButton);

            // Tab text
            const tabText = this.scene.add.text(tabX, tabY, tabName, {
                fontSize: '12px',
                fill: '#D4B896',
                fontFamily: 'Courier New'
            }).setOrigin(0.5);

            this.tabTexts.push(tabText);
            this.modalContainer.add(tabText);
        });
    }

    createContentArea(modalWidth, modalHeight) {
        const contentY = -modalHeight/2 + 140;
        const contentHeight = modalHeight - 180;

        // Content background
        this.contentBg = this.scene.add.rectangle(0, contentY + contentHeight/2,
            modalWidth - 40, contentHeight, 0x1a0f08, 0.8);
        this.contentBg.setStrokeStyle(1, 0x8b4513);
        this.modalContainer.add(this.contentBg);

        // Store content area bounds for positioning
        this.contentBounds = {
            x: -modalWidth/2 + 40,
            y: contentY,
            width: modalWidth - 80,
            height: contentHeight
        };
    }

    switchTab(tabKey) {
        // Update tab button appearances
        this.tabButtons.forEach((button, index) => {
            const buttonTabKey = button.getData('tabKey');
            if (buttonTabKey === tabKey) {
                button.setFillStyle(0x654321);
            } else {
                button.setFillStyle(0x2c1810);
            }
        });

        this.currentTab = tabKey;
        this.showTab(tabKey);
        this.saveSettings();
    }

    showTab(tabKey) {
        // Clear existing content
        if (this.currentContent) {
            this.currentContent.forEach(item => item.destroy());
        }
        this.currentContent = [];

        // Create content based on tab
        switch (tabKey) {
            case 'audio':
                this.createAudioContent();
                break;
            case 'visual':
                this.createVisualContent();
                break;
            case 'accessibility':
                this.createAccessibilityContent();
                break;
            case 'gameplay':
                this.createGameplayContent();
                break;
            case 'data':
                this.createDataContent();
                break;
        }
    }

    createAudioContent() {
        let yPos = this.contentBounds.y + 20;
        const leftX = this.contentBounds.x + 20;
        const rightX = this.contentBounds.x + this.contentBounds.width - 100;

        // Master Volume
        this.addLabel('Master Volume', leftX, yPos);
        this.addSlider('masterVolume', rightX, yPos, this.settings.masterVolume);
        yPos += 50;

        // Music Volume
        this.addLabel('Music Volume', leftX, yPos);
        this.addSlider('musicVolume', rightX, yPos, this.settings.musicVolume);
        yPos += 50;

        // SFX Volume
        this.addLabel('SFX Volume', leftX, yPos);
        this.addSlider('sfxVolume', rightX, yPos, this.settings.sfxVolume);
        yPos += 50;

        // Mute All
        this.addLabel('Mute All', leftX, yPos);
        this.addToggle('muteAll', rightX, yPos, this.settings.muteAll);
    }

    createVisualContent() {
        let yPos = this.contentBounds.y + 20;
        const leftX = this.contentBounds.x + 20;
        const rightX = this.contentBounds.x + this.contentBounds.width - 100;

        // Screen Shake
        this.addLabel('Screen Shake', leftX, yPos);
        this.addToggle('screenShake', rightX, yPos, this.settings.screenShake);
        yPos += 50;

        // Particle Effects
        this.addLabel('Particle Effects', leftX, yPos);
        this.addDropdown('particleEffects', rightX, yPos,
            ['High', 'Medium', 'Low', 'Off'],
            ['high', 'medium', 'low', 'off'],
            this.settings.particleEffects);
        yPos += 50;

        // Animation Speed
        this.addLabel('Animation Speed', leftX, yPos);
        this.addDropdown('animationSpeed', rightX, yPos,
            ['Fast', 'Normal', 'Slow'],
            ['fast', 'normal', 'slow'],
            this.settings.animationSpeed);
        yPos += 50;

        // Dark Mode
        this.addLabel('Dark Mode', leftX, yPos);
        this.addToggle('darkMode', rightX, yPos, this.settings.darkMode);
    }

    createAccessibilityContent() {
        let yPos = this.contentBounds.y + 20;
        const leftX = this.contentBounds.x + 20;
        const rightX = this.contentBounds.x + this.contentBounds.width - 100;

        // Colorblind Support
        this.addLabel('Colorblind Support', leftX, yPos);
        this.addToggle('colorblindSupport', rightX, yPos, this.settings.colorblindSupport);
        yPos += 50;

        // Text Size
        this.addLabel('Text Size', leftX, yPos);
        this.addDropdown('textSize', rightX, yPos,
            ['Small', 'Medium', 'Large', 'X-Large'],
            ['small', 'medium', 'large', 'extra-large'],
            this.settings.textSize);
        yPos += 50;

        // High Contrast
        this.addLabel('High Contrast', leftX, yPos);
        this.addToggle('highContrast', rightX, yPos, this.settings.highContrast);
        yPos += 50;

        // Reduced Motion
        this.addLabel('Reduced Motion', leftX, yPos);
        this.addToggle('reducedMotion', rightX, yPos, this.settings.reducedMotion);
    }

    createGameplayContent() {
        let yPos = this.contentBounds.y + 20;
        const leftX = this.contentBounds.x + 20;
        const rightX = this.contentBounds.x + this.contentBounds.width - 100;

        // Auto-Save Interval
        this.addLabel('Auto-Save', leftX, yPos);
        this.addDropdown('autoSaveInterval', rightX, yPos,
            ['1 min', '5 min', '10 min', 'Manual'],
            [1, 5, 10, 0],
            this.settings.autoSaveInterval);
        yPos += 50;

        // Notifications
        this.addLabel('Notifications:', leftX, yPos);
        yPos += 30;

        this.addLabel('Random Events', leftX + 20, yPos);
        this.addToggle('notifyRandomEvents', rightX, yPos, this.settings.notifyRandomEvents);
        yPos += 40;

        this.addLabel('Resource Full', leftX + 20, yPos);
        this.addToggle('notifyResourceFull', rightX, yPos, this.settings.notifyResourceFull);
        yPos += 40;

        this.addLabel('Production Done', leftX + 20, yPos);
        this.addToggle('notifyProductionComplete', rightX, yPos, this.settings.notifyProductionComplete);
        yPos += 50;

        // Tutorial Tips
        this.addLabel('Tutorial Tips', leftX, yPos);
        this.addToggle('tutorialTips', rightX, yPos, this.settings.tutorialTips);
        yPos += 40;

        // Confirmation Dialogs
        this.addLabel('Confirmations', leftX, yPos);
        this.addToggle('confirmationDialogs', rightX, yPos, this.settings.confirmationDialogs);
    }

    createDataContent() {
        let yPos = this.contentBounds.y + 20;
        const centerX = this.contentBounds.x + this.contentBounds.width / 2;

        // Export Save Data
        this.addButton('Export Save Data', centerX, yPos, () => this.exportSaveData());
        yPos += 60;

        // Import Save Data
        this.addButton('Import Save Data', centerX, yPos, () => this.importSaveData());
        yPos += 60;

        // Reset Game Progress
        this.addButton('Reset Progress', centerX, yPos, () => this.resetGameProgress(), 0x8b0000);
        yPos += 60;

        // Game Version
        this.addLabel(`Version: ${this.settings.gameVersion}`, centerX, yPos, true);
    }

    addLabel(text, x, y, centered = false) {
        const label = this.scene.add.text(x, y, text, {
            fontSize: '14px',
            fill: '#D4B896',
            fontFamily: 'Courier New'
        });

        if (centered) {
            label.setOrigin(0.5);
        }

        this.currentContent.push(label);
        this.modalContainer.add(label);
        return label;
    }

    addSlider(settingKey, x, y, value) {
        const sliderWidth = 120;
        const sliderHeight = 6;

        // Slider background
        const sliderBg = this.scene.add.rectangle(x, y, sliderWidth, sliderHeight, 0x654321);
        sliderBg.setStrokeStyle(1, 0x8b4513);
        this.currentContent.push(sliderBg);
        this.modalContainer.add(sliderBg);

        // Slider handle
        const handleX = x - sliderWidth/2 + (value / 100) * sliderWidth;
        const handle = this.scene.add.circle(handleX, y, 10, 0xD4B896);
        handle.setStrokeStyle(2, 0x8b4513);
        handle.setInteractive();
        handle.setData('settingKey', settingKey);
        handle.setData('sliderBg', sliderBg);

        // Value display
        const valueText = this.scene.add.text(x + sliderWidth/2 + 20, y, `${value}%`, {
            fontSize: '12px',
            fill: '#D4B896',
            fontFamily: 'Courier New'
        }).setOrigin(0, 0.5);

        // Drag functionality
        this.scene.input.setDraggable(handle);
        handle.on('drag', (pointer, dragX, dragY) => {
            const sliderLeft = x - sliderWidth/2;
            const sliderRight = x + sliderWidth/2;
            const clampedX = Phaser.Math.Clamp(dragX, sliderLeft, sliderRight);

            handle.x = clampedX;
            const newValue = Math.round(((clampedX - sliderLeft) / sliderWidth) * 100);
            valueText.setText(`${newValue}%`);

            this.updateSetting(settingKey, newValue);
        });

        this.currentContent.push(handle, valueText);
        this.modalContainer.add(handle);
        this.modalContainer.add(valueText);
    }

    addToggle(settingKey, x, y, value) {
        const toggleWidth = 50;
        const toggleHeight = 26;

        // Toggle background
        const toggleBg = this.scene.add.rectangle(x, y, toggleWidth, toggleHeight,
            value ? 0x8b4513 : 0x654321);
        toggleBg.setStrokeStyle(2, 0x8b4513);
        toggleBg.setInteractive();
        toggleBg.setData('settingKey', settingKey);

        // Toggle handle
        const handleX = value ? x + 12 : x - 12;
        const toggleHandle = this.scene.add.circle(handleX, y, 10, 0xD4B896);
        toggleHandle.setStrokeStyle(1, 0x8b4513);

        toggleBg.on('pointerdown', () => {
            const newValue = !this.settings[settingKey];
            this.updateSetting(settingKey, newValue);

            // Update visual
            toggleBg.setFillStyle(newValue ? 0x8b4513 : 0x654321);
            toggleHandle.x = newValue ? x + 12 : x - 12;
        });

        this.currentContent.push(toggleBg, toggleHandle);
        this.modalContainer.add(toggleBg);
        this.modalContainer.add(toggleHandle);
    }

    addDropdown(settingKey, x, y, displayValues, actualValues, currentValue) {
        const dropdownWidth = 120;
        const dropdownHeight = 30;

        // Find current display value
        const currentIndex = actualValues.indexOf(currentValue);
        const currentDisplay = displayValues[currentIndex] || displayValues[0];

        // Dropdown background
        const dropdown = this.scene.add.rectangle(x, y, dropdownWidth, dropdownHeight, 0x654321);
        dropdown.setStrokeStyle(2, 0x8b4513);
        dropdown.setInteractive();
        dropdown.setData('settingKey', settingKey);
        dropdown.setData('values', actualValues);
        dropdown.setData('displays', displayValues);
        dropdown.setData('currentIndex', currentIndex);

        // Dropdown text
        const dropdownText = this.scene.add.text(x, y, currentDisplay, {
            fontSize: '12px',
            fill: '#D4B896',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        // Click to cycle through options
        dropdown.on('pointerdown', () => {
            const currentIdx = dropdown.getData('currentIndex');
            const newIndex = (currentIdx + 1) % actualValues.length;
            const newValue = actualValues[newIndex];
            const newDisplay = displayValues[newIndex];

            dropdown.setData('currentIndex', newIndex);
            dropdownText.setText(newDisplay);
            this.updateSetting(settingKey, newValue);
        });

        this.currentContent.push(dropdown, dropdownText);
        this.modalContainer.add(dropdown);
        this.modalContainer.add(dropdownText);
    }

    addButton(text, x, y, callback, color = 0x654321) {
        const buttonWidth = 180;
        const buttonHeight = 40;

        const button = this.scene.add.rectangle(x, y, buttonWidth, buttonHeight, color);
        button.setStrokeStyle(2, 0x8b4513);
        button.setInteractive();

        const buttonText = this.scene.add.text(x, y, text, {
            fontSize: '14px',
            fill: '#D4B896',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);

        button.on('pointerdown', callback);

        // Hover effects
        button.on('pointerover', () => button.setFillStyle(color === 0x654321 ? 0x8b4513 : 0xff0000));
        button.on('pointerout', () => button.setFillStyle(color));

        this.currentContent.push(button, buttonText);
        this.modalContainer.add(button);
        this.modalContainer.add(buttonText);
    }

    closeSettingsMenu() {
        if (!this.isOpen) return;

        this.isOpen = false;
        if (this.modalContainer) {
            this.modalContainer.destroy();
            this.modalContainer = null;
        }
        if (this.currentContent) {
            this.currentContent = [];
        }
    }
    
    // Canvas-based content creation methods are above

    exportSaveData() {
        try {
            const gameData = {
                settings: this.settings,
                gameState: window.gameState || {},
                timestamp: Date.now(),
                version: this.settings.gameVersion
            };

            const dataStr = JSON.stringify(gameData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `kingdom-builder-save-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(link.href);
            console.log('Save data exported successfully');
        } catch (error) {
            console.error('Failed to export save data:', error);
        }
    }

    importSaveData() {
        // Create file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';

        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    // Validate data structure
                    if (!data.settings || !data.gameState) {
                        throw new Error('Invalid save file format');
                    }

                    // Confirm import
                    if (confirm('This will overwrite your current game progress. Are you sure?')) {
                        // Import settings
                        this.settings = { ...this.defaultSettings, ...data.settings };
                        this.saveSettings();
                        this.applySettings();

                        // Import game state
                        if (window.gameState && data.gameState) {
                            Object.assign(window.gameState, data.gameState);

                            // Trigger save system if available
                            if (this.scene.saveSystem && this.scene.saveSystem.saveGame) {
                                this.scene.saveSystem.saveGame();
                            }
                        }

                        alert('Save data imported successfully! Please refresh the page.');
                    }
                } catch (error) {
                    alert('Failed to import save data: ' + error.message);
                }

                // Clean up
                document.body.removeChild(fileInput);
            };

            reader.readAsText(file);
        };

        document.body.appendChild(fileInput);
        fileInput.click();
    }

    resetGameProgress() {
        const confirmText = 'RESET';
        const userInput = prompt(`This will permanently delete ALL game progress!\n\nType "${confirmText}" to confirm:`);

        if (userInput === confirmText) {
            const finalConfirm = confirm('Are you absolutely sure? This cannot be undone!');

            if (finalConfirm) {
                try {
                    console.log('Starting game reset...');

                    // Clear all localStorage data
                    localStorage.removeItem('kingdomBuilder_save'); // Game save data
                    localStorage.removeItem('game_settings'); // Settings data
                    localStorage.removeItem('game_settings_last_tab'); // UI state
                    console.log('localStorage cleared');

                    // Reset gameState to initial values
                    if (window.gameState) {
                        // Reset resources
                        window.gameState.resources = {
                            food: 10,
                            wood: 5,
                            stone: 0,
                            gold: 0,
                            population: 1
                        };

                        // Reset other state
                        window.gameState.nextPlotCost = 10;
                        window.gameState.isStarving = false;
                        window.gameState.lastFoodConsumption = Date.now();

                        // Reinitialize plots
                        if (window.gameState.init) {
                            window.gameState.init();
                        }
                        console.log('gameState reset');
                    }

                    // Reset settings to defaults
                    this.settings = { ...this.defaultSettings };
                    this.applySettings();
                    console.log('Settings reset');

                    // Use SaveSystem to ensure save is deleted
                    if (this.scene && this.scene.saveSystem) {
                        this.scene.saveSystem.deleteSave();
                        console.log('SaveSystem delete called');
                    }

                    // Clear any additional localStorage keys that might exist
                    const keysToRemove = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && (key.includes('kingdom') || key.includes('game_'))) {
                            keysToRemove.push(key);
                        }
                    }
                    keysToRemove.forEach(key => localStorage.removeItem(key));
                    console.log('Additional keys cleared:', keysToRemove);

                    alert('Game progress has been reset successfully! The page will now reload.');
                    window.location.reload();
                } catch (error) {
                    alert('Failed to reset game progress: ' + error.message);
                    console.error('Reset error:', error);
                }
            }
        }
    }

    // Utility method to get current setting value
    getSetting(key) {
        return this.settings[key];
    }

    // Method for other systems to check if confirmations are enabled
    shouldShowConfirmation() {
        return this.settings.confirmationDialogs;
    }

    // Method for other systems to check notification preferences
    shouldNotify(type) {
        switch (type) {
            case 'randomEvents':
                return this.settings.notifyRandomEvents;
            case 'resourceFull':
                return this.settings.notifyResourceFull;
            case 'productionComplete':
                return this.settings.notifyProductionComplete;
            default:
                return true;
        }
    }
}

// Expose globally
window.SettingsSystem = SettingsSystem;
