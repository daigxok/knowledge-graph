/**
 * SearchFilterEngine - 搜索过滤引擎
 * 负责全文搜索、多条件过滤和统计分析
 */

class SearchFilterEngine {
  constructor(nodeManager) {
    this.nodeManager = nodeManager;
    this.searchIndex = null;
  }

  /**
   * 构建搜索索引（倒排索引）
   */
  buildIndex() {
    this.searchIndex = new Map(); // term -> Set<nodeId>
    
    for (const node of this.nodeManager.getAllNodes()) {
      const terms = this._extractTerms(node);
      
      for (const term of terms) {
        if (!this.searchIndex.has(term)) {
          this.searchIndex.set(term, new Set());
        }
        this.searchIndex.get(term).add(node.id);
      }
    }
    
    console.log(`✓ Built search index with ${this.searchIndex.size} terms`);
    return this;
  }

  /**
   * 全文搜索
   * @param {string} query - 搜索查询
   * @returns {Object[]} 搜索结果
   */
  fullTextSearch(query) {
    if (!this.searchIndex) {
      this.buildIndex();
    }
    
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    if (terms.length === 0) return [];
    
    // 找出包含所有搜索词的节点
    let resultIds = null;
    
    for (const term of terms) {
      const matchingIds = this.searchIndex.get(term) || new Set();
      
      if (resultIds === null) {
        resultIds = new Set(matchingIds);
      } else {
        // 交集
        resultIds = new Set([...resultIds].filter(id => matchingIds.has(id)));
      }
    }
    
    if (!resultIds || resultIds.size === 0) return [];
    
    // 获取节点并计算相关性分数
    const results = [];
    for (const id of resultIds) {
      const node = this.nodeManager.getNodeById(id);
      if (node) {
        const score = this._calculateRelevanceScore(node, terms);
        results.push({ node, score });
      }
    }
    
    // 按相关性排序
    results.sort((a, b) => b.score - a.score);
    return results.map(r => r.node);
  }

  /**
   * 应用多条件过滤
   * @param {Object} filters - 过滤条件
   * @returns {Object[]} 过滤后的节点
   */
  applyFilters(filters) {
    let nodes = this.nodeManager.getAllNodes();
    
    // 按domain过滤
    if (filters.domains && filters.domains.length > 0) {
      nodes = nodes.filter(node =>
        (node.domains || []).some(d => filters.domains.includes(d))
      );
    }
    
    // 按difficulty范围过滤
    if (filters.minDifficulty !== undefined || filters.maxDifficulty !== undefined) {
      const min = filters.minDifficulty || 1;
      const max = filters.maxDifficulty || 5;
      nodes = nodes.filter(node => node.difficulty >= min && node.difficulty <= max);
    }
    
    // 按学习时长范围过滤
    if (filters.minStudyTime !== undefined || filters.maxStudyTime !== undefined) {
      const min = filters.minStudyTime || 0;
      const max = filters.maxStudyTime || Infinity;
      nodes = nodes.filter(node => {
        const time = node.estimatedStudyTime || 60;
        return time >= min && time <= max;
      });
    }
    
    // 按关键词过滤
    if (filters.keywords && filters.keywords.length > 0) {
      nodes = nodes.filter(node =>
        (node.keywords || []).some(k => filters.keywords.includes(k))
      );
    }
    
    // 按重要性过滤
    if (filters.minImportance !== undefined) {
      nodes = nodes.filter(node => (node.importance || 0) >= filters.minImportance);
    }
    
    // 按应用行业过滤
    if (filters.industries && filters.industries.length > 0) {
      nodes = nodes.filter(node => {
        const apps = node.realWorldApplications || [];
        return apps.some(app => filters.industries.includes(app.industry));
      });
    }
    
    return nodes;
  }

  /**
   * 按行业过滤应用案例
   * @param {string[]} industries - 行业列表
   * @returns {Object[]} 过滤后的应用案例
   */
  filterApplicationsByIndustry(industries) {
    return this.nodeManager.getAllApplications().filter(app =>
      industries.includes(app.industry)
    );
  }

  /**
   * 获取过滤统计信息
   * @param {Object} filters - 过滤条件
   * @returns {Object} 统计信息
   */
  getFilterStats(filters) {
    const filteredNodes = this.applyFilters(filters);
    
    const domainStats = {};
    const difficultyStats = {};
    const industryStats = {};
    
    for (const node of filteredNodes) {
      // Domain统计
      for (const domain of node.domains || []) {
        domainStats[domain] = (domainStats[domain] || 0) + 1;
      }
      
      // Difficulty统计
      const diff = node.difficulty;
      difficultyStats[diff] = (difficultyStats[diff] || 0) + 1;
      
      // Industry统计
      for (const app of node.realWorldApplications || []) {
        const industry = app.industry;
        industryStats[industry] = (industryStats[industry] || 0) + 1;
      }
    }
    
    return {
      totalNodes: filteredNodes.length,
      byDomain: domainStats,
      byDifficulty: difficultyStats,
      byIndustry: industryStats,
      averageDifficulty: filteredNodes.length > 0
        ? filteredNodes.reduce((sum, n) => sum + n.difficulty, 0) / filteredNodes.length
        : 0
    };
  }

  /**
   * 提取节点的搜索词
   * @private
   */
  _extractTerms(node) {
    const text = [
      node.name || '',
      node.nameEn || '',
      node.description || '',
      ...(node.keywords || [])
    ].join(' ');
    
    return text.toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 1);
  }

  /**
   * 计算相关性分数
   * @private
   */
  _calculateRelevanceScore(node, queryTerms) {
    let score = 0;
    const text = [
      node.name || '',
      node.nameEn || '',
      node.description || '',
      ...(node.keywords || [])
    ].join(' ').toLowerCase();
    
    for (const term of queryTerms) {
      // 名称匹配权重更高
      if ((node.name || '').toLowerCase().includes(term)) score += 3;
      if ((node.nameEn || '').toLowerCase().includes(term)) score += 2;
      if ((node.description || '').toLowerCase().includes(term)) score += 1;
      
      // 关键词完全匹配
      if ((node.keywords || []).some(k => k.toLowerCase() === term)) score += 2;
    }
    
    return score;
  }

  /**
   * 获取热门关键词
   * @param {number} limit - 返回数量
   * @returns {Object[]} 关键词及其出现次数
   */
  getPopularKeywords(limit = 20) {
    const keywordCount = new Map();
    
    for (const node of this.nodeManager.getAllNodes()) {
      for (const keyword of node.keywords || []) {
        keywordCount.set(keyword, (keywordCount.get(keyword) || 0) + 1);
      }
    }
    
    return Array.from(keywordCount.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 获取热门应用行业
   * @param {number} limit - 返回数量
   * @returns {Object[]} 行业及其应用案例数
   */
  getPopularIndustries(limit = 15) {
    const industryCount = new Map();
    
    for (const app of this.nodeManager.getAllApplications()) {
      const industry = app.industry;
      industryCount.set(industry, (industryCount.get(industry) || 0) + 1);
    }
    
    return Array.from(industryCount.entries())
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

module.exports = SearchFilterEngine;
