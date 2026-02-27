/**
 * DataParser - Phase 2数据解析器
 * 
 * 负责安全地加载和解析Phase 2的JSON数据文件
 * 
 * 主要功能:
 * - parseNodes(jsonData): 解析nodes JSON文件
 * - parseEdges(jsonData): 解析edges JSON文件
 * - parseApplications(jsonData): 解析applications JSON文件
 * - 提供详细的解析错误信息
 * 
 * 使用示例:
 *   const parser = new DataParser();
 *   const result = parser.parseNodes(jsonString);
 *   if (result.success) {
 *     console.log('解析成功:', result.data);
 *   } else {
 *     console.error('解析失败:', result.error);
 *   }
 * 
 * 验证需求: 15.1, 15.2, 15.3, 15.4
 */

class DataParser {
  constructor() {
    this.errors = [];
  }

  /**
   * 解析nodes JSON文件
   * @param {string|Object} jsonData - JSON字符串或已解析的对象
   * @returns {Object} 解析结果 { success: boolean, data: Array|null, error: Object|null }
   */
  parseNodes(jsonData) {
    try {
      // 如果是字符串，先解析JSON
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      // 验证基本结构
      if (!parsed || typeof parsed !== 'object') {
        return this.createErrorResult(
          'INVALID_FORMAT',
          '数据格式无效：期望一个对象',
          { received: typeof parsed }
        );
      }

      // 支持两种格式：直接数组或包含metadata的对象
      let nodes;
      if (Array.isArray(parsed)) {
        nodes = parsed;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        nodes = parsed.data;
      } else if (parsed.nodes && Array.isArray(parsed.nodes)) {
        nodes = parsed.nodes;
      } else {
        return this.createErrorResult(
          'INVALID_STRUCTURE',
          '无法找到节点数组：期望 data 或 nodes 字段包含数组',
          { keys: Object.keys(parsed) }
        );
      }

      // 验证每个节点的基本结构
      const validatedNodes = [];
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const validation = this.validateNodeStructure(node, i);
        
        if (!validation.valid) {
          return this.createErrorResult(
            'INVALID_NODE',
            `节点 ${i} 验证失败: ${validation.error}`,
            { index: i, node, reason: validation.error }
          );
        }
        
        validatedNodes.push(node);
      }

      return {
        success: true,
        data: validatedNodes,
        error: null,
        metadata: parsed.metadata || null,
        count: validatedNodes.length
      };

    } catch (error) {
      return this.createParseError(error, 'nodes');
    }
  }

  /**
   * 解析edges JSON文件
   * @param {string|Object} jsonData - JSON字符串或已解析的对象
   * @returns {Object} 解析结果 { success: boolean, data: Array|null, error: Object|null }
   */
  parseEdges(jsonData) {
    try {
      // 如果是字符串，先解析JSON
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      // 验证基本结构
      if (!parsed || typeof parsed !== 'object') {
        return this.createErrorResult(
          'INVALID_FORMAT',
          '数据格式无效：期望一个对象',
          { received: typeof parsed }
        );
      }

      // 支持两种格式：直接数组或包含metadata的对象
      let edges;
      if (Array.isArray(parsed)) {
        edges = parsed;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        edges = parsed.data;
      } else if (parsed.edges && Array.isArray(parsed.edges)) {
        edges = parsed.edges;
      } else {
        return this.createErrorResult(
          'INVALID_STRUCTURE',
          '无法找到边数组：期望 data 或 edges 字段包含数组',
          { keys: Object.keys(parsed) }
        );
      }

      // 验证每条边的基本结构
      const validatedEdges = [];
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const validation = this.validateEdgeStructure(edge, i);
        
        if (!validation.valid) {
          return this.createErrorResult(
            'INVALID_EDGE',
            `边 ${i} 验证失败: ${validation.error}`,
            { index: i, edge, reason: validation.error }
          );
        }
        
        validatedEdges.push(edge);
      }

      return {
        success: true,
        data: validatedEdges,
        error: null,
        metadata: parsed.metadata || null,
        count: validatedEdges.length
      };

    } catch (error) {
      return this.createParseError(error, 'edges');
    }
  }

  /**
   * 解析applications JSON文件
   * @param {string|Object} jsonData - JSON字符串或已解析的对象
   * @returns {Object} 解析结果 { success: boolean, data: Array|null, error: Object|null }
   */
  parseApplications(jsonData) {
    try {
      // 如果是字符串，先解析JSON
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      // 验证基本结构
      if (!parsed || typeof parsed !== 'object') {
        return this.createErrorResult(
          'INVALID_FORMAT',
          '数据格式无效：期望一个对象',
          { received: typeof parsed }
        );
      }

      // 支持两种格式：直接数组或包含metadata的对象
      let applications;
      if (Array.isArray(parsed)) {
        applications = parsed;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        applications = parsed.data;
      } else if (parsed.applications && Array.isArray(parsed.applications)) {
        applications = parsed.applications;
      } else {
        return this.createErrorResult(
          'INVALID_STRUCTURE',
          '无法找到应用案例数组：期望 data 或 applications 字段包含数组',
          { keys: Object.keys(parsed) }
        );
      }

      // 验证每个应用案例的基本结构
      const validatedApplications = [];
      for (let i = 0; i < applications.length; i++) {
        const app = applications[i];
        const validation = this.validateApplicationStructure(app, i);
        
        if (!validation.valid) {
          return this.createErrorResult(
            'INVALID_APPLICATION',
            `应用案例 ${i} 验证失败: ${validation.error}`,
            { index: i, application: app, reason: validation.error }
          );
        }
        
        validatedApplications.push(app);
      }

      return {
        success: true,
        data: validatedApplications,
        error: null,
        metadata: parsed.metadata || null,
        count: validatedApplications.length
      };

    } catch (error) {
      return this.createParseError(error, 'applications');
    }
  }

  /**
   * 验证节点结构
   * @param {Object} node - 节点对象
   * @param {number} index - 节点索引
   * @returns {Object} { valid: boolean, error: string|null }
   */
  validateNodeStructure(node, index) {
    if (!node || typeof node !== 'object') {
      return { valid: false, error: '节点必须是对象' };
    }

    // 检查必需字段
    const requiredFields = ['id', 'name'];
    for (const field of requiredFields) {
      if (!(field in node)) {
        return { valid: false, error: `缺少必需字段: ${field}` };
      }
      if (typeof node[field] !== 'string' || node[field].trim() === '') {
        return { valid: false, error: `字段 ${field} 必须是非空字符串` };
      }
    }

    // 验证id格式
    if (!node.id.startsWith('node-')) {
      return { valid: false, error: `节点ID必须以 'node-' 开头，当前: ${node.id}` };
    }

    // 验证domains字段（如果存在）
    if ('domains' in node) {
      if (!Array.isArray(node.domains)) {
        return { valid: false, error: 'domains 字段必须是数组' };
      }
    }

    // 验证difficulty字段（如果存在）
    if ('difficulty' in node) {
      if (typeof node.difficulty !== 'number') {
        return { valid: false, error: 'difficulty 字段必须是数字' };
      }
      if (node.difficulty < 1 || node.difficulty > 5) {
        return { valid: false, error: `difficulty 必须在 1-5 范围内，当前: ${node.difficulty}` };
      }
    }

    // 验证prerequisites字段（如果存在）
    if ('prerequisites' in node) {
      if (!Array.isArray(node.prerequisites)) {
        return { valid: false, error: 'prerequisites 字段必须是数组' };
      }
    }

    return { valid: true, error: null };
  }

  /**
   * 验证边结构
   * @param {Object} edge - 边对象
   * @param {number} index - 边索引
   * @returns {Object} { valid: boolean, error: string|null }
   */
  validateEdgeStructure(edge, index) {
    if (!edge || typeof edge !== 'object') {
      return { valid: false, error: '边必须是对象' };
    }

    // 检查必需字段
    const requiredFields = ['id', 'source', 'target'];
    for (const field of requiredFields) {
      if (!(field in edge)) {
        return { valid: false, error: `缺少必需字段: ${field}` };
      }
      if (typeof edge[field] !== 'string' || edge[field].trim() === '') {
        return { valid: false, error: `字段 ${field} 必须是非空字符串` };
      }
    }

    // 验证id格式
    if (!edge.id.startsWith('edge-')) {
      return { valid: false, error: `边ID必须以 'edge-' 开头，当前: ${edge.id}` };
    }

    // 验证source和target格式
    if (!edge.source.startsWith('node-')) {
      return { valid: false, error: `source必须以 'node-' 开头，当前: ${edge.source}` };
    }
    if (!edge.target.startsWith('node-')) {
      return { valid: false, error: `target必须以 'node-' 开头，当前: ${edge.target}` };
    }

    // 验证type字段（如果存在）
    if ('type' in edge) {
      const validTypes = ['prerequisite', 'cross-domain', 'application'];
      if (!validTypes.includes(edge.type)) {
        return { valid: false, error: `type 必须是 ${validTypes.join(', ')} 之一，当前: ${edge.type}` };
      }
    }

    // 验证strength字段（如果存在）
    if ('strength' in edge) {
      if (typeof edge.strength !== 'number') {
        return { valid: false, error: 'strength 字段必须是数字' };
      }
      if (edge.strength < 0 || edge.strength > 1) {
        return { valid: false, error: `strength 必须在 0-1 范围内，当前: ${edge.strength}` };
      }
    }

    return { valid: true, error: null };
  }

  /**
   * 验证应用案例结构
   * @param {Object} app - 应用案例对象
   * @param {number} index - 应用案例索引
   * @returns {Object} { valid: boolean, error: string|null }
   */
  validateApplicationStructure(app, index) {
    if (!app || typeof app !== 'object') {
      return { valid: false, error: '应用案例必须是对象' };
    }

    // 检查必需字段
    const requiredFields = ['id', 'title'];
    for (const field of requiredFields) {
      if (!(field in app)) {
        return { valid: false, error: `缺少必需字段: ${field}` };
      }
      if (typeof app[field] !== 'string' || app[field].trim() === '') {
        return { valid: false, error: `字段 ${field} 必须是非空字符串` };
      }
    }

    // 验证id格式
    if (!app.id.startsWith('app-')) {
      return { valid: false, error: `应用案例ID必须以 'app-' 开头，当前: ${app.id}` };
    }

    // 验证relatedNodes字段（如果存在）
    if ('relatedNodes' in app) {
      if (!Array.isArray(app.relatedNodes)) {
        return { valid: false, error: 'relatedNodes 字段必须是数组' };
      }
    }

    // 验证difficulty字段（如果存在）
    if ('difficulty' in app) {
      if (typeof app.difficulty !== 'number') {
        return { valid: false, error: 'difficulty 字段必须是数字' };
      }
      if (app.difficulty < 1 || app.difficulty > 5) {
        return { valid: false, error: `difficulty 必须在 1-5 范围内，当前: ${app.difficulty}` };
      }
    }

    return { valid: true, error: null };
  }

  /**
   * 创建错误结果对象
   * @param {string} type - 错误类型
   * @param {string} message - 错误消息
   * @param {Object} details - 错误详情
   * @returns {Object} 错误结果
   */
  createErrorResult(type, message, details = {}) {
    return {
      success: false,
      data: null,
      error: {
        type,
        message,
        details,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * 创建JSON解析错误结果
   * @param {Error} error - 原始错误对象
   * @param {string} dataType - 数据类型（nodes/edges/applications）
   * @returns {Object} 错误结果
   */
  createParseError(error, dataType) {
    let errorType = 'PARSE_ERROR';
    let message = `解析${dataType}数据失败`;
    let details = {
      originalError: error.message,
      dataType
    };

    // 特殊处理JSON语法错误
    if (error instanceof SyntaxError) {
      errorType = 'JSON_SYNTAX_ERROR';
      message = `JSON语法错误: ${error.message}`;
      
      // 尝试提取行号和位置信息
      const match = error.message.match(/position (\d+)/);
      if (match) {
        details.position = parseInt(match[1]);
      }
      
      details.suggestion = '请检查JSON语法，确保所有括号和引号正确闭合';
    }

    return this.createErrorResult(errorType, message, details);
  }

  /**
   * 从文件路径加载并解析数据
   * @param {string} filePath - 文件路径
   * @param {string} type - 数据类型（nodes/edges/applications）
   * @returns {Promise<Object>} 解析结果
   */
  async parseFromFile(filePath, type) {
    try {
      const fs = require('fs').promises;
      const content = await fs.readFile(filePath, 'utf-8');
      
      switch (type) {
        case 'nodes':
          return this.parseNodes(content);
        case 'edges':
          return this.parseEdges(content);
        case 'applications':
          return this.parseApplications(content);
        default:
          return this.createErrorResult(
            'INVALID_TYPE',
            `不支持的数据类型: ${type}`,
            { supportedTypes: ['nodes', 'edges', 'applications'] }
          );
      }
    } catch (error) {
      return this.createErrorResult(
        'FILE_READ_ERROR',
        `读取文件失败: ${error.message}`,
        { filePath, originalError: error.message }
      );
    }
  }

  /**
   * 批量解析多个文件
   * @param {Array<{path: string, type: string}>} files - 文件列表
   * @returns {Promise<Object>} 批量解析结果
   */
  async parseMultipleFiles(files) {
    const results = {
      success: true,
      files: [],
      errors: [],
      summary: {
        total: files.length,
        succeeded: 0,
        failed: 0
      }
    };

    for (const file of files) {
      const result = await this.parseFromFile(file.path, file.type);
      
      if (result.success) {
        results.files.push({
          path: file.path,
          type: file.type,
          count: result.count,
          metadata: result.metadata
        });
        results.summary.succeeded++;
      } else {
        results.success = false;
        results.errors.push({
          path: file.path,
          type: file.type,
          error: result.error
        });
        results.summary.failed++;
      }
    }

    return results;
  }
}

// Node.js环境导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataParser;
}

// 浏览器环境导出
if (typeof window !== 'undefined') {
  window.DataParser = DataParser;
}
