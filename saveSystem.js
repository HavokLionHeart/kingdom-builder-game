        const SaveSystem = {
            save() {
                try {
                    const saveData = {
                        ...gameState,
                        version: "1.0",
                        savedAt: Date.now()
                    };
                    localStorage.setItem('medievalKingdomBuilder', JSON.stringify(saveData));
                    console.log('Game saved successfully');
                    return true;
                } catch (error) {
                    console.error('Failed to save game:', error);
                    return false;
                }
            },

            load() {
                try {
                    const savedData = localStorage.getItem('medievalKingdomBuilder');
                    if (!savedData) return false;

                    const data = JSON.parse(savedData);
                    
                    // Version compatibility check
                    if (data.version !== "1.0") {
                        console.warn('Save version mismatch, starting fresh');
                        return false;
                    }

                    // Calculate offline time and income
                    const offlineTime = Date.now() - data.savedAt;
                    console.log(`Offline for ${Math.floor(offlineTime / 1000)} seconds`);

                    // Restore game state
                    Object.assign(gameState, data);
                    
                    // Process offline progress
                    this.processOfflineProgress(offlineTime);
                    
                    return true;
                } catch (error) {
                    console.error('Failed to load game:', error);
                    return false;
                }
            },

            processOfflineProgress(offlineTime) {
                if (offlineTime < 5000) return; // Skip if less than 5 seconds offline

                let offlineIncome = { gold: 0, food: 0, wood: 0, population: 0 };
                
                gameState.plots.forEach(plot => {
                    if (plot.building && plot.unlocked) {
                        const buildingDef = buildingTypes[plot.building];
                        if (!buildingDef) {
                            console.warn(`Unknown building type: ${plot.building}, resetting plot`);
                            plot.building = null;
                            return;
                        }
                        const harvestsCompleted = Math.floor(offlineTime / buildingDef.harvestTime);
                        
                        if (harvestsCompleted > 0) {
                            Object.keys(buildingDef.produces).forEach(resource => {
                                const amount = buildingDef.produces[resource] * harvestsCompleted;
                                offlineIncome[resource] += amount;
                                gameState.resources[resource] += amount;
                            });
                        }

                        // Set next harvest time
                        const timeInCurrentCycle = offlineTime % buildingDef.harvestTime;
                        plot.nextHarvest = Date.now() + (buildingDef.harvestTime - timeInCurrentCycle);
                        plot.harvestReady = timeInCurrentCycle >= buildingDef.harvestTime;
                    }
                });

                // Show offline income popup if significant
                const totalOfflineGold = offlineIncome.gold;
                if (totalOfflineGold > 0) {
                    console.log('Offline income:', offlineIncome);
                    // We'll add a visual popup later
                }
            },

            autoSave() {
                this.save();
            },

            clearSave() {
                localStorage.removeItem('medievalKingdomBuilder');
                console.log('Save data cleared');
            }
        };