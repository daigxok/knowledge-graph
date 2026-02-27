/**
 * NodeManager - 节点管理器
 * 负责加载、查询和管理知识图谱节点
 */

const fs = require('fs');
const path = require('path');

class NodeManager {
  constructor() {
    this.nodes = new Map(); // id -> node
    this.nodesByDomain = new Map(); // domain -> nodes[]
    this.nodesByDifficulty = new Map(); // difficulty -> nodes[]
    this.edges = [];
    this.applications = [];
  }

  /**
   * 加载节点数据
   * @param {string[]} filePaths - JSON文件路径数组
   */
  loadNodes(filePaths) {
    for (const filePath of filePaths) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const nodes = data.data || data.nodes || [];
        
        for (const node of nodes) {
          this.nodes.set(node.id, node);
          
          // 按domain索引
          for (const domain of node.domains || []) {
            if (!this.nodesByDomain.has(domain)) {
              this.nodesByDomain.set(domain, []);
            }
            this.nodesByDomain.get(domain).push(node);
          }
          
          // 按difficulty索引
          const difficulty = node.difficulty;
          if (!this.nodesByDifficulty.has(difficulty)) {
            this.nodesByDifficulty.set(difficulty, []);
          }
          this.nodesByDifficulty.get(difficulty).push(node);
        }
        
        console.log(`✓ Loaded ${nodes.length} nodes from ${path.basename(filePath)}`);
      } catch (error) {
        console.error(`✗ Error loading ${filePath}:`, error.message);
      }
    }
    
    return this;
  }

  /**
   * 加载边关系数据
   * @param {string[]} filePaths - JSON文件路径数组
   */
  loadEdges(filePaths) {
    for (const filePath of filePaths) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const edges = data.data || data.edges || [];
        this.edges.push(...edges);
        console.log(`✓ Loaded ${edges.length} edges from ${path.basename(filePath)}`);
      } catch (error) {
        console.error(`✗ Error loading ${filePath}:`, error.message);
      }
    }
    
    return this;
  }

  /**
   * 加载应用案例数据
   * @param {string[]} filePaths - JSON文件路径数组
   */
  loadApplications(filePaths) {
    for (const filePath of filePaths) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const apps = data.data || data.applications || [];
        this.applications.push(...apps);
        console.log(`✓ Loaded ${apps.length} applications from ${path.basename(filePath)}`);
      } catch (error) {
        console.error(`✗ Error loading ${filePath}:`, error.message);
      }
    }
    
    return this;
  }

  /**
   * 根据ID获取节点
   * @param {string} id - 节点ID
   * @returns {Object|null}
   */
  getNodeById(id) {
    return this.nodes.get(id) || null;
  }

  /**
   * 根据domain获取节点
   * @param {string} domain - 学域ID
   * @returns {Object[]}
   */
  getNodesByDomain(domain) {
    return this.nodesByDomain.get(domain) || [];
  }

  /**
   * 根据difficulty获取节点
   * @param {number} difficulty - 难度值(1-5)
   * @returns {Object[]}
   */
  getNodesByDifficulty(difficulty) {
    return this.nodesByDifficulty.get(difficulty) || [];
  }

  /**
   * 根据difficulty范围获取节点
   * @param {number} minDifficulty - 最小难度
   * @param {number} maxDifficulty - 最大难度
   * @returns {Object[]}
   */
  getNodesByDifficultyRange(minDifficulty, maxDifficulty) {
    const result = [];
    for (let d = minDifficulty; d <= maxDifficulty; d++) {
      result.push(...(this.nodesByDifficulty.get(d) || []));
    }
    return result;
  }

  /**
   * 搜索节点（关键词搜索）
   * @param {string} keyword - 搜索关键词
   * @returns {Object[]}
   */
  searchNodes(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    const results = [];
    
    for (const node of this.nodes.values()) {
      const searchText = [
        node.name,
        node.nameEn,
        node.description,
        ...(node.keywords || [])
      ].join(' ').toLowerCase();
      
      if (searchText.includes(lowerKeyword)) {
        results.push(node);
      }
    }
    
    return results;
  }

  /**
   * 获取节点的前置节点
   * @param {string} nodeId - 节点ID
   * @returns {Object[]}
   */
  getPrerequisites(nodeId) {
    const node = this.getNodeById(nodeId);
    if (!node || !node.prerequisites) return [];
    
    return node.prerequisites
      .map(id => this.getNodeById(id))
      .filter(n => n !== null);
  }

  /**
   * 获取节点的后续节点（依赖当前节点的节点）
   * @param {string} nodeId - 节点ID
   * @returns {Object[]}
   */
  getSuccessors(nodeId) {
    const successors = [];
    
    for (const node of this.nodes.values()) {
      if (node.prerequisites && node.prerequisites.includes(nodeId)) {
        successors.push(node);
      }
    }
    
    return successors;
  }

  /**
   * 获取与节点相关的边
   * @param {string} nodeId - 节点ID
   * @returns {Object[]}
   */
  getRelatedEdges(nodeId) {
    return this.edges.filter(edge => 
      edge.source === nodeId || edge.target === nodeId
    );
  }

  /**
   * 获取与节点相关的应用案例
   * @param {string} nodeId - 节点ID
   * @returns {Object[]}
   */
  getRelatedApplications(nodeId) {
    return this.applications.filter(app =>
      app.relatedNodes && app.relatedNodes.includes(nodeId)
    );
  }

  /**
   * 获取统计信息
   * @returns {Object}
   */
  getStats() {
    const domainStats = {};
    for (const [domain, nodes] of this.nodesByDomain) {
      domainStats[domain] = nodes.length;
    }
    
    const difficultyStats = {};
    for (const [difficulty, nodes] of this.nodesByDifficulty) {
      difficultyStats[difficulty] = nodes.length;
    }
    
    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.length,
      totalApplications: this.applications.length,
      byDomain: domainStats,
      byDifficulty: difficultyStats
    };
  }

  /**
   * 获取所有节点
   * @returns {Object[]}
   */
  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  /**
   * 获取所有边
   * @returns {Object[]}
   */
  getAllEdges() {
    return this.edges;
  }

  /**
   * 获取所有应用案例
   * @returns {Object[]}
   */
  getAllApplications() {
    return this.applications;
  }
}

module.exports = NodeManager;
