class TooltipSystem {
    constructor(scene) {
        this.scene = scene;
        this.starTooltip = null;
    }

    // Helper function to create star shape points
    createStarPoints(size) {
        const points = [];
        const outerRadius = size;
        const innerRadius = size * 0.4;
        
        for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5 - Math.PI / 2; // Start from top
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            points.push(Math.cos(angle) * radius);
            points.push(Math.sin(angle) * radius);
        }
        return points;
    }

    createUpgradeStars(centerX, y, currentLevel, evolution) {
        const elements = [];
        const starSize = 8;
        const starSpacing = 20;
        const startX = centerX - (6 * starSpacing) / 2;
        
        // Use global evolutionTiers or fallback to default
        const evolutionData = (typeof evolutionTiers !== 'undefined') ? evolutionTiers : {
            0: { color: 0xFFFFFF, name: 'Base', maxLevel: 10 },
            1: { color: 0x00FF00, name: 'Tier 1', maxLevel: 20 },
            2: { color: 0x0080FF, name: 'Tier 2', maxLevel: 30 },
            3: { color: 0x8000FF, name: 'Tier 3', maxLevel: 40 },
            4: { color: 0xFF8000, name: 'Tier 4', maxLevel: 50 },
            5: { color: 0x000000, name: 'Tier 5', maxLevel: 60 },
            6: { color: 0xFFD700, name: 'Tier 6', maxLevel: 70 }
        };
        
        // Create 7 tiers of stars (70 levels total)
        for (let tier = 0; tier < 7; tier++) {
            const tierColor = evolutionData[tier].color;
            const tierStartLevel = tier * 10;
            const tierEndLevel = (tier + 1) * 10;
            
            // Determine if this tier is accessible
            const maxLevelForEvolution = evolutionData[evolution].maxLevel;
            const tierAccessible = tierStartLevel < maxLevelForEvolution;
            
            // Create star for this tier
            const starX = startX + tier * starSpacing;
            const isActive = currentLevel >= tierEndLevel;
            const isPartiallyFilled = currentLevel > tierStartLevel && currentLevel < tierEndLevel;
            
            let fillColor;
            let alpha = 1.0;
            
            if (!tierAccessible) {
                fillColor = 0x333333; // Dark gray for inaccessible tiers
                alpha = 0.3;
            } else if (isActive) {
                fillColor = tierColor; // Full color when tier is complete
            } else if (isPartiallyFilled) {
                fillColor = tierColor; // Same color but we'll add progress indicator
                alpha = 0.6;
            } else {
                fillColor = 0x666666; // Gray for unfilled but accessible
                alpha = 0.4;
            }
            
            // Create star shape using polygon
            const starPoints = this.createStarPoints(starSize);
            const star = this.scene.add.polygon(starX, y, starPoints, fillColor);
            star.setAlpha(alpha);
            star.setStrokeStyle(1, 0x000000);
            
            // Add partial fill indicator for current tier
            if (isPartiallyFilled) {
                const progress = (currentLevel - tierStartLevel) / 10;
                const progressBar = this.scene.add.rectangle(
                    starX, y + starSize + 3, 
                    starSize * 1.5 * progress, 2, 
                    tierColor
                );
                elements.push(progressBar);
            }
            
            // Make interactive for tooltips
            star.setInteractive();
            star.on('pointerover', () => {
                if (tierAccessible) {
                    this.showStarTooltip(starX, y - 15, tier, currentLevel, tierStartLevel, tierEndLevel, evolutionData);
                }
            });
            star.on('pointerout', () => {
                this.hideStarTooltip();
            });
            
            elements.push(star);
        }
        
        // Add level text below stars
        const levelText = this.scene.add.text(centerX, y + 20, `Level: ${currentLevel}/${evolutionData[evolution].maxLevel}`, {
            fontSize: '10px',
            fill: '#D4B896',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        elements.push(levelText);
        
        return { elements };
    }
    
    showStarTooltip(x, y, tier, currentLevel, tierStart, tierEnd, evolutionData) {
        this.hideStarTooltip();
        
        const tierName = evolutionData[tier].name || `Tier ${tier + 1}`;
        const levelRange = `${tierStart + 1}-${tierEnd}`;
        const status = currentLevel >= tierEnd ? 'Complete' : 
                      currentLevel > tierStart ? `${currentLevel - tierStart}/10` : 
                      'Locked';
        
        this.starTooltip = this.scene.add.text(x, y, `${tierName}\nLevels ${levelRange}\n${status}`, {
            fontSize: '10px',
            fill: '#FFFFFF',
            fontFamily: 'Courier New',
            backgroundColor: '#000000',
            padding: { x: 4, y: 2 },
            align: 'center'
        }).setOrigin(0.5);
    }

    hideStarTooltip() {
        if (this.starTooltip) {
            this.starTooltip.destroy();
            this.starTooltip = null;
        }
    }

    // Additional helper method for building tooltips
    createBuildingTooltip(x, y, buildingType, plotData) {
        this.hideStarTooltip(); // Reuse the same tooltip system
        
        const building = (typeof buildingTypes !== 'undefined') ? buildingTypes[buildingType] : null;
        if (!building) return;
        
        let tooltipText = `${building.name}\n`;
        
        // Add cost information
        if (building.cost) {
            const costItems = [];
            for (let resource in building.cost) {
                costItems.push(`${building.cost[resource]} ${resource}`);
            }
            tooltipText += `Cost: ${costItems.join(', ')}\n`;
        }
        
        // Add production information
        if (building.produces) {
            const produceItems = [];
            for (let resource in building.produces) {
                produceItems.push(`${building.produces[resource]} ${resource}`);
            }
            tooltipText += `Produces: ${produceItems.join(', ')}\n`;
        }
        
        // Add harvest time
        if (building.harvestTime) {
            const timeInSeconds = Math.floor(building.harvestTime / 1000);
            tooltipText += `Time: ${timeInSeconds}s\n`;
        }
        
        // Add plot-specific information if available
        if (plotData) {
            if (plotData.level > 1) {
                tooltipText += `Level: ${plotData.level}\n`;
            }
            if (plotData.autoHarvest) {
                tooltipText += `Auto-Harvest: Yes\n`;
            }
            if (plotData.productionSpeed !== 1.0) {
                tooltipText += `Speed: ${plotData.productionSpeed}x\n`;
            }
            if (plotData.harvestMultiplier !== 1.0) {
                tooltipText += `Output: ${plotData.harvestMultiplier}x\n`;
            }
        }
        
        this.starTooltip = this.scene.add.text(x, y, tooltipText.trim(), {
            fontSize: '10px',
            fill: '#FFFFFF',
            fontFamily: 'Courier New',
            backgroundColor: '#000000',
            padding: { x: 6, y: 4 },
            align: 'left'
        }).setOrigin(0.5);
    }

    // Helper method to show resource tooltips
    createResourceTooltip(x, y, resourceType, amount) {
        this.hideStarTooltip();
        
        const resourceNames = {
            food: 'Food',
            wood: 'Wood', 
            stone: 'Stone',
            gold: 'Gold',
            population: 'Population'
        };
        
        const resourceName = resourceNames[resourceType] || resourceType;
        const tooltipText = `${resourceName}: ${amount}`;
        
        this.starTooltip = this.scene.add.text(x, y, tooltipText, {
            fontSize: '12px',
            fill: '#FFFFFF',
            fontFamily: 'Courier New',
            backgroundColor: '#000000',
            padding: { x: 6, y: 4 },
            align: 'center'
        }).setOrigin(0.5);
    }
}