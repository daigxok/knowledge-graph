/**
 * LearningPathEngine - 学习路径引擎
 * 负责分析用户水平、推荐学习路径和估算学习时间
 */

class LearningPathEngine {
  constructor(nodeManager) {
    this.nodeManager = nodeManager;
  }

  /**
   * 分析用户当前水平
   * @param {string[]} completedNodeIds - 已完成的节点ID列表
   * @returns {Object} 用户水平分析结果
   */
  analyzeUserLevel(completedNodeIds) {
    const completedNodes = completedNodeIds
      .map(id => this.nodeManager.getNodeById(id))
      .filter(n => n !== null);
    
    if (completedNodes.length === 0) {
      return {
        level: 'beginner',
        averageDifficulty: 1,
        completedCount: 0,
        domains: {},
        suggestedDifficulty: 1
      };
    }
    
    // 计算平均难度
    const avgDifficulty = completedNodes.reduce((sum, n) => sum + n.difficulty, 0) / completedNodes.length;
    
    // 按domain统计
    const domainStats = {};
    for (const node of completedNodes) {
      for (const domain of node.domains || []) {
        domainStats[domain] = (domainStats[domain] || 0) + 1;
      }
    }
    
    // 确定用户水平
    let level = 'beginner';
    if (avgDifficulty >= 4) level = 'advanced';
    else if (avgDifficulty >= 2.5) level = 'intermediate';
    
    return {
      level,
      averageDifficulty: Math.round(avgDifficulty * 10) / 10,
      completedCount: completedNodes.length,
      domains: domainStats,
      suggestedDifficulty: Math.min(5, Math.ceil(avgDifficulty) + 1)
    };
  }

  /**
   * 推荐下一步可学习的节点
   * @param {string[]} completedNodeIds - 已完成的节点ID列表
   * @param {number} limit - 推荐数量限制
   * @returns {Object[]} 推荐的节点列表
   */
  recommendNextNodes(completedNodeIds, limit = 5) {
    const userLevel = this.analyzeUserLevel(completedNodeIds);
    const completedSet = new Set(completedNodeIds);
    const candidates = [];
    
    // 遍历所有节点，找出可学习的节点
    for (const node of this.nodeManager.getAllNodes()) {
      // 跳过已完成的节点
      if (completedSet.has(node.id)) continue;
      
      // 检查前置条件是否满足
      const prerequisites = node.prerequisites || [];
      const prerequisitesMet = prerequisites.every(preId => completedSet.has(preId));
      
      if (!prerequisitesMet) continue;
      
      // 计算推荐分数
      const difficultyMatch = 1 - Math.abs(node.difficulty - userLevel.suggestedDifficulty) / 5;
      const domainBonus = (node.domains || []).some(d => userLevel.domains[d]) ? 0.2 : 0;
      const score = difficultyMatch + domainBonus;
      
      candidates.push({
        node,
        score,
        reason: this._getRecommendationReason(node, userLevel, prerequisitesMet)
      });
    }
    
    // 按分数排序并返回前N个
    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, limit);
  }

  /**
   * 计算从起点到终点的学习路径
   * @param {string} startNodeId - 起点节点ID（可选，null表示从头开始）
   * @param {string} targetNodeId - 目标节点ID
   * @param {string[]} completedNodeIds - 已完成的节点ID列表
   * @returns {Object} 学习路径信息
   */
  calculatePath(startNodeId, targetNodeId, completedNodeIds = []) {
    const targetNode = this.nodeManager.getNodeById(targetNodeId);
    if (!targetNode) {
      return { error: 'Target node not found', path: [] };
    }
    
    const completedSet = new Set(completedNodeIds);
    const path = [];
    const visited = new Set();
    
    // 使用DFS收集所有前置节点
    const collectPrerequisites = (nodeId) => {
      if (visited.has(nodeId) || completedSet.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = this.nodeManager.getNodeById(nodeId);
      if (!node) return;
      
      // 先处理前置节点
      for (const preId of node.prerequisites || []) {
        collectPrerequisites(preId);
      }
      
      // 再添加当前节点
      path.push(node);
    };
    
    collectPrerequisites(targetNodeId);
    
    // 如果指定了起点，从起点开始
    if (startNodeId) {
      const startIndex = path.findIndex(n => n.id === startNodeId);
      if (startIndex >= 0) {
        return {
          path: path.slice(startIndex),
          totalNodes: path.length - startIndex,
          estimatedTime: this.estimatePathTime(path.slice(startIndex))
        };
      }
    }
    
    return {
      path,
      totalNodes: path.length,
      estimatedTime: this.estimatePathTime(path)
    };
  }

  /**
   * 估算学习路径所需时间
   * @param {Object[]} nodes - 节点列表
   * @returns {Object} 时间估算信息
   */
  estimatePathTime(nodes) {
    const totalMinutes = nodes.reduce((sum, node) => sum + (node.estimatedStudyTime || 60), 0);
    
    return {
      totalMinutes,
      hours: Math.round(totalMinutes / 60 * 10) / 10,
      days: Math.ceil(totalMinutes / (60 * 2)), // 假设每天学习2小时
      breakdown: nodes.map(node => ({
        nodeId: node.id,
        nodeName: node.name,
        minutes: node.estimatedStudyTime || 60
      }))
    };
  }

  /**
   * 获取推荐理由
   * @private
   */
  _getRecommendationReason(node, userLevel, prerequisitesMet) {
    const reasons = [];
    
    if (prerequisitesMet) {
      reasons.push('前置条件已满足');
    }
    
    if (Math.abs(node.difficulty - userLevel.suggestedDifficulty) <= 1) {
      reasons.push('难度适中');
    }
    
    if ((node.domains || []).some(d => userLevel.domains[d])) {
      reasons.push('与已学内容相关');
    }
    
    if (node.importance >= 4) {
      reasons.push('重要知识点');
    }
    
    return reasons.join('，');
  }

  /**
   * 获取学习路径的可视化数据
   * @param {Object[]} path - 学习路径
   * @returns {Object} 可视化数据
   */
  getPathVisualization(path) {
    const nodes = path.map((node, index) => ({
      id: node.id,
      name: node.name,
      difficulty: node.difficulty,
      order: index + 1,
      estimatedTime: node.estimatedStudyTime || 60
    }));
    
    const edges = [];
    for (let i = 0; i < path.length - 1; i++) {
      edges.push({
        source: path[i].id,
        target: path[i + 1].id,
        type: 'learning-path'
      });
    }
    
    return { nodes, edges };
  }
}

module.exports = LearningPathEngine;
