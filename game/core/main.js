// Main game initialization with full system integration
console.log('Starting Kingdom Builder Game...');

// Development mode detection
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Verify all required components are loaded
const requiredGlobals = ['gameState', 'buildingTypes', 'config'];
const missingComponents = [];

requiredGlobals.forEach(component => {
    if (typeof window[component] === 'undefined') {
        missingComponents.push(component);
    }
});

if (missingComponents.length > 0) {
    console.error('Missing required components:', missingComponents);
    console.error('Check that all script files are loaded in correct order');
    alert('Game failed to load - check console for details');
} else {
    console.log('All required components loaded successfully');
}

// Development mode features
if (isDevelopment) {
    console.log('Development mode detected - enabling debug features');
    
    // Make game objects globally accessible for debugging
    window.gameState = gameState;
    window.buildingTypes = buildingTypes;
    
    // Debug helper functions
    window.debugAddResources = (resources) => {
        Object.keys(resources).forEach(resource => {
            if (gameState.resources.hasOwnProperty(resource)) {
                gameState.resources[resource] += resources[resource];
            }
        });
        console.log('Added resources:', resources);
        console.log('Current resources:', gameState.resources);
    };
    
    window.debugUnlockAllPlots = () => {
        gameState.plots.forEach(plot => plot.unlocked = true);
        console.log('All plots unlocked');
    };
    
    window.debugResetGame = () => {
        gameState.init();
        gameState.resources = { food: 50, wood: 0, stone: 0, gold: 20, population: 0 };
        console.log('Game state reset');
    };
}

// Ensure config is loaded from config.js
if (typeof config === 'undefined') {
    console.error('Config not loaded! Make sure config.js is included before main.js');
    alert('Game config missing - cannot start game');
} else {
    // Start the game
    const game = new Phaser.Game(config);

    // Global game instance for system access
    window.gameInstance = game;

    // Game initialization complete handler
    game.events.once('ready', () => {
        console.log('Kingdom Builder Game Initialized Successfully');
        console.log('Initial Resources:', gameState.resources);
        console.log('Available Buildings:', Object.keys(buildingTypes));
        console.log('Unlocked Plots:', gameState.plots.filter(plot => plot.unlocked).length);
        
        // Attempt to load saved game
        if (typeof SaveSystem !== 'undefined') {
            try {
                SaveSystem.loadGame();
                console.log('Saved game loaded successfully');
            } catch (error) {
                console.log('No saved game found or load failed, starting fresh');
                console.log('Load error:', error);
            }
            
            // Start auto-save timer (every 30 seconds)
            setInterval(() => {
                try {
                    SaveSystem.autoSave();
                    console.log('Auto-save completed');
                } catch (error) {
                    console.error('Auto-save failed:', error);
                }
            }, 30000);
            
            console.log('Save system initialized with auto-save every 30 seconds');
        } else {
            console.warn('SaveSystem not loaded - saves disabled');
        }
        
        // Initialize resource consumption timer if ResourceSystem exists
        if (typeof ResourceSystem !== 'undefined') {
            console.log('ResourceSystem detected - food consumption will be handled by ResourceSystem');
        } else {
            console.warn('ResourceSystem not loaded - food consumption disabled');
        }
    });

    // Error handling for game failures
    game.events.on('error', (error) => {
        console.error('Phaser Game Error:', error);
    });

    // Handle window resize for responsive design
    window.addEventListener('resize', () => {
        game.scale.refresh();
    });

    // Handle visibility change (pause when tab not active)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            game.scene.pause();
            console.log('Game paused - tab not visible');
        } else {
            game.scene.resume();
            console.log('Game resumed - tab visible');
        }
    });

    console.log('Game initialization complete - waiting for Phaser ready event');
}