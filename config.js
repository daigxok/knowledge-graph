/**
 * Knowledge Graph System Configuration
 * Centralized configuration for paths, settings, and constants
 */

export const CONFIG = {
    // Data paths
    data: {
        domains: './data/domains.json',
        nodes: './data/nodes.json',
        edges: './data/edges.json'
    },

    // Skill system configuration
    skills: {
        registryPath: '../../higher_math_skills/skill_registry.js',
        enabled: true,
        lazyLoad: true
    },

    // Visualization settings
    visualization: {
        width: 'auto', // Will be set to container width
        height: 'auto', // Will be set to container height
        forceSimulation: {
            chargeStrength: -300,
            linkDistance: 100,
            linkStrength: 0.5,
            collisionRadius: 40,
            alphaDecay: 0.02,
            velocityDecay: 0.4
        },
        zoom: {
            minScale: 0.1,
            maxScale: 4,
            duration: 300
        }
    },

    // UI settings
    ui: {
        sidebarWidth: 300,
        detailPanelWidth: 400,
        searchDebounceMs: 300,
        notificationDuration: 3000,
        animationDuration: 300
    },

    // Storage settings
    storage: {
        enabled: true,
        key: 'knowledgeGraphState',
        maxSize: 1024 * 1024, // 1MB
        autoSave: true
    },

    // Performance settings
    performance: {
        enableVirtualization: false, // For future optimization
        enableCaching: true,
        cacheExpiry: 3600000, // 1 hour
        maxNodesForFullRender: 100
    },

    // Feature flags
    features: {
        crossDomainView: true,
        learningPath: true,
        skillIntegration: true,
        dataValidation: true,
        errorBoundary: true
    },

    // Logging settings
    logging: {
        enabled: true,
        level: 'info', // 'debug', 'info', 'warn', 'error'
        logToConsole: true,
        logToStorage: false
    }
};

/**
 * Get configuration value with dot notation
 * @param {string} path - Configuration path (e.g., 'visualization.zoom.minScale')
 * @param {*} defaultValue - Default value if path not found
 * @returns {*} Configuration value
 */
export function getConfig(path, defaultValue = undefined) {
    const keys = path.split('.');
    let value = CONFIG;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return defaultValue;
        }
    }
    
    return value;
}

/**
 * Set configuration value with dot notation
 * @param {string} path - Configuration path
 * @param {*} value - New value
 */
export function setConfig(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let obj = CONFIG;
    
    for (const key of keys) {
        if (!(key in obj)) {
            obj[key] = {};
        }
        obj = obj[key];
    }
    
    obj[lastKey] = value;
}

/**
 * Merge configuration with custom settings
 * @param {Object} customConfig - Custom configuration object
 */
export function mergeConfig(customConfig) {
    const merge = (target, source) => {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!(key in target)) {
                        target[key] = {};
                    }
                    merge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
    };
    
    merge(CONFIG, customConfig);
}

export default CONFIG;
