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
     * Get filtered edges based on visible nodes
     * @param {Array} visibleNodes - Array of visible node objects
     * @returns {Array} Filtered edges
     */
    getFilteredEdges(visibleNodes) {
        const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
        
        // Filter edges where both source and target are visible
        const filteredEdges = this.graphEngine.getAllEdges().filter(edge => 
            visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
        );
        
        // If showing cross-domain only, filter to cross-domain edges
        if (this.activeFilters.showCrossDomainOnly) {
            return filteredEdges.filter(edge => edge.type === 'cross-domain');
        }
        
        return filteredEdges;
    }
}
