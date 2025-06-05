// Game configuration
const config = {
    type: Phaser.AUTO,
    width: Math.min(800, window.innerWidth),
    height: Math.min(600, window.innerHeight),
    backgroundColor: '#4a6741',
    scene: [], // Empty array - GameScene will be added when it's defined
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 320,
            height: 240
        },
        max: {
            width: 1920,
            height: 1080
        }
    },
    input: {
        activePointers: 3, // Support multi-touch
        smoothFactor: 0.2,
        targetFPS: 60
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

// Game constants
const GAME_CONSTANTS = {
    GRID_SIZE: 3,
    TILE_SIZE: 80,
    PLOT_SIZE: 64,
    BUILDING_SIZE: 48,
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    UPDATE_INTERVAL: 1000, // 1 second
    TARGET_FPS: 60,
    FOOD_CONSUMPTION_RATE: 60000, // 60 seconds
    
    // UI Colors
    COLORS: {
        UNLOCKED_PLOT: 0x8FBC8F,
        LOCKED_PLOT: 0x654321,
        PLOT_BORDER: 0x2F4F2F,
        MENU_BG: 0x2c1810,
        MENU_BORDER: 0x8b4513,
        BUTTON_ENABLED: 0x654321,
        BUTTON_DISABLED: 0x444444,
        BUTTON_HOVER: 0x8b4513,
        TEXT_PRIMARY: '#D4B896',
        TEXT_DISABLED: '#666666',
        TEXT_WHITE: '#ffffff',
        HARVEST_READY: 0xFFFF00,
        PROGRESS_BG: 0x333333,
        PROGRESS_FILL: 0x00FF00,
        
        // Resource colors
        FOOD_NORMAL: '#90EE90',
        FOOD_STARVING: '#FF6666',
        WOOD: '#8B4513',
        STONE: '#A0A0A0',
        GOLD: '#87CEEB',
        POPULATION: '#87CEEB',
        
        // Upgrade indicators
        AUTO_HARVEST: 0x00FF00,
        SPEED_BOOST: 0x0080FF,
        OUTPUT_MULT: 0xFF8000
    }
};

// Expose to global scope for main.js
window.config = config;