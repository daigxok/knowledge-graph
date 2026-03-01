/**
 * Node Data Manager
 * Handles CRUD operations for knowledge nodes
 */

import { auth } from './Auth.js';

export class NodeDataManager {
    constructor() {
        this.nodes = [];
        this.dataFile = 'data/nodes.json';
        this.backupPrefix = 'kg_nodes_backup_';
        this.maxBackups = 10;
    }
    
    /**
     * Set nodes from external source (e.g. main app graph data). Use this to sync with graph.
     * @param {Array} nodes - Array of node objects
     */
    setNodes(nodes) {
        this.nodes = Array.isArray(nodes) ? [...nodes] : [];
    }
    
    /**
     * Load nodes from data file (supports both { nodes: [] } and { data: [] } formats)
     */
    async loadNodes() {
        try {
            const response = await fetch(this.dataFile);
            if (!response.ok) {
                throw new Error('Failed to load nodes');
            }
            const data = await response.json();
            this.nodes = Array.isArray(data) ? data : (data.nodes || data.data || []);
            
            // CRITICAL: Validate this.nodes is an array before returning
            // This ensures getAllNodes() always has valid array data
            if (!Array.isArray(this.nodes)) {
                console.error('loadNodes: this.nodes is not an array after loading, resetting to empty array');
                this.nodes = [];
            }
            
            return this.nodes;
        } catch (error) {
            console.error('Error loading nodes:', error);
            // CRITICAL: Always set to empty array on error to maintain type safety
            this.nodes = [];
            return [];
        }
    }
    
    /**
     * Save nodes to localStorage (client-side only)
     * In production, this would save to a server
     */
    saveNodes() {
        try {
            // Create backup before saving
            this.createBackup();
            
            // Save to localStorage
            localStorage.setItem('kg_nodes_data', JSON.stringify(this.nodes));
            
            return { success: true, message: '节点数据已保存' };
        } catch (error) {
            console.error('Error saving nodes:', error);
            return { success: false, message: '保存失败：' + error.message };
        }
    }
    
    /**
     * Generate unique node ID
     */
    generateNodeId(domain) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const domainPrefix = domain ? domain.replace('domain-', 'd') : 'd0';
        return `node-${domainPrefix}-${timestamp}-${random}`;
    }
    
    /**
     * Create a new node
     */
    createNode(nodeData) {
        // Validate required fields
        const requiredFields = ['name', 'nameEn', 'description', 'domains'];
        for (const field of requiredFields) {
            if (!nodeData[field]) {
                return {
                    success: false,
                    message: `缺少必填字段：${field}`
                };
            }
        }
        
        // Validate domains is an array
        if (!Array.isArray(nodeData.domains) || nodeData.domains.length === 0) {
            return {
                success: false,
                message: '至少需要选择一个学域'
            };
        }
        
        // Generate node ID
        const nodeId = this.generateNodeId(nodeData.domains[0]);
        
        // Get current user
        const currentUser = auth.getCurrentUser();
        
        // Create new node object
        const newNode = {
            id: nodeId,
            name: nodeData.name,
            nameEn: nodeData.nameEn,
            description: nodeData.description,
            domains: nodeData.domains,
            difficulty: nodeData.difficulty || 3,
            importance: nodeData.importance || 3,
            prerequisites: nodeData.prerequisites || [],
            relatedSkills: nodeData.relatedSkills || [],
            formula: nodeData.formula || '',
            keywords: nodeData.keywords || [],
            estimatedStudyTime: nodeData.estimatedStudyTime || '2小时',
            createdAt: new Date().toISOString(),
            createdBy: currentUser ? currentUser.username : 'unknown',
            modifiedAt: new Date().toISOString(),
            modifiedBy: currentUser ? currentUser.username : 'unknown',
            version: 1
        };
        
        // Check for circular dependencies
        if (newNode.prerequisites.length > 0) {
            const circularCheck = this.detectCircularDependency(nodeId, newNode.prerequisites);
            if (circularCheck.hasCircle) {
                return {
                    success: false,
                    message: '检测到循环依赖：' + circularCheck.path.join(' → ')
                };
            }
        }
        
        // Add to nodes array
        this.nodes.push(newNode);
        
        // Save
        const saveResult = this.saveNodes();
        if (!saveResult.success) {
            // Rollback
            this.nodes.pop();
            return saveResult;
        }
        
        return {
            success: true,
            message: '节点创建成功',
            node: newNode
        };
    }
    
    /**
     * Update an existing node
     */
    updateNode(nodeId, updates) {
        const nodeIndex = this.nodes.findIndex(n => n.id === nodeId);
        
        if (nodeIndex === -1) {
            return {
                success: false,
                message: '节点不存在'
            };
        }
        
        const node = this.nodes[nodeIndex];
        
        // Check version conflict
        if (updates.version && updates.version !== node.version) {
            return {
                success: false,
                message: '数据冲突：节点已被其他用户修改',
                conflict: true,
                serverVersion: node,
                clientVersion: updates
            };
        }
        
        // Validate prerequisites for circular dependencies
        if (updates.prerequisites) {
            const circularCheck = this.detectCircularDependency(nodeId, updates.prerequisites);
            if (circularCheck.hasCircle) {
                return {
                    success: false,
                    message: '检测到循环依赖：' + circularCheck.path.join(' → ')
                };
            }
        }
        
        // Get current user
        const currentUser = auth.getCurrentUser();
        
        // Update node (preserve non-editable fields)
        const updatedNode = {
            ...node,
            ...updates,
            id: node.id, // Preserve ID
            createdAt: node.createdAt, // Preserve creation info
            createdBy: node.createdBy,
            modifiedAt: new Date().toISOString(),
            modifiedBy: currentUser ? currentUser.username : 'unknown',
            version: (node.version || 0) + 1
        };
        
        // Save old version for rollback
        const oldNode = { ...node };
        
        // Update in array
        this.nodes[nodeIndex] = updatedNode;
        
        // Save
        const saveResult = this.saveNodes();
        if (!saveResult.success) {
            // Rollback
            this.nodes[nodeIndex] = oldNode;
            return saveResult;
        }
        
        return {
            success: true,
            message: '节点更新成功',
            node: updatedNode
        };
    }
    
    /**
     * Delete a node
     */
    deleteNode(nodeId) {
        const nodeIndex = this.nodes.findIndex(n => n.id === nodeId);
        
        if (nodeIndex === -1) {
            return {
                success: false,
                message: '节点不存在'
            };
        }
        
        // Check if node is referenced by other nodes
        const dependentNodes = this.nodes.filter(n => 
            n.prerequisites && n.prerequisites.includes(nodeId)
        );
        
        if (dependentNodes.length > 0) {
            return {
                success: false,
                message: `无法删除：该节点被 ${dependentNodes.length} 个其他节点依赖`,
                dependentNodes: dependentNodes.map(n => ({ id: n.id, name: n.name }))
            };
        }
        
        // Remove node
        const deletedNode = this.nodes.splice(nodeIndex, 1)[0];
        
        // Save
        const saveResult = this.saveNodes();
        if (!saveResult.success) {
            // Rollback
            this.nodes.splice(nodeIndex, 0, deletedNode);
            return saveResult;
        }
        
        return {
            success: true,
            message: '节点删除成功'
        };
    }
    
    /**
     * Detect circular dependencies using DFS
     */
    detectCircularDependency(nodeId, prerequisites, visited = new Set(), path = []) {
        // Add current node to path
        path.push(nodeId);
        visited.add(nodeId);
        
        // Check each prerequisite
        for (const prereqId of prerequisites) {
            // If we've seen this node in current path, we have a circle
            if (path.includes(prereqId)) {
                return {
                    hasCircle: true,
                    path: [...path, prereqId]
                };
            }
            
            // If not visited, recursively check
            if (!visited.has(prereqId)) {
                const prereqNode = this.nodes.find(n => n.id === prereqId);
                if (prereqNode && prereqNode.prerequisites) {
                    const result = this.detectCircularDependency(
                        prereqId,
                        prereqNode.prerequisites,
                        visited,
                        [...path]
                    );
                    if (result.hasCircle) {
                        return result;
                    }
                }
            }
        }
        
        return { hasCircle: false, path: [] };
    }
    
    /**
     * Create backup of current nodes
     */
    createBackup() {
        try {
            const timestamp = Date.now();
            const backupKey = this.backupPrefix + timestamp;
            const backupData = {
                timestamp: timestamp,
                date: new Date().toISOString(),
                nodes: this.nodes
            };
            
            localStorage.setItem(backupKey, JSON.stringify(backupData));
            
            // Clean old backups
            this.cleanOldBackups();
            
            return { success: true, backupKey: backupKey };
        } catch (error) {
            console.error('Error creating backup:', error);
            return { success: false, message: error.message };
        }
    }
    
    /**
     * Clean old backups (keep only last N backups)
     */
    cleanOldBackups() {
        const backups = this.listBackups();
        
        if (backups.length > this.maxBackups) {
            // Sort by timestamp (oldest first)
            backups.sort((a, b) => a.timestamp - b.timestamp);
            
            // Remove oldest backups
            const toRemove = backups.slice(0, backups.length - this.maxBackups);
            toRemove.forEach(backup => {
                localStorage.removeItem(backup.key);
            });
        }
    }
    
    /**
     * List available backups
     */
    listBackups() {
        const backups = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.backupPrefix)) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    backups.push({
                        key: key,
                        timestamp: data.timestamp,
                        date: data.date,
                        nodeCount: data.nodes.length
                    });
                } catch (error) {
                    console.error('Error reading backup:', key, error);
                }
            }
        }
        
        // Sort by timestamp (newest first)
        backups.sort((a, b) => b.timestamp - a.timestamp);
        
        return backups;
    }
    
    /**
     * Restore from backup
     */
    restoreFromBackup(backupKey) {
        try {
            const backupData = localStorage.getItem(backupKey);
            if (!backupData) {
                return {
                    success: false,
                    message: '备份不存在'
                };
            }
            
            const data = JSON.parse(backupData);
            this.nodes = data.nodes;
            
            // Save restored data
            const saveResult = this.saveNodes();
            if (!saveResult.success) {
                return saveResult;
            }
            
            return {
                success: true,
                message: '数据恢复成功',
                nodeCount: this.nodes.length
            };
        } catch (error) {
            console.error('Error restoring backup:', error);
            return {
                success: false,
                message: '恢复失败：' + error.message
            };
        }
    }
    
    /**
     * Get node by ID
     */
    getNodeById(nodeId) {
        return this.nodes.find(n => n.id === nodeId);
    }
    
    /**
     * Get all nodes
     */
    getAllNodes() {
        // CRITICAL: Stricter type check to ensure return value is always an array
        // This prevents TypeError in NodeEditor when calling .filter() or other array methods
        if (!Array.isArray(this.nodes)) {
            console.warn('getAllNodes: this.nodes is not an array, returning empty array. Type:', typeof this.nodes);
            // Reset to empty array to fix the state
            this.nodes = [];
            return [];
        }
        return this.nodes;
    }
}

// Export singleton instance
export const nodeDataManager = new NodeDataManager();
