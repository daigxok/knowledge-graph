/**
 * FilterEngine
 * Manages all filtering operations including domain, chapter, difficulty, and search
 */

export class FilterEngine {
    constructor(graphEngine) {
        this.graphEngine = graphEngine;
        this.activeFilters = {
            domains: [],
            chapters: [],
            difficultyRange: [1, 5],
            searchKeyword: '',
            showCrossDomainOnly: false,
            nodeTypes: []
        };
    }

    /**
     * Filter nodes by domain
     * @param {Array} domainIds - Array of domain IDs
     * @returns {Array} Filtered nodes
     */
    filterByDomain(domainIds) {
        if (!domainIds || domainIds.length === 0) {
            return this.graphEngine.getAllNodes();
        }
        
        return this.graphEngine.getAllNodes().filter(node => 
            node.domains && node.domains.some(d => domainIds.includes(d))
        );
    }

    /**
     * Filter nodes by chapter
     * @param {Array} chapterIds - Array of chapter IDs
     * @returns {Array} Filtered nodes
     */
    filterByChapter(chapterIds) {
        if (!chapterIds || chapterIds.length === 0) {
            return this.graphEngine.getAllNodes();
        }
        
        return this.graphEngine.getAllNodes().filter(node => 
            chapterIds.includes(node.traditionalChapter)
        );
    }

    /**
     * Filter nodes by difficulty range
     * @param {number} minDiff - Minimum difficulty
     * @param {number} maxDiff - Maximum difficulty
     * @returns {Array} Filtered nodes
     */
    filterByDifficulty(minDiff, maxDiff) {
        return this.graphEngine.getAllNodes().filter(node => 
            node.difficulty >= minDiff && node.difficulty <= maxDiff
        );
    }

    /**
     * Filter nodes by keyword search
     * @param {string} keyword - Search keyword
     * @returns {Array} Filtered nodes
     */
    filterByKeyword(keyword) {
        if (!keyword || keyword.trim() === '') {
            return this.graphEngine.getAllNodes();
        }
        
        const lowerKeyword = keyword.toLowerCase();
        
        return this.graphEngine.getAllNodes().filter(node => {
            // Search in name
            if (node.name && node.name.toLowerCase().includes(lowerKeyword)) {
                return true;
            }
            
            // Search in nameEn
            if (node.nameEn && node.nameEn.toLowerCase().includes(lowerKeyword)) {
                return true;
            }
            
            // Search in description
            if (node.description && node.description.toLowerCase().includes(lowerKeyword)) {
                return true;
            }
            
            // Search in keywords
            if (node.keywords && node.keywords.some(k => k.toLowerCase().includes(lowerKeyword))) {
                return true;
            }
            
            return false;
        });
    }

    /**
     * Apply all active filters
     * @param {Object} filters - Filter criteria object
     * @returns {Array} Filtered nodes
     */
    applyFilters(filters) {
        this.activeFilters = { ...this.activeFilters, ...filters };
        
        let nodes = this.graphEngine.getAllNodes();
        
        // Apply domain filter
        if (this.activeFilters.domains && this.activeFilters.domains.length > 0) {
            nodes = nodes.filter(node => 
                node.domains && node.domains.some(d => this.activeFilters.domains.includes(d))
            );
        }
        
        // Apply chapter filter
        if (this.activeFilters.chapters && this.activeFilters.chapters.length > 0) {
            nodes = nodes.filter(node => 
                this.activeFilters.chapters.includes(node.traditionalChapter)
            );
        }
        
        // Apply difficulty filter
        const [minDiff, maxDiff] = this.activeFilters.difficultyRange;
        nodes = nodes.filter(node => 
            node.difficulty >= minDiff && node.difficulty <= maxDiff
        );
        
        // Apply keyword search
        if (this.activeFilters.searchKeyword && this.activeFilters.searchKeyword.trim() !== '') {
            const lowerKeyword = this.activeFilters.searchKeyword.toLowerCase();
            nodes = nodes.filter(node => {
                return (node.name && node.name.toLowerCase().includes(lowerKeyword)) ||
                       (node.nameEn && node.nameEn.toLowerCase().includes(lowerKeyword)) ||
                       (node.description && node.description.toLowerCase().includes(lowerKeyword)) ||
                       (node.keywords && node.keywords.some(k => k.toLowerCase().includes(lowerKeyword)));
            });
        }
        
        // Apply cross-domain filter
        if (this.activeFilters.showCrossDomainOnly) {
            nodes = nodes.filter(node => node.domains && node.domains.length > 1);
        }
        
        // Apply node type filter（概念/定理/方法/应用）
        if (this.activeFilters.nodeTypes && this.activeFilters.nodeTypes.length > 0) {
            const types = this.activeFilters.nodeTypes;
            nodes = nodes.filter(node => types.includes(node.type || 'concept'));
        }
        
        return nodes;
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.activeFilters = {
            domains: [],
            chapters: [],
            difficultyRange: [1, 5],
            searchKeyword: '',
            showCrossDomainOnly: false,
            nodeTypes: []
        };
    }

    /**
     * Get active filters
     * @returns {Object} Active filter criteria
     */
    getActiveFilters() {
        return { ...this.activeFilters };
    }

    /**
     * Set active filters
     * @param {Object} filters - Filter criteria
     */
    setActiveFilters(filters) {
        this.activeFilters = { ...this.activeFilters, ...filters };
    }

    /**
     * Get filtered edges based on visible nodes.
     * Includes "bridge" edges (at least one endpoint visible) so no visible node is left without edges.
     * Caller should add bridge endpoints to the node list for rendering (see getBridgeNodeIds).
     * @param {Array} visibleNodes - Array of visible node objects
     * @returns {Array} Filtered edges
     */
    getFilteredEdges(visibleNodes) {
        const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
        const allEdges = this.graphEngine.getAllEdges();

        // Include edges where at least one endpoint is visible (avoids isolated nodes in view)
        let filteredEdges = allEdges.filter(edge =>
            visibleNodeIds.has(edge.source) || visibleNodeIds.has(edge.target)
        );

        if (this.activeFilters.showCrossDomainOnly) {
            filteredEdges = filteredEdges.filter(edge => edge.type === 'cross-domain');
        }

        return filteredEdges;
    }

    /**
     * Get node IDs that appear in edges but not in visibleNodes (bridge endpoints).
     * Use with getFilteredEdges: add these nodes to the render set so edges render correctly.
     * @param {Array} visibleNodes - Array of visible node objects
     * @param {Array} filteredEdges - Edges from getFilteredEdges(visibleNodes)
     * @returns {Set<string>} IDs of nodes to add as bridge nodes
     */
    getBridgeNodeIds(visibleNodes, filteredEdges) {
        const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
        const bridgeIds = new Set();
        filteredEdges.forEach(edge => {
            if (!visibleNodeIds.has(edge.source)) bridgeIds.add(edge.source);
            if (!visibleNodeIds.has(edge.target)) bridgeIds.add(edge.target);
        });
        return bridgeIds;
    }
}
