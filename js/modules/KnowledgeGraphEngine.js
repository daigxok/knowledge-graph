/**
 * KnowledgeGraphEngine
 * Core engine for managing the knowledge graph structure and relationships
 */

export class KnowledgeGraphEngine {
    constructor(nodes, edges) {
        this.nodes = nodes || [];
        this.edges = edges || [];
        this.nodeMap = new Map();
        this.adjacencyList = new Map();
        
        this._buildMaps();
    }

    /**
     * Build internal maps for fast lookup
     */
    _buildMaps() {
        // Build node map
        this.nodes.forEach(node => {
            this.nodeMap.set(node.id, node);
            this.adjacencyList.set(node.id, []);
        });
        
        // Build adjacency list
        this.edges.forEach(edge => {
            if (this.adjacencyList.has(edge.source)) {
                this.adjacencyList.get(edge.source).push({
                    target: edge.target,
                    type: edge.type,
                    strength: edge.strength
                });
            }
        });
    }

    /**
     * Get all nodes
     * @returns {Array} Array of node objects
     */
    getAllNodes() {
        return this.nodes;
    }

    /**
     * Get all edges
     * @returns {Array} Array of edge objects
     */
    getAllEdges() {
        return this.edges;
    }

    /**
     * Get node by ID
     * @param {string} nodeId - Node identifier
     * @returns {Object|null} Node object or null if not found
     */
    getNode(nodeId) {
        return this.nodeMap.get(nodeId) || null;
    }

    /**
     * Get neighbors of a node
     * @param {string} nodeId - Node identifier
     * @returns {Array} Array of neighbor node objects
     */
    getNeighbors(nodeId) {
        const neighbors = this.adjacencyList.get(nodeId) || [];
        return neighbors.map(n => this.getNode(n.target)).filter(Boolean);
    }

    /**
     * Get edges between two nodes
     * @param {string} nodeId1 - First node ID
     * @param {string} nodeId2 - Second node ID
     * @returns {Array} Array of edge objects
     */
    getEdgesBetween(nodeId1, nodeId2) {
        return this.edges.filter(edge => 
            (edge.source === nodeId1 && edge.target === nodeId2) ||
            (edge.source === nodeId2 && edge.target === nodeId1)
        );
    }

    /**
     * Get cross-domain links
     * @returns {Array} Array of cross-domain edge objects
     */
    getCrossDomainLinks() {
        return this.edges.filter(edge => edge.type === 'cross-domain');
    }

    /**
     * Get nodes that belong to multiple domains
     * @returns {Array} Array of node objects
     */
    getNodesByMultipleDomains() {
        return this.nodes.filter(node => node.domains && node.domains.length > 1);
    }

    /**
     * Add a node to the graph
     * @param {Object} node - Node object
     */
    addNode(node) {
        if (!this.nodeMap.has(node.id)) {
            this.nodes.push(node);
            this.nodeMap.set(node.id, node);
            this.adjacencyList.set(node.id, []);
        }
    }

    /**
     * Remove a node from the graph
     * @param {string} nodeId - Node identifier
     */
    removeNode(nodeId) {
        const index = this.nodes.findIndex(n => n.id === nodeId);
        if (index !== -1) {
            this.nodes.splice(index, 1);
            this.nodeMap.delete(nodeId);
            this.adjacencyList.delete(nodeId);
            
            // Remove edges connected to this node
            this.edges = this.edges.filter(edge => 
                edge.source !== nodeId && edge.target !== nodeId
            );
        }
    }

    /**
     * Add an edge to the graph
     * @param {Object} edge - Edge object
     */
    addEdge(edge) {
        this.edges.push(edge);
        if (this.adjacencyList.has(edge.source)) {
            this.adjacencyList.get(edge.source).push({
                target: edge.target,
                type: edge.type,
                strength: edge.strength
            });
        }
    }

    /**
     * Remove an edge from the graph
     * @param {string} edgeId - Edge identifier
     */
    removeEdge(edgeId) {
        const index = this.edges.findIndex(e => e.id === edgeId);
        if (index !== -1) {
            this.edges.splice(index, 1);
            this._buildMaps(); // Rebuild adjacency list
        }
    }

    /**
     * Get prerequisites for a node
     * @param {string} nodeId - Node identifier
     * @returns {Array} Array of prerequisite node objects
     */
    getPrerequisites(nodeId) {
        const node = this.getNode(nodeId);
        if (!node || !node.prerequisites) return [];
        
        return node.prerequisites
            .map(prereqId => this.getNode(prereqId))
            .filter(Boolean);
    }

    /**
     * Get nodes that depend on a given node
     * @param {string} nodeId - Node identifier
     * @returns {Array} Array of dependent node objects
     */
    getDependents(nodeId) {
        return this.nodes.filter(node => 
            node.prerequisites && node.prerequisites.includes(nodeId)
        );
    }

    /**
     * Check if there's a path between two nodes
     * @param {string} startId - Start node ID
     * @param {string} endId - End node ID
     * @returns {boolean} True if path exists
     */
    hasPath(startId, endId) {
        if (startId === endId) return true;
        
        const visited = new Set();
        const queue = [startId];
        
        while (queue.length > 0) {
            const current = queue.shift();
            if (current === endId) return true;
            
            if (!visited.has(current)) {
                visited.add(current);
                const neighbors = this.adjacencyList.get(current) || [];
                neighbors.forEach(n => queue.push(n.target));
            }
        }
        
        return false;
    }
}
