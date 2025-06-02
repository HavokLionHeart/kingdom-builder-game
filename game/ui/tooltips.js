class TooltipSystem {
    constructor(scene) {
        this.scene = scene;
        this.starTooltip = null;
    }

    createUpgradeStars(centerX, y, currentLevel, evolution) {
        const elements = [];
        const starSize = 8;
        const starSpacing = 20;
        const startX = centerX - (6 * starSpacing) / 2;
        
        // Create 7 tiers of stars (70 levels total)
        for (let tier = 0; tier < 7; tier++) {
            const tierColor = evolutionTiers[tier].color;
            const tierStartLevel = tier * 10;
            const tierEndLevel = (tier + 1) * 10;
            
            // Determine if this tier is accessible
            const maxLevelForEvolution = evolutionTiers[evolution].maxLevel;
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
            
            // Create star shape using multiple triangles
            const star = this.scene.add.star(starX, y, 5, starSize/2, starSize, fillColor);
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
                    this.showStarTooltip(starX, y - 15, tier, currentLevel, tierStartLevel, tierEndLevel);
                }
            });
            star.on('pointerout', () => {
                this.hideStarTooltip();
            });
            
            elements.push(star);
        }
        
        // Add level text below stars
        const levelText = this.scene.add.text(centerX, y + 20, `Level: ${currentLevel}/${evolutionTiers[evolution].maxLevel}`, {
            fontSize: '10px',
            fill: '#D4B896',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        elements.push(levelText);
        
        return { elements };
    }
    
        showStarTooltip(x, y, tier, currentLevel, tierStart, tierEnd) {
        this.hideStarTooltip();
        
        const tierName = `Tier ${tier + 1}`;
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
}