/**
 * DataValidator - Phase 2数据验证器
 * 
 * 负责验证Phase 2数据的格式、完整性和业务规则
 * 
 * 主要功能:
 * - validateNodes(nodes): 验证节点数据
 * - validateEdges(edges, nodes): 验证边数据
 * - validateApplications(applications, nodes): 验证应用案例数据
 * - detectCycles(edges): 检测循环依赖
 * - validateLatex(formula): 验证LaTeX公式
 * - generateReport(results): 生成验证报告
 * 
 * 使用示例:
 *   const validator = new DataValidator();
 *   const result = validator.validateNodes(nodes);
 *   if (!result.success) {
 *     console.log(validator.generateReport([result]));
 *   }
 */

class DataValidator {
  constructor() {
    this.rules = this.loadValidationRules();
    this.errors = [];
    this.warnings = [];
  }

  /**
   * 加载验证规则
   * @returns {Object} 验证规则配置
   */
  loadValidationRules() {
    return {
      node: {
        requiredFields: [
          'id', 'name', 'nameEn', 'description',
          'domains', 'difficulty', 'prerequisites',
          'relatedSkills', 'keywords', 'estimatedStudyTime'
        ],
        difficulty: { min: 1, max: 5 },
        estimatedStudyTime: { min: 30, max: 120 },
        idPattern: /^node-[a-z0-9-]+$/,
        minKeywords: 3,
        minApplications: 1,
        advancedDifficulty: { min: 3, max: 5 },
        advancedMinApplications: 2
      },
      edge: {
        requiredFields: ['id', 'source', 'target', 'type', 'strength'],
        types: ['prerequisite', 'cross-domain', 'application'],
        strength: { min: 0, max: 1 }
      },
      application: {
        requiredFields: [
          'id', 'title', 'industry', 'difficulty',
          'relatedNodes', 'description', 'mathematicalConcepts',
          'problemStatement', 'solution', 'code', 'visualization'
        ],
        minCodeLength: 50,
        supportedLanguages: ['python', 'javascript'],
        minIndustries: 15,
        minTotalApplications: 100
      }
    };
  }

  /**
   * 添加错误
   * @param {string} type - 错误类型
   * @param {string} message - 错误消息
   * @param {Object} details - 错误详情
   */
  addError(type, message, details = {}) {
    this.errors.push({
      type,
      severity: 'error',
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 添加警告
   * @param {string} type - 警告类型
   * @param {string} message - 警告消息
   * @param {Object} details - 警告详情
   */
  addWarning(type, message, details = {}) {
    this.warnings.push({
      type,
      severity: 'warning',
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 清除错误和警告
   */
  clearErrors() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * 获取验证摘要
   * @returns {Object} 验证摘要
   */
  getSummary() {
    return {
      totalErrors: this.errors.length,
      totalWarnings: this.warnings.length,
      hasErrors: this.errors.length > 0,
      hasWarnings: this.warnings.length > 0
    };
  }

  /**
   * 验证节点数据
   * @param {Array<Node>} nodes - 节点数组
   * @returns {ValidationResult} 验证结果
   */
  validateNodes(nodes) {
    console.log(`验证 ${nodes.length} 个节点...`);
    this.clearErrors();
    
    if (!Array.isArray(nodes)) {
      this.addError('INVALID_INPUT', '节点数据必须是数组', { received: typeof nodes });
      return this.buildResult();
    }

    // 验证每个节点
    nodes.forEach((node, index) => {
      this.validateSingleNode(node, index);
    });
    
    return this.buildResult();
  }

  /**
   * 验证单个节点
   * @param {Node} node - 节点对象
   * @param {number} index - 节点在数组中的索引
   */
  validateSingleNode(node, index) {
    const rules = this.rules.node;
    
    // 1. 验证必需字段完整性
    rules.requiredFields.forEach(field => {
      if (!(field in node)) {
        this.addError(
          'MISSING_FIELD',
          `节点缺少必需字段: ${field}`,
          { nodeIndex: index, nodeId: node.id || 'unknown', field }
        );
      } else if (node[field] === null || node[field] === undefined || node[field] === '') {
        this.addError(
          'EMPTY_FIELD',
          `节点字段为空: ${field}`,
          { nodeIndex: index, nodeId: node.id || 'unknown', field }
        );
      }
    });

    // 如果缺少关键字段，跳过后续验证
    if (!node.id) {
      return;
    }

    // 2. 验证ID格式
    if (!rules.idPattern.test(node.id)) {
      this.addError(
        'INVALID_ID_PATTERN',
        `节点ID格式不正确: ${node.id}`,
        { 
          nodeIndex: index, 
          nodeId: node.id, 
          expected: 'node-[a-z0-9-]+',
          actual: node.id 
        }
      );
    }

    // 3. 验证difficulty范围 (1-5)
    if (typeof node.difficulty === 'number') {
      if (node.difficulty < rules.difficulty.min || node.difficulty > rules.difficulty.max) {
        this.addError(
          'INVALID_DIFFICULTY',
          `节点难度值超出范围: ${node.difficulty}`,
          { 
            nodeIndex: index, 
            nodeId: node.id, 
            value: node.difficulty,
            min: rules.difficulty.min,
            max: rules.difficulty.max
          }
        );
      }
    } else if (node.difficulty !== undefined) {
      this.addError(
        'INVALID_TYPE',
        `节点difficulty字段类型错误`,
        { 
          nodeIndex: index, 
          nodeId: node.id, 
          field: 'difficulty',
          expected: 'number',
          actual: typeof node.difficulty
        }
      );
    }

    // 4. 验证estimatedStudyTime范围 (30-120分钟)
    if (typeof node.estimatedStudyTime === 'number') {
      if (node.estimatedStudyTime < rules.estimatedStudyTime.min || 
          node.estimatedStudyTime > rules.estimatedStudyTime.max) {
        this.addError(
          'INVALID_STUDY_TIME',
          `节点学习时长超出范围: ${node.estimatedStudyTime}分钟`,
          { 
            nodeIndex: index, 
            nodeId: node.id, 
            value: node.estimatedStudyTime,
            min: rules.estimatedStudyTime.min,
            max: rules.estimatedStudyTime.max
          }
        );
      }
    } else if (node.estimatedStudyTime !== undefined) {
      this.addError(
        'INVALID_TYPE',
        `节点estimatedStudyTime字段类型错误`,
        { 
          nodeIndex: index, 
          nodeId: node.id, 
          field: 'estimatedStudyTime',
          expected: 'number',
          actual: typeof node.estimatedStudyTime
        }
      );
    }

    // 5. 验证keywords数组长度 (至少3个)
    if (Array.isArray(node.keywords)) {
      if (node.keywords.length < rules.minKeywords) {
        this.addWarning(
          'INSUFFICIENT_KEYWORDS',
          `节点关键词数量不足: ${node.keywords.length}个`,
          { 
            nodeIndex: index, 
            nodeId: node.id, 
            count: node.keywords.length,
            min: rules.minKeywords
          }
        );
      }
    } else if (node.keywords !== undefined) {
      this.addError(
        'INVALID_TYPE',
        `节点keywords字段类型错误`,
        { 
          nodeIndex: index, 
          nodeId: node.id, 
          field: 'keywords',
          expected: 'array',
          actual: typeof node.keywords
        }
      );
    }

    // 6. 验证高难度节点的应用案例数量 (difficulty≥4时至少2个)
    if (typeof node.difficulty === 'number' && node.difficulty >= 4) {
      if (Array.isArray(node.realWorldApplications)) {
        if (node.realWorldApplications.length < rules.advancedMinApplications) {
          this.addWarning(
            'INSUFFICIENT_APPLICATIONS',
            `高难度节点应用案例数量不足: ${node.realWorldApplications.length}个`,
            { 
              nodeIndex: index, 
              nodeId: node.id, 
              difficulty: node.difficulty,
              count: node.realWorldApplications.length,
              min: rules.advancedMinApplications
            }
          );
        }
      } else if (node.realWorldApplications !== undefined) {
        this.addError(
          'INVALID_TYPE',
          `节点realWorldApplications字段类型错误`,
          { 
            nodeIndex: index, 
            nodeId: node.id, 
            field: 'realWorldApplications',
            expected: 'array',
            actual: typeof node.realWorldApplications
          }
        );
      }
    }

    // 7. 验证数组类型字段
    const arrayFields = ['domains', 'prerequisites', 'relatedSkills'];
    arrayFields.forEach(field => {
      if (node[field] !== undefined && !Array.isArray(node[field])) {
        this.addError(
          'INVALID_TYPE',
          `节点${field}字段类型错误`,
          { 
            nodeIndex: index, 
            nodeId: node.id, 
            field,
            expected: 'array',
            actual: typeof node[field]
          }
        );
      }
    });

    // 8. 验证字符串类型字段
    const stringFields = ['name', 'nameEn', 'description'];
    stringFields.forEach(field => {
      if (node[field] !== undefined && typeof node[field] !== 'string') {
        this.addError(
          'INVALID_TYPE',
          `节点${field}字段类型错误`,
          { 
            nodeIndex: index, 
            nodeId: node.id, 
            field,
            expected: 'string',
            actual: typeof node[field]
          }
        );
      }
    });

    // 9. 验证LaTeX公式语法
    if (node.formula && typeof node.formula === 'string') {
      const latexResult = this.validateLatex(node.formula);
      if (!latexResult.valid) {
        latexResult.errors.forEach(error => {
          this.addError(
            'INVALID_LATEX',
            `节点LaTeX公式语法错误: ${error}`,
            { 
              nodeIndex: index, 
              nodeId: node.id, 
              formula: node.formula,
              error
            }
          );
        });
      }
    }
  }

  /**
   * 构建验证结果
   * @returns {ValidationResult} 验证结果对象
   */
  buildResult() {
    const summary = this.getSummary();
    return {
      success: !summary.hasErrors,
      errors: [...this.errors],
      warnings: [...this.warnings],
      summary
    };
  }

  /**
   * 验证边数据
   * @param {Array<Edge>} edges - 边数组
   * @param {Array<Node>} nodes - 节点数组（用于引用检查）
   * @returns {ValidationResult} 验证结果
   */
  validateEdges(edges, nodes) {
    console.log(`验证 ${edges.length} 条边...`);
    this.clearErrors();
    
    if (!Array.isArray(edges)) {
      this.addError('INVALID_INPUT', '边数据必须是数组', { received: typeof edges });
      return this.buildResult();
    }

    if (!Array.isArray(nodes)) {
      this.addError('INVALID_INPUT', '节点数据必须是数组', { received: typeof nodes });
      return this.buildResult();
    }

    // 构建节点ID集合用于引用检查
    const nodeIds = new Set(nodes.map(n => n.id));
    
    // 验证每条边
    edges.forEach((edge, index) => {
      this.validateSingleEdge(edge, index, nodeIds);
    });
    
    return this.buildResult();
  }

  /**
   * 验证单条边
   * @param {Edge} edge - 边对象
   * @param {number} index - 边在数组中的索引
   * @param {Set<string>} nodeIds - 节点ID集合
   */
  validateSingleEdge(edge, index, nodeIds) {
    const rules = this.rules.edge;
    
    // 1. 验证必需字段完整性
    rules.requiredFields.forEach(field => {
      if (!(field in edge)) {
        this.addError(
          'MISSING_FIELD',
          `边缺少必需字段: ${field}`,
          { edgeIndex: index, edgeId: edge.id || 'unknown', field }
        );
      } else if (edge[field] === null || edge[field] === undefined || edge[field] === '') {
        this.addError(
          'EMPTY_FIELD',
          `边字段为空: ${field}`,
          { edgeIndex: index, edgeId: edge.id || 'unknown', field }
        );
      }
    });

    // 如果缺少关键字段，跳过后续验证
    if (!edge.id) {
      return;
    }

    // 2. 验证source节点存在
    if (edge.source) {
      if (!nodeIds.has(edge.source)) {
        this.addError(
          'MISSING_NODE',
          `边引用了不存在的source节点: ${edge.source}`,
          { 
            edgeIndex: index, 
            edgeId: edge.id, 
            field: 'source',
            missingId: edge.source
          }
        );
      }
    }

    // 3. 验证target节点存在
    if (edge.target) {
      if (!nodeIds.has(edge.target)) {
        this.addError(
          'MISSING_NODE',
          `边引用了不存在的target节点: ${edge.target}`,
          { 
            edgeIndex: index, 
            edgeId: edge.id, 
            field: 'target',
            missingId: edge.target
          }
        );
      }
    }

    // 4. 验证type字段有效性
    if (edge.type) {
      if (!rules.types.includes(edge.type)) {
        this.addError(
          'INVALID_EDGE_TYPE',
          `边类型无效: ${edge.type}`,
          { 
            edgeIndex: index, 
            edgeId: edge.id, 
            value: edge.type,
            validTypes: rules.types
          }
        );
      }
    }

    // 5. 验证strength值范围 (0-1)
    if (typeof edge.strength === 'number') {
      if (edge.strength < rules.strength.min || edge.strength > rules.strength.max) {
        this.addError(
          'INVALID_STRENGTH',
          `边强度值超出范围: ${edge.strength}`,
          { 
            edgeIndex: index, 
            edgeId: edge.id, 
            value: edge.strength,
            min: rules.strength.min,
            max: rules.strength.max
          }
        );
      }
    } else if (edge.strength !== undefined) {
      this.addError(
        'INVALID_TYPE',
        `边strength字段类型错误`,
        { 
          edgeIndex: index, 
          edgeId: edge.id, 
          field: 'strength',
          expected: 'number',
          actual: typeof edge.strength
        }
      );
    }

    // 6. 验证字符串类型字段
    const stringFields = ['id', 'source', 'target', 'type'];
    stringFields.forEach(field => {
      if (edge[field] !== undefined && typeof edge[field] !== 'string') {
        this.addError(
          'INVALID_TYPE',
          `边${field}字段类型错误`,
          { 
            edgeIndex: index, 
            edgeId: edge.id, 
            field,
            expected: 'string',
            actual: typeof edge[field]
          }
        );
      }
    });
  }

  /**
   * 验证应用案例数据
   * @param {Array<Application>} applications - 应用案例数组
   * @param {Array<Node>} nodes - 节点数组
   * @returns {ValidationResult} 验证结果
   */
  validateApplications(applications, nodes) {
    console.log(`验证 ${applications.length} 个应用案例...`);
    this.clearErrors();
    
    if (!Array.isArray(applications)) {
      this.addError('INVALID_INPUT', '应用案例数据必须是数组', { received: typeof applications });
      return this.buildResult();
    }

    if (!Array.isArray(nodes)) {
      this.addError('INVALID_INPUT', '节点数据必须是数组', { received: typeof nodes });
      return this.buildResult();
    }

    // 构建节点ID集合用于引用检查
    const nodeIds = new Set(nodes.map(n => n.id));
    
    // 验证每个应用案例
    applications.forEach((app, index) => {
      this.validateSingleApplication(app, index, nodeIds);
    });
    
    return this.buildResult();
  }

  /**
   * 验证单个应用案例
   * @param {Application} app - 应用案例对象
   * @param {number} index - 应用案例在数组中的索引
   * @param {Set<string>} nodeIds - 节点ID集合
   */
  validateSingleApplication(app, index, nodeIds) {
    const rules = this.rules.application;
    
    // 1. 验证必需字段完整性
    rules.requiredFields.forEach(field => {
      if (!(field in app)) {
        this.addError(
          'MISSING_FIELD',
          `应用案例缺少必需字段: ${field}`,
          { appIndex: index, appId: app.id || 'unknown', field }
        );
      } else if (app[field] === null || app[field] === undefined || app[field] === '') {
        this.addError(
          'EMPTY_FIELD',
          `应用案例字段为空: ${field}`,
          { appIndex: index, appId: app.id || 'unknown', field }
        );
      }
    });

    // 如果缺少关键字段，跳过后续验证
    if (!app.id) {
      return;
    }

    // 2. 验证relatedNodes引用存在
    if (Array.isArray(app.relatedNodes)) {
      app.relatedNodes.forEach((nodeId, nodeIndex) => {
        if (!nodeIds.has(nodeId)) {
          this.addError(
            'MISSING_NODE',
            `应用案例引用了不存在的节点: ${nodeId}`,
            { 
              appIndex: index, 
              appId: app.id, 
              field: 'relatedNodes',
              nodeIndex,
              missingId: nodeId
            }
          );
        }
      });
    } else if (app.relatedNodes !== undefined) {
      this.addError(
        'INVALID_TYPE',
        `应用案例relatedNodes字段类型错误`,
        { 
          appIndex: index, 
          appId: app.id, 
          field: 'relatedNodes',
          expected: 'array',
          actual: typeof app.relatedNodes
        }
      );
    }

    // 3. 验证code字段
    if (app.code) {
      // 3a. 验证code是对象类型
      if (typeof app.code !== 'object' || Array.isArray(app.code)) {
        this.addError(
          'INVALID_TYPE',
          `应用案例code字段类型错误`,
          { 
            appIndex: index, 
            appId: app.id, 
            field: 'code',
            expected: 'object',
            actual: Array.isArray(app.code) ? 'array' : typeof app.code
          }
        );
      } else {
        // 3b. 验证code.language字段
        if (app.code.language) {
          if (!rules.supportedLanguages.includes(app.code.language)) {
            this.addError(
              'INVALID_CODE_LANGUAGE',
              `应用案例代码语言不支持: ${app.code.language}`,
              { 
                appIndex: index, 
                appId: app.id, 
                language: app.code.language,
                supportedLanguages: rules.supportedLanguages
              }
            );
          }
        }

        // 3c. 验证code.implementation字段长度（至少50字符）
        if (app.code.implementation) {
          if (typeof app.code.implementation === 'string') {
            if (app.code.implementation.length < rules.minCodeLength) {
              this.addError(
                'INSUFFICIENT_CODE_LENGTH',
                `应用案例代码长度不足: ${app.code.implementation.length}字符`,
                { 
                  appIndex: index, 
                  appId: app.id, 
                  length: app.code.implementation.length,
                  minLength: rules.minCodeLength
                }
              );
            }
          } else {
            this.addError(
              'INVALID_TYPE',
              `应用案例code.implementation字段类型错误`,
              { 
                appIndex: index, 
                appId: app.id, 
                field: 'code.implementation',
                expected: 'string',
                actual: typeof app.code.implementation
              }
            );
          }
        }
      }
    }

    // 4. 验证其他字段类型
    const stringFields = ['id', 'title', 'industry', 'description', 'problemStatement'];
    stringFields.forEach(field => {
      if (app[field] !== undefined && typeof app[field] !== 'string') {
        this.addError(
          'INVALID_TYPE',
          `应用案例${field}字段类型错误`,
          { 
            appIndex: index, 
            appId: app.id, 
            field,
            expected: 'string',
            actual: typeof app[field]
          }
        );
      }
    });

    // 5. 验证difficulty字段
    if (typeof app.difficulty === 'number') {
      if (app.difficulty < 1 || app.difficulty > 5) {
        this.addError(
          'INVALID_DIFFICULTY',
          `应用案例难度值超出范围: ${app.difficulty}`,
          { 
            appIndex: index, 
            appId: app.id, 
            value: app.difficulty,
            min: 1,
            max: 5
          }
        );
      }
    } else if (app.difficulty !== undefined) {
      this.addError(
        'INVALID_TYPE',
        `应用案例difficulty字段类型错误`,
        { 
          appIndex: index, 
          appId: app.id, 
          field: 'difficulty',
          expected: 'number',
          actual: typeof app.difficulty
        }
      );
    }

    // 6. 验证数组类型字段
    const arrayFields = ['mathematicalConcepts', 'relatedDomains'];
    arrayFields.forEach(field => {
      if (app[field] !== undefined && !Array.isArray(app[field])) {
        this.addError(
          'INVALID_TYPE',
          `应用案例${field}字段类型错误`,
          { 
            appIndex: index, 
            appId: app.id, 
            field,
            expected: 'array',
            actual: typeof app[field]
          }
        );
      }
    });
  }

  /**
   * 检测循环依赖
   * @param {Array<Edge>} edges - 边数组
   * @returns {Array<Array<string>>} 循环路径数组
   */
  /**
   * 构建前置关系图
   * @param {Array<Object>} edges - 边数组
   * @returns {Map<string, Array<string>>} 邻接表表示的图
   */
  buildGraph(edges) {
    const graph = new Map();
    
    // 只考虑prerequisite类型的边
    const prerequisiteEdges = edges.filter(edge => edge.type === 'prerequisite');
    
    // 构建邻接表
    for (const edge of prerequisiteEdges) {
      if (!graph.has(edge.source)) {
        graph.set(edge.source, []);
      }
      graph.get(edge.source).push(edge.target);
    }
    
    return graph;
  }

  /**
   * 检测循环依赖
   * @param {Array<Object>} edges - 边数组
   * @returns {Array<Array<string>>} 循环路径数组，每个路径是节点ID数组
   */
  detectCycles(edges) {
    console.log('检测循环依赖...');
    
    const graph = this.buildGraph(edges);
    const cycles = [];
    const visited = new Set();
    const recursionStack = new Set();
    const path = [];
    
    /**
     * DFS辅助函数
     * @param {string} node - 当前节点
     */
    const dfs = (node) => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);
      
      const neighbors = graph.get(node) || [];
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          // 未访问过的节点，继续DFS
          dfs(neighbor);
        } else if (recursionStack.has(neighbor)) {
          // 在当前递归栈中找到了节点，说明有环
          const cycleStartIndex = path.indexOf(neighbor);
          const cycle = path.slice(cycleStartIndex).concat([neighbor]);
          cycles.push(cycle);
        }
      }
      
      // 回溯
      path.pop();
      recursionStack.delete(node);
    };
    
    // 对所有节点进行DFS
    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }
    
    console.log(`检测到 ${cycles.length} 个循环依赖`);
    return cycles;
  }

  /**
   * 验证LaTeX公式
   * @param {string} formula - LaTeX公式字符串
   * @returns {boolean} 是否有效
   */
  validateLatex(formula) {
    if (!formula || typeof formula !== 'string') {
      return { valid: false, errors: ['Formula must be a non-empty string'] };
    }

    const errors = [];
    
    // Check bracket matching
    const brackets = {
      '{': '}',
      '[': ']',
      '(': ')'
    };
    const stack = [];
    const openBrackets = Object.keys(brackets);
    const closeBrackets = Object.values(brackets);
    
    for (let i = 0; i < formula.length; i++) {
      const char = formula[i];
      
      // Skip escaped characters
      if (i > 0 && formula[i - 1] === '\\') {
        continue;
      }
      
      if (openBrackets.includes(char)) {
        stack.push({ char, pos: i });
      } else if (closeBrackets.includes(char)) {
        if (stack.length === 0) {
          errors.push(`Unmatched closing bracket '${char}' at position ${i}`);
        } else {
          const last = stack.pop();
          if (brackets[last.char] !== char) {
            errors.push(`Mismatched brackets: '${last.char}' at position ${last.pos} closed by '${char}' at position ${i}`);
          }
        }
      }
    }
    
    // Check for unclosed brackets
    if (stack.length > 0) {
      stack.forEach(item => {
        errors.push(`Unclosed bracket '${item.char}' at position ${item.pos}`);
      });
    }
    
    // Check for common LaTeX syntax errors
    
    // 1. Check for unescaped special characters that should be escaped
    // Note: & is allowed in LaTeX for alignment, _ and ^ are allowed in math mode
    const specialChars = ['%', '$', '#'];
    for (let i = 0; i < formula.length; i++) {
      const char = formula[i];
      if (specialChars.includes(char)) {
        // Check if it's escaped
        if (i === 0 || formula[i - 1] !== '\\') {
          errors.push(`Unescaped special character '${char}' at position ${i}`);
        }
      }
    }
    
    // 2. Check for empty braces or brackets
    const emptyBracesPattern = /\{\s*\}/g;
    let match;
    while ((match = emptyBracesPattern.exec(formula)) !== null) {
      errors.push(`Empty braces '{}' at position ${match.index}`);
    }
    
    // 3. Check for unmatched \left and \right
    const leftCount = (formula.match(/\\left[(\[{|]/g) || []).length;
    const rightCount = (formula.match(/\\right[)\]}|]/g) || []).length;
    if (leftCount !== rightCount) {
      errors.push(`Unmatched \\left and \\right delimiters (${leftCount} \\left vs ${rightCount} \\right)`);
    }
    
    // 4. Check for \frac with missing arguments (simplified check)
    // We look for \frac followed by at least one {
    const fracPattern = /\\frac(?!\s*\{)/g;
    while ((match = fracPattern.exec(formula)) !== null) {
      errors.push(`\\frac at position ${match.index} should be followed by arguments in braces`);
    }
    
    // 5. Check for \sqrt with invalid syntax (simplified check)
    // We look for \sqrt not followed by [ or {
    const sqrtPattern = /\\sqrt(?!\s*[\[{])/g;
    while ((match = sqrtPattern.exec(formula)) !== null) {
      errors.push(`\\sqrt at position ${match.index} should be followed by an argument in braces`);
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 格式化错误消息，生成用户友好的错误提示
   * @param {Object} error - 错误对象
   * @returns {string} 格式化的错误消息
   */
  formatErrorMessage(error) {
    const templates = {
      MISSING_NODE: (e) => {
        const location = e.details.edgeIndex !== undefined 
          ? `边 #${e.details.edgeIndex} (${e.details.edgeId})`
          : e.details.appIndex !== undefined
          ? `应用案例 #${e.details.appIndex} (${e.details.appId})`
          : '未知位置';
        return `❌ ${location} 引用了不存在的节点 ${e.details.missingId}\n` +
               `   建议: 请确保节点 ${e.details.missingId} 存在于节点数据中，或修改引用`;
      },
      
      CIRCULAR_DEPENDENCY: (e) =>
        `❌ 检测到循环依赖: ${e.details.cycle?.join(' → ') || '未知路径'}\n` +
        `   这会导致学习路径无法确定\n` +
        `   建议: 移除其中一条前置关系边以打破循环`,
      
      INVALID_DIFFICULTY: (e) => {
        const location = e.details.nodeIndex !== undefined
          ? `节点 #${e.details.nodeIndex} (${e.details.nodeId})`
          : e.details.appIndex !== undefined
          ? `应用案例 #${e.details.appIndex} (${e.details.appId})`
          : '未知位置';
        return `⚠️  ${location} 的难度值 ${e.details.value} 超出范围 [${e.details.min}, ${e.details.max}]\n` +
               `   建议: 将difficulty设置为${e.details.min}到${e.details.max}之间的整数`;
      },
      
      INVALID_STUDY_TIME: (e) =>
        `⚠️  节点 #${e.details.nodeIndex} (${e.details.nodeId}) 的学习时长 ${e.details.value}分钟 超出范围 [${e.details.min}, ${e.details.max}]\n` +
        `   建议: 将estimatedStudyTime设置为${e.details.min}到${e.details.max}之间的值`,
      
      MISSING_FIELD: (e) => {
        const location = e.details.nodeIndex !== undefined
          ? `节点 #${e.details.nodeIndex} (${e.details.nodeId})`
          : e.details.edgeIndex !== undefined
          ? `边 #${e.details.edgeIndex} (${e.details.edgeId})`
          : e.details.appIndex !== undefined
          ? `应用案例 #${e.details.appIndex} (${e.details.appId})`
          : '未知位置';
        return `❌ ${location} 缺少必需字段: ${e.details.field}\n` +
               `   建议: 添加 ${e.details.field} 字段`;
      },
      
      EMPTY_FIELD: (e) => {
        const location = e.details.nodeIndex !== undefined
          ? `节点 #${e.details.nodeIndex} (${e.details.nodeId})`
          : e.details.edgeIndex !== undefined
          ? `边 #${e.details.edgeIndex} (${e.details.edgeId})`
          : e.details.appIndex !== undefined
          ? `应用案例 #${e.details.appIndex} (${e.details.appId})`
          : '未知位置';
        return `❌ ${location} 的字段 ${e.details.field} 为空\n` +
               `   建议: 为 ${e.details.field} 字段提供有效值`;
      },
      
      INVALID_LATEX: (e) =>
        `❌ 节点 #${e.details.nodeIndex} (${e.details.nodeId}) 的LaTeX公式语法错误\n` +
        `   错误: ${e.details.error}\n` +
        `   公式: ${e.details.formula}\n` +
        `   建议: 检查LaTeX语法，确保所有括号正确闭合`,
      
      INSUFFICIENT_APPLICATIONS: (e) =>
        `⚠️  高难度节点 #${e.details.nodeIndex} (${e.details.nodeId}, difficulty=${e.details.difficulty}) 应用案例数量不足\n` +
        `   当前: ${e.details.count}个，要求: 至少${e.details.min}个\n` +
        `   建议: 为高难度节点添加更多实际应用案例`,
      
      INSUFFICIENT_CODE_LENGTH: (e) =>
        `❌ 应用案例 #${e.details.appIndex} (${e.details.appId}) 代码长度不足\n` +
        `   当前: ${e.details.length}字符，要求: 至少${e.details.minLength}字符\n` +
        `   建议: 提供更完整的代码实现`,
      
      INVALID_TYPE: (e) => {
        const location = e.details.nodeIndex !== undefined
          ? `节点 #${e.details.nodeIndex} (${e.details.nodeId})`
          : e.details.edgeIndex !== undefined
          ? `边 #${e.details.edgeIndex} (${e.details.edgeId})`
          : e.details.appIndex !== undefined
          ? `应用案例 #${e.details.appIndex} (${e.details.appId})`
          : '未知位置';
        return `❌ ${location} 的字段 ${e.details.field} 类型错误\n` +
               `   期望: ${e.details.expected}，实际: ${e.details.actual}\n` +
               `   建议: 将 ${e.details.field} 修改为 ${e.details.expected} 类型`;
      },
      
      INVALID_EDGE_TYPE: (e) =>
        `❌ 边 #${e.details.edgeIndex} (${e.details.edgeId}) 的类型 ${e.details.value} 无效\n` +
        `   有效类型: ${e.details.validTypes.join(', ')}\n` +
        `   建议: 使用有效的边类型`,
      
      INVALID_STRENGTH: (e) =>
        `❌ 边 #${e.details.edgeIndex} (${e.details.edgeId}) 的强度值 ${e.details.value} 超出范围 [${e.details.min}, ${e.details.max}]\n` +
        `   建议: 将strength设置为0到1之间的数值`,
      
      INVALID_CODE_LANGUAGE: (e) =>
        `❌ 应用案例 #${e.details.appIndex} (${e.details.appId}) 的代码语言 ${e.details.language} 不支持\n` +
        `   支持的语言: ${e.details.supportedLanguages.join(', ')}\n` +
        `   建议: 使用支持的编程语言`
    };
    
    return templates[error.type]?.(error) || `${error.severity === 'error' ? '❌' : '⚠️'} ${error.message}`;
  }

  /**
   * 生成验证报告
   * @param {Array<ValidationResult>} results - 验证结果数组
   * @param {Object} options - 报告选项
   * @param {string} options.fileName - 文件名（可选）
   * @param {string} options.format - 报告格式 ('html' | 'text')，默认 'html'
   * @returns {string} 格式化的报告
   */
  generateReport(results, options = {}) {
    console.log('生成验证报告...');
    
    const { fileName = '未指定文件', format = 'html' } = options;
    
    if (!Array.isArray(results) || results.length === 0) {
      if (format === 'text') {
        return '验证报告\n========\n没有验证结果';
      }
      return '<html><body><h1>验证报告</h1><p>没有验证结果</p></body></html>';
    }

    // 收集所有错误和警告
    const allErrors = [];
    const allWarnings = [];
    let totalFilesChecked = 0;
    let totalNodesValidated = 0;
    let totalEdgesValidated = 0;
    let totalAppsValidated = 0;

    results.forEach((result, index) => {
      if (result.errors) {
        // 为每个错误添加文件信息
        result.errors.forEach(err => {
          allErrors.push({
            ...err,
            fileName: result.fileName || fileName,
            resultIndex: index
          });
        });
      }
      if (result.warnings) {
        // 为每个警告添加文件信息
        result.warnings.forEach(warn => {
          allWarnings.push({
            ...warn,
            fileName: result.fileName || fileName,
            resultIndex: index
          });
        });
      }
      
      // 统计验证的项目数
      if (result.summary) {
        totalFilesChecked++;
      }
      
      // 根据错误类型统计验证的项目
      if (result.errors || result.warnings) {
        const items = [...(result.errors || []), ...(result.warnings || [])];
        items.forEach(item => {
          if (item.details?.nodeIndex !== undefined) totalNodesValidated++;
          if (item.details?.edgeIndex !== undefined) totalEdgesValidated++;
          if (item.details?.appIndex !== undefined) totalAppsValidated++;
        });
      }
    });

    // 去重统计（同一个索引只计数一次）
    const uniqueNodes = new Set();
    const uniqueEdges = new Set();
    const uniqueApps = new Set();
    
    [...allErrors, ...allWarnings].forEach(item => {
      if (item.details?.nodeIndex !== undefined) {
        uniqueNodes.add(`${item.fileName}-${item.details.nodeIndex}`);
      }
      if (item.details?.edgeIndex !== undefined) {
        uniqueEdges.add(`${item.fileName}-${item.details.edgeIndex}`);
      }
      if (item.details?.appIndex !== undefined) {
        uniqueApps.add(`${item.fileName}-${item.details.appIndex}`);
      }
    });

    totalNodesValidated = uniqueNodes.size || totalNodesValidated;
    totalEdgesValidated = uniqueEdges.size || totalEdgesValidated;
    totalAppsValidated = uniqueApps.size || totalAppsValidated;

    // 生成文本格式报告
    if (format === 'text') {
      let report = '';
      report += '='.repeat(60) + '\n';
      report += 'Phase 2 数据验证报告\n';
      report += '='.repeat(60) + '\n\n';
      
      report += '摘要\n';
      report += '-'.repeat(60) + '\n';
      report += `总错误数: ${allErrors.length}\n`;
      report += `总警告数: ${allWarnings.length}\n`;
      report += `验证文件数: ${totalFilesChecked}\n`;
      if (totalNodesValidated > 0) report += `验证节点数: ${totalNodesValidated}\n`;
      if (totalEdgesValidated > 0) report += `验证边数: ${totalEdgesValidated}\n`;
      if (totalAppsValidated > 0) report += `验证应用案例数: ${totalAppsValidated}\n`;
      report += `状态: ${allErrors.length === 0 ? '✓ 通过' : '✗ 失败'}\n`;
      report += '\n';
      
      if (allErrors.length > 0) {
        report += `错误详情 (${allErrors.length})\n`;
        report += '-'.repeat(60) + '\n';
        allErrors.forEach((err, index) => {
          report += `\n[错误 ${index + 1}] 文件: ${err.fileName}\n`;
          report += this.formatErrorMessage(err) + '\n';
        });
        report += '\n';
      }
      
      if (allWarnings.length > 0) {
        report += `警告详情 (${allWarnings.length})\n`;
        report += '-'.repeat(60) + '\n';
        allWarnings.forEach((warn, index) => {
          report += `\n[警告 ${index + 1}] 文件: ${warn.fileName}\n`;
          report += this.formatErrorMessage(warn) + '\n';
        });
        report += '\n';
      }
      
      report += '-'.repeat(60) + '\n';
      report += `报告生成时间: ${new Date().toISOString()}\n`;
      report += '='.repeat(60) + '\n';
      
      return report;
    }

    // 生成HTML格式报告
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phase 2 数据验证报告</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { 
      max-width: 1200px; 
      margin: 0 auto; 
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    h1 { 
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .timestamp {
      font-size: 14px;
      opacity: 0.9;
    }
    .summary { 
      background: #f8f9fa;
      padding: 25px 30px;
      border-bottom: 1px solid #e0e0e0;
    }
    .summary h2 {
      font-size: 20px;
      margin-bottom: 15px;
      color: #333;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .stat-item {
      background: white;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #667eea;
    }
    .stat-label {
      font-size: 13px;
      color: #666;
      margin-bottom: 5px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
    .status {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      margin-top: 10px;
    }
    .status.success { 
      background: #d4edda;
      color: #155724;
    }
    .status.failure { 
      background: #f8d7da;
      color: #721c24;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      font-size: 20px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e0e0e0;
    }
    .issue {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 12px;
      border-left: 4px solid #d32f2f;
    }
    .issue.warning {
      border-left-color: #f57c00;
    }
    .issue-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }
    .issue-type {
      font-weight: 600;
      font-size: 14px;
      color: #d32f2f;
    }
    .issue.warning .issue-type {
      color: #f57c00;
    }
    .issue-file {
      font-size: 12px;
      color: #666;
      background: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .issue-message {
      font-size: 14px;
      color: #333;
      margin-bottom: 10px;
      white-space: pre-wrap;
      font-family: 'Consolas', 'Monaco', monospace;
    }
    .issue-details {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      font-family: 'Consolas', 'Monaco', monospace;
      overflow-x: auto;
    }
    .no-issues {
      text-align: center;
      padding: 40px;
      color: #666;
      font-size: 16px;
    }
    .no-issues .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Phase 2 数据验证报告</h1>
      <div class="timestamp">生成时间: ${new Date().toLocaleString('zh-CN')}</div>
    </div>
    
    <div class="summary">
      <h2>验证摘要</h2>
      <div class="stats">
        <div class="stat-item">
          <div class="stat-label">总错误数</div>
          <div class="stat-value" style="color: #d32f2f;">${allErrors.length}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">总警告数</div>
          <div class="stat-value" style="color: #f57c00;">${allWarnings.length}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">验证文件数</div>
          <div class="stat-value">${totalFilesChecked}</div>
        </div>
        ${totalNodesValidated > 0 ? `
        <div class="stat-item">
          <div class="stat-label">验证节点数</div>
          <div class="stat-value">${totalNodesValidated}</div>
        </div>
        ` : ''}
        ${totalEdgesValidated > 0 ? `
        <div class="stat-item">
          <div class="stat-label">验证边数</div>
          <div class="stat-value">${totalEdgesValidated}</div>
        </div>
        ` : ''}
        ${totalAppsValidated > 0 ? `
        <div class="stat-item">
          <div class="stat-label">验证应用案例数</div>
          <div class="stat-value">${totalAppsValidated}</div>
        </div>
        ` : ''}
      </div>
      <div class="status ${allErrors.length === 0 ? 'success' : 'failure'}">
        ${allErrors.length === 0 ? '✓ 验证通过' : '✗ 验证失败'}
      </div>
    </div>
    
    <div class="content">
      ${allErrors.length > 0 ? `
      <div class="section">
        <h2>错误详情 (${allErrors.length})</h2>
        ${allErrors.map((err, index) => `
          <div class="issue">
            <div class="issue-header">
              <span class="issue-type">[错误 ${index + 1}] ${err.type}</span>
              <span class="issue-file">${err.fileName}</span>
            </div>
            <div class="issue-message">${this.formatErrorMessage(err)}</div>
            ${err.details && Object.keys(err.details).length > 0 ? `
            <details>
              <summary style="cursor: pointer; color: #666; font-size: 12px;">查看详细信息</summary>
              <div class="issue-details">${JSON.stringify(err.details, null, 2)}</div>
            </details>
            ` : ''}
          </div>
        `).join('')}
      </div>
      ` : `
      <div class="no-issues">
        <div class="icon">✓</div>
        <div>没有发现错误</div>
      </div>
      `}
      
      ${allWarnings.length > 0 ? `
      <div class="section">
        <h2>警告详情 (${allWarnings.length})</h2>
        ${allWarnings.map((warn, index) => `
          <div class="issue warning">
            <div class="issue-header">
              <span class="issue-type">[警告 ${index + 1}] ${warn.type}</span>
              <span class="issue-file">${warn.fileName}</span>
            </div>
            <div class="issue-message">${this.formatErrorMessage(warn)}</div>
            ${warn.details && Object.keys(warn.details).length > 0 ? `
            <details>
              <summary style="cursor: pointer; color: #666; font-size: 12px;">查看详细信息</summary>
              <div class="issue-details">${JSON.stringify(warn.details, null, 2)}</div>
            </details>
            ` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>
    `.trim();

    return html;
  }
}

// 导出供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataValidator;
}
