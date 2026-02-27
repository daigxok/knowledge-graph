/**
 * StateManager
 * Manages application state and user preferences
 */

export class StateManager {
    constructor() {
        this.state = {
            currentView: {
                zoomLevel: 1.0,
                centerX: 0,
                centerY: 0,
                selectedNodeId: null
            },
            filters: {
                domains: [],
                chapters: [],
                difficultyRange: [1, 5],
                searchKeyword: '',
                showCrossDomainOnly: false
            },
            userProgress: {
                completedNodes: [],
                currentPath: null,
                studyTime: 0
            },
            preferences: {
                theme: 'light',
                showLabels: true,
                animationSpeed: 'normal'
            }
        };
        
        this.storageKey = 'knowledgeGraphState';
    }

    /**
     * Get current state
     * @returns {Object} Current application state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Set state
     * @param {Object} newState - New state object (partial update)
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
    }

    /**
     * Reset state to defaults
     */
    resetState() {
        this.state = {
            currentView: {
                zoomLevel: 1.0,
                centerX: 0,
                centerY: 0,
                selectedNodeId: null
            },
            filters: {
                domains: [],
                chapters: [],
                difficultyRange: [1, 5],
                searchKeyword: '',
                showCrossDomainOnly: false
            },
            userProgress: {
                completedNodes: [],
                currentPath: null,
                studyTime: 0
            },
            preferences: {
                theme: 'light',
                showLabels: true,
                animationSpeed: 'normal'
            }
        };
    }

    /**
     * Save state to localStorage with capacity management
     */
    saveToLocalStorage() {
        try {
            const stateJSON = JSON.stringify(this.state);
            
            // Check if the state is too large
            if (stateJSON.length > 1024 * 1024) { // 1MB limit
                console.warn('State is too large, attempting to clean up...');
                this._cleanupState();
                return;
            }
            
            localStorage.setItem(this.storageKey, stateJSON);
            console.log('✓ State saved to localStorage');
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.warn('localStorage quota exceeded, cleaning up...');
                this._cleanupState();
                try {
                    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
                } catch (retryError) {
                    console.error('Failed to save state after cleanup:', retryError);
                }
            } else {
                console.error('Failed to save state to localStorage:', error);
            }
        }
    }

    /**
     * Clean up state to free up space
     * @private
     */
    _cleanupState() {
        // Keep only essential state, remove study history
        const minimalState = {
            currentView: this.state.currentView,
            filters: this.state.filters,
            userProgress: {
                completedNodes: this.state.userProgress.completedNodes,
                currentPath: null,
                studyTime: 0
            },
            preferences: this.state.preferences
        };
        
        this.state = minimalState;
        console.log('✓ State cleaned up');
    }

    /**
     * Load state from localStorage
     * @returns {Object|null} Loaded state or null if not found
     */
    loadFromLocalStorage() {
        try {
            const stateJSON = localStorage.getItem(this.storageKey);
            if (stateJSON) {
                this.state = JSON.parse(stateJSON);
                console.log('✓ State loaded from localStorage');
                return this.state;
            }
        } catch (error) {
            console.error('Failed to load state from localStorage:', error);
        }
        return null;
    }

    /**
     * Mark a node as completed
     * @param {string} nodeId - Node identifier
     */
    markNodeAsCompleted(nodeId) {
        if (!this.state.userProgress.completedNodes.includes(nodeId)) {
            this.state.userProgress.completedNodes.push(nodeId);
            this.saveToLocalStorage();
        }
    }

    /**
     * Get completed nodes
     * @returns {Array} Array of completed node IDs
     */
    getCompletedNodes() {
        return this.state.userProgress.completedNodes;
    }

    /**
     * Get progress statistics
     * @returns {Object} Progress statistics
     */
    getProgress() {
        return {
            completedCount: this.state.userProgress.completedNodes.length,
            studyTime: this.state.userProgress.studyTime,
            currentPath: this.state.userProgress.currentPath
        };
    }

    /**
     * Update study time
     * @param {number} seconds - Study time in seconds
     */
    updateStudyTime(seconds) {
        this.state.userProgress.studyTime += seconds;
        this.saveToLocalStorage();
    }

    /**
     * Set current learning path
     * @param {string} pathId - Learning path identifier
     */
    setCurrentPath(pathId) {
        this.state.userProgress.currentPath = pathId;
        this.saveToLocalStorage();
    }

    /**
     * Update current view
     * @param {Object} viewState - View state object
     */
    updateView(viewState) {
        this.state.currentView = { ...this.state.currentView, ...viewState };
    }

    /**
     * Update filters
     * @param {Object} filters - Filter criteria
     */
    updateFilters(filters) {
        this.state.filters = { ...this.state.filters, ...filters };
    }

    /**
     * Update preferences
     * @param {Object} preferences - User preferences
     */
    updatePreferences(preferences) {
        this.state.preferences = { ...this.state.preferences, ...preferences };
        this.saveToLocalStorage();
    }

    /**
     * Export state as JSON
     * @returns {string} JSON string of current state
     */
    exportState() {
        return JSON.stringify(this.state, null, 2);
    }

    /**
     * Import state from JSON
     * @param {string} stateJSON - JSON string of state
     */
    importState(stateJSON) {
        try {
            this.state = JSON.parse(stateJSON);
            this.saveToLocalStorage();
            console.log('✓ State imported successfully');
        } catch (error) {
            console.error('Failed to import state:', error);
            throw new Error('Invalid state JSON');
        }
    }
}
