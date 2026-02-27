/**
 * LearningPathFinder
 * Generates recommended learning paths based on prerequisites and user progress
 */

export class LearningPathFinder {
    constructor(graphEngine) {
        this.graphEngine = graphEngine;
    }

    /**
     * Generate learning path to target node
     * @param {string} targetNodeId - Target node ID
     * @param {Array} currentKnowledge - Array of completed node IDs
     * @returns {Object} Learning path object
     */
    generatePath(targetNodeId, currentKnowledge = []) {
        const targetNode = this.graphEngine.getNode(targetNodeId);
        if (!targetNode) {
            throw new Error(`Target node ${targetNodeId} not found`);
        }

        // If target is already in current knowledge, return single-node path
        if (currentKnowledge.includes(targetNodeId)) {
            return {
                id: `path-${targetNodeId}`,
                targetNode: targetNodeId,
                steps: [{
                    node: targetNode,
                    order: 1,
                    reason: '已完成',
                    estimatedTime: 0
                }],
                totalTime: 0,
                difficulty: targetNode.difficulty,
                domains: targetNode.domains
            };
        }

        // Build prerequisite graph using BFS
        const path = this._findPrerequisitePath(targetNodeId, currentKnowledge);
        
        // Convert to learning path format
        return this._buildLearningPath(path, targetNodeId);
    }

    /**
     * Find prerequisite path using BFS
     * @param {string} targetId - Target node ID
     * @param {Array} completed - Completed node IDs
     * @returns {Array} Path of nodes
     */
    _findPrerequisitePath(targetId, completed) {
        const visited = new Set(completed);
        const queue = [];
        const parent = new Map();
        
        // Start from target and work backwards through prerequisites
        const allNodes = this.graphEngine.getAllNodes();
        const nodeMap = new Map(allNodes.map(n => [n.id, n]));
        
        // Find all nodes needed (target and its prerequisites recursively)
        const needed = new Set();
        const findNeeded = (nodeId) => {
            if (visited.has(nodeId) || needed.has(nodeId)) return;
            needed.add(nodeId);
            
            const node = nodeMap.get(nodeId);
            if (node && node.prerequisites) {
                node.prerequisites.forEach(prereqId => findNeeded(prereqId));
            }
        };
        
        findNeeded(targetId);
        
        // Build path by topological sort of needed nodes
        const path = [];
        const inDegree = new Map();
        const adjList = new Map();
        
        // Initialize
        needed.forEach(nodeId => {
            inDegree.set(nodeId, 0);
            adjList.set(nodeId, []);
        });
        
        // Build graph
        needed.forEach(nodeId => {
            const node = nodeMap.get(nodeId);
            if (node && node.prerequisites) {
                node.prerequisites.forEach(prereqId => {
                    if (needed.has(prereqId) && !visited.has(prereqId)) {
                        adjList.get(prereqId).push(nodeId);
                        inDegree.set(nodeId, inDegree.get(nodeId) + 1);
                    }
                });
            }
        });
        
        // Topological sort (Kahn's algorithm)
        const zeroQueue = [];
        inDegree.forEach((degree, nodeId) => {
            if (degree === 0 && !visited.has(nodeId)) {
                zeroQueue.push(nodeId);
            }
        });
        
        while (zeroQueue.length > 0) {
            const current = zeroQueue.shift();
            path.push(current);
            
            const neighbors = adjList.get(current) || [];
            neighbors.forEach(neighbor => {
                inDegree.set(neighbor, inDegree.get(neighbor) - 1);
                if (inDegree.get(neighbor) === 0) {
                    zeroQueue.push(neighbor);
                }
            });
        }
        
        return path;
    }

    /**
     * Build learning path object from node path
     * @param {Array} nodePath - Array of node IDs
     * @param {string} targetId - Target node ID
     * @returns {Object} Learning path
     */
    _buildLearningPath(nodePath, targetId) {
        const steps = [];
        let totalTime = 0;
        let totalDifficulty = 0;
        const domains = new Set();
        
        nodePath.forEach((nodeId, index) => {
            const node = this.graphEngine.getNode(nodeId);
            if (!node) return;
            
            // Determine reason for this step
            let reason = '';
            if (nodeId === targetId) {
                reason = '目标节点';
            } else if (index === 0) {
                reason = '基础知识';
            } else {
                // Check if this is a prerequisite for next nodes
                const nextNodes = nodePath.slice(index + 1);
                const isPrereqFor = nextNodes.find(nextId => {
                    const nextNode = this.graphEngine.getNode(nextId);
                    return nextNode && nextNode.prerequisites && nextNode.prerequisites.includes(nodeId);
                });
                
                if (isPrereqFor) {
                    const nextNode = this.graphEngine.getNode(isPrereqFor);
                    reason = `${nextNode.name}的前置知识`;
                } else {
                    reason = '相关知识';
                }
            }
            
            steps.push({
                node: node,
                order: index + 1,
                reason: reason,
                estimatedTime: node.estimatedStudyTime || 60
            });
            
            totalTime += node.estimatedStudyTime || 60;
            totalDifficulty += node.difficulty || 3;
            
            if (node.domains) {
                node.domains.forEach(d => domains.add(d));
            }
        });
        
        const avgDifficulty = steps.length > 0 ? totalDifficulty / steps.length : 3;
        
        return {
            id: `path-${targetId}-${Date.now()}`,
            targetNode: targetId,
            steps: steps,
            totalTime: totalTime,
            difficulty: Math.round(avgDifficulty * 10) / 10,
            domains: Array.from(domains)
        };
    }

    /**
     * Generate learning path for entire domain
     * @param {string} domainId - Domain ID
     * @returns {Object} Learning path
     */
    generateDomainPath(domainId) {
        const allNodes = this.graphEngine.getAllNodes();
        const domainNodes = allNodes.filter(node => 
            node.domains && node.domains.includes(domainId)
        );
        
        if (domainNodes.length === 0) {
            throw new Error(`No nodes found for domain ${domainId}`);
        }
        
        // Sort by difficulty and prerequisites
        const sortedNodes = this._topologicalSort(domainNodes);
        
        return this._buildLearningPath(sortedNodes.map(n => n.id), sortedNodes[sortedNodes.length - 1].id);
    }

    /**
     * Topological sort of nodes
     * @param {Array} nodes - Array of nodes
     * @returns {Array} Sorted nodes
     */
    _topologicalSort(nodes) {
        const nodeIds = new Set(nodes.map(n => n.id));
        const inDegree = new Map();
        const adjList = new Map();
        
        // Initialize
        nodes.forEach(node => {
            inDegree.set(node.id, 0);
            adjList.set(node.id, []);
        });
        
        // Build graph
        nodes.forEach(node => {
            if (node.prerequisites) {
                node.prerequisites.forEach(prereqId => {
                    if (nodeIds.has(prereqId)) {
                        adjList.get(prereqId).push(node.id);
                        inDegree.set(node.id, inDegree.get(node.id) + 1);
                    }
                });
            }
        });
        
        // Kahn's algorithm
        const queue = [];
        const result = [];
        
        inDegree.forEach((degree, nodeId) => {
            if (degree === 0) {
                queue.push(nodeId);
            }
        });
        
        while (queue.length > 0) {
            // Sort by difficulty first, then by node ID for stable ordering
            queue.sort((a, b) => {
                const nodeA = this.graphEngine.getNode(a);
                const nodeB = this.graphEngine.getNode(b);
                const diffA = nodeA.difficulty || 3;
                const diffB = nodeB.difficulty || 3;
                
                // Primary sort: by difficulty
                if (diffA !== diffB) {
                    return diffA - diffB;
                }
                
                // Secondary sort: by node ID for stable ordering
                return a.localeCompare(b);
            });
            
            const current = queue.shift();
            result.push(this.graphEngine.getNode(current));
            
            const neighbors = adjList.get(current) || [];
            neighbors.forEach(neighbor => {
                inDegree.set(neighbor, inDegree.get(neighbor) - 1);
                if (inDegree.get(neighbor) === 0) {
                    queue.push(neighbor);
                }
            });
        }
        
        return result;
    }

    /**
     * Calculate path difficulty
     * @param {Object} path - Learning path object
     * @returns {number} Average difficulty
     */
    getPathDifficulty(path) {
        if (!path || !path.steps || path.steps.length === 0) {
            return 0;
        }
        
        const totalDifficulty = path.steps.reduce((sum, step) => {
            return sum + (step.node.difficulty || 3);
        }, 0);
        
        return Math.round((totalDifficulty / path.steps.length) * 10) / 10;
    }

    /**
     * Calculate path estimated time
     * @param {Object} path - Learning path object
     * @returns {number} Total time in minutes
     */
    getPathEstimatedTime(path) {
        if (!path || !path.steps || path.steps.length === 0) {
            return 0;
        }
        
        return path.steps.reduce((sum, step) => {
            return sum + (step.estimatedTime || 60);
        }, 0);
    }

    /**
     * Find alternative paths to target
     * @param {string} targetNodeId - Target node ID
     * @param {number} count - Number of alternative paths
     * @returns {Array} Array of learning paths
     */
    findAlternativePaths(targetNodeId, count = 3) {
        const paths = [];
        const targetNode = this.graphEngine.getNode(targetNodeId);
        
        if (!targetNode) {
            return paths;
        }
        
        // Generate main path
        const mainPath = this.generatePath(targetNodeId, []);
        paths.push(mainPath);
        
        // Generate alternative paths by varying starting points
        const allNodes = this.graphEngine.getAllNodes();
        const potentialStarts = allNodes.filter(node => 
            node.id !== targetNodeId &&
            (!node.prerequisites || node.prerequisites.length === 0) &&
            node.domains && node.domains.some(d => targetNode.domains.includes(d))
        );
        
        for (let i = 0; i < Math.min(count - 1, potentialStarts.length); i++) {
            try {
                const altPath = this.generatePath(targetNodeId, [potentialStarts[i].id]);
                if (altPath.steps.length > 1) {
                    paths.push(altPath);
                }
            } catch (e) {
                // Skip if path generation fails
                console.warn(`Failed to generate alternative path: ${e.message}`);
            }
        }
        
        return paths.slice(0, count);
    }
}
