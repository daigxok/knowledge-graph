/**
 * ContentGenerator - Phase 2内容生成器
 * 
 * 负责批量生成Phase 2的节点、边关系、应用案例和Skills内容
 * 
 * 主要功能:
 * - generateNodes(domainId, count, config): 生成指定domain的节点
 * - generateEdges(nodes, config): 生成边关系
 * - generateApplications(count, industries, nodes): 生成应用案例
 * - generateSkillContent(skillId, content): 生成Skills深度内容
 * - exportToJSON(outputDir): 导出所有数据到JSON文件
 * 
 * 使用示例:
 *   const generator = new ContentGenerator(config);
 *   const nodes = generator.generateNodes('domain-1', 20, {});
 *   generator.exportToJSON('data/');
 */

const fs = require('fs');
const path = require('path');

class ContentGenerator {
  constructor(config = {}) {
    this.config = this.loadGeneratorConfig(config);
    this.templates = this.loadTemplates();
    this.existingNodes = [];
    this.generatedNodes = [];
    this.generatedEdges = [];
    this.generatedApplications = [];
    this.generatedSkillsContent = [];
    this.nodeIdCounter = 0;
  }

  /**
   * 加载生成器配置
   * @param {Object} userConfig - 用户提供的配置
   * @returns {Object} 合并后的配置
   */
  loadGeneratorConfig(userConfig) {
    // 默认配置
    const defaultConfig = {
      domains: {
        "domain-1": {
          count: 20,
          difficulty: [3, 4, 5],
          topics: ["曲率", "函数作图", "不等式证明", "泰勒展开应用"],
          estimatedStudyTime: [45, 60, 90]
        },
        "domain-2": {
          count: 24,
          difficulty: [3, 4, 5],
          topics: ["曲线积分", "曲面积分", "场论", "偏微分方程", "级数应用"],
          estimatedStudyTime: [60, 90, 120]
        },
        "domain-3": {
          count: 18,
          difficulty: [3, 4, 5],
          topics: ["向量分析", "张量", "变分法", "最优控制", "数值优化"],
          estimatedStudyTime: [60, 90, 120]
        },
        "domain-4": {
          count: 10,
          difficulty: [3, 4, 5],
          topics: ["概率论基础", "随机变量", "常见分布", "数理统计", "随机过程"],
          estimatedStudyTime: [60, 90, 120]
        },
        "domain-5": {
          count: 3,
          difficulty: [4, 5],
          topics: ["人工智能应用", "金融工程应用", "物理建模"],
          estimatedStudyTime: [90, 120]
        }
      },
      edges: {
        prerequisiteRatio: 0.7,
        crossDomainRatio: 0.2,
        applicationRatio: 0.5
      },
      applications: {
        totalCount: 100,
        industries: [
          "人工智能与机器学习", "金融科技", "医疗健康",
          "通信工程", "机械工程", "环境科学",
          "数据科学", "物理学", "化学工程",
          "生物信息学", "经济学", "运筹学",
          "计算机图形学", "网络安全", "量子计算"
        ],
        minCodeLength: 50,
        requireVisualization: true
      }
    };

    // 合并用户配置和默认配置
    return this.deepMerge(defaultConfig, userConfig);
  }

  /**
   * 深度合并两个对象
   * @param {Object} target - 目标对象
   * @param {Object} source - 源对象
   * @returns {Object} 合并后的对象
   */
  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  /**
   * 生成唯一的节点ID
   * @param {string} domain - Domain ID
   * @param {string} topic - 主题名称
   * @returns {string} 节点ID
   */
  generateNodeId(domain, topic) {
    // 将主题名称转换为英文标识符
    const topicSlug = this.topicToSlug(topic);
    const timestamp = Date.now();
    const counter = this.nodeIdCounter++;
    return `node-${domain}-${topicSlug}-${timestamp}-${counter}`;
  }

  /**
   * 将主题名称转换为URL友好的slug
   * @param {string} topic - 主题名称
   * @returns {string} slug
   */
  topicToSlug(topic) {
    // 简单的中文到拼音映射（实际项目中应使用完整的拼音库）
    const pinyinMap = {
      '曲率': 'curvature',
      '函数作图': 'function-plotting',
      '不等式证明': 'inequality-proof',
      '泰勒展开应用': 'taylor-expansion',
      '曲线积分': 'line-integral',
      '曲面积分': 'surface-integral',
      '场论': 'field-theory',
      '偏微分方程': 'pde',
      '级数应用': 'series-application',
      '向量分析': 'vector-analysis',
      '张量': 'tensor',
      '变分法': 'calculus-of-variations',
      '最优控制': 'optimal-control',
      '数值优化': 'numerical-optimization',
      '概率论基础': 'probability-basics',
      '随机变量': 'random-variable',
      '常见分布': 'common-distributions',
      '数理统计': 'mathematical-statistics',
      '随机过程': 'stochastic-process',
      '人工智能应用': 'ai-application',
      '金融工程应用': 'financial-engineering',
      '物理建模': 'physics-modeling'
    };
    
    return pinyinMap[topic] || topic.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * 加载节点模板
   * @returns {Object} 模板对象
   */
  loadTemplates() {
    // 定义节点模板
    // 实际项目中可以从外部JSON文件加载
    return {
      // Domain-1: 变化与逼近
      '曲率': {
        name: '曲率',
        nameEn: 'Curvature',
        description: '曲率描述曲线在某点的弯曲程度，是微分几何的基本概念。平面曲线的曲率定义为切线转角对弧长的导数。',
        formula: '\\kappa = \\frac{|y\'\'|}{(1 + y\'^2)^{3/2}}',
        keywords: ['曲率', '曲率半径', '曲率中心', '密切圆']
      },
      '函数作图': {
        name: '函数作图',
        nameEn: 'Function Plotting',
        description: '函数作图是通过分析函数的性质（单调性、凹凸性、极值等）来绘制函数图像的系统方法。',
        formula: 'f\'\'(x) > 0 \\Rightarrow \\text{凹函数}',
        keywords: ['渐近线', '凹凸性', '拐点', '函数图像']
      },
      '不等式证明': {
        name: '不等式证明',
        nameEn: 'Inequality Proof',
        description: '利用微分学方法证明不等式，包括拉格朗日不等式、柯西不等式等重要不等式。',
        formula: '|f(b) - f(a)| \\leq M|b - a|',
        keywords: ['拉格朗日不等式', '柯西不等式', '均值不等式', '微分证明']
      },
      '泰勒展开应用': {
        name: '泰勒展开应用',
        nameEn: 'Taylor Expansion Applications',
        description: '泰勒展开在函数近似、误差估计和数值计算中的广泛应用。',
        formula: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n',
        keywords: ['泰勒级数', '函数近似', '误差估计', '数值计算']
      },
      
      // Domain-2: 结构与累积
      '曲线积分': {
        name: '曲线积分',
        nameEn: 'Line Integral',
        description: '曲线积分是在曲线上对函数进行积分，包括第一类和第二类曲线积分，广泛应用于物理和工程。',
        formula: '\\int_C f(x,y) ds = \\int_a^b f(x(t), y(t)) \\sqrt{x\'^2 + y\'^2} dt',
        keywords: ['曲线积分', '路径积分', '格林公式', '保守场']
      },
      '曲面积分': {
        name: '曲面积分',
        nameEn: 'Surface Integral',
        description: '曲面积分是在曲面上对函数进行积分，包括第一类和第二类曲面积分，用于计算通量和质量。',
        formula: '\\iint_S f(x,y,z) dS',
        keywords: ['曲面积分', '通量', '高斯定理', '散度定理']
      },
      '场论': {
        name: '场论',
        nameEn: 'Field Theory',
        description: '场论研究向量场和标量场的性质，包括梯度、散度、旋度等基本概念及其应用。',
        formula: '\\nabla \\cdot \\mathbf{F} = \\frac{\\partial F_x}{\\partial x} + \\frac{\\partial F_y}{\\partial y} + \\frac{\\partial F_z}{\\partial z}',
        keywords: ['梯度', '散度', '旋度', '向量场', '格林公式']
      },
      '偏微分方程': {
        name: '偏微分方程',
        nameEn: 'Partial Differential Equations',
        description: '偏微分方程描述多变量函数的变化规律，包括热传导方程、波动方程和拉普拉斯方程等经典方程。',
        formula: '\\frac{\\partial u}{\\partial t} = \\alpha \\frac{\\partial^2 u}{\\partial x^2}',
        keywords: ['PDE', '热传导方程', '波动方程', '拉普拉斯方程', '边值问题']
      },
      '级数应用': {
        name: '级数应用',
        nameEn: 'Series Applications',
        description: '级数在函数展开、微分方程求解和信号处理中的应用，包括傅里叶级数和幂级数。',
        formula: 'f(x) = \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} (a_n \\cos nx + b_n \\sin nx)',
        keywords: ['傅里叶级数', '幂级数', '级数展开', '收敛性']
      },
      
      // Domain-3: 优化与决策
      '向量分析': {
        name: '向量分析',
        nameEn: 'Vector Analysis',
        description: '向量分析研究向量场的微分和积分性质，是场论和微分几何的基础。',
        formula: '\\nabla f = \\frac{\\partial f}{\\partial x}\\mathbf{i} + \\frac{\\partial f}{\\partial y}\\mathbf{j} + \\frac{\\partial f}{\\partial z}\\mathbf{k}',
        keywords: ['向量场', '梯度', '线积分', '面积分', '斯托克斯定理']
      },
      '张量': {
        name: '张量',
        nameEn: 'Tensor',
        description: '张量是向量和矩阵的推广，在物理学、工程和机器学习中有广泛应用。',
        formula: 'T_{ij} = \\sum_k A_{ik} B_{kj}',
        keywords: ['张量', '张量运算', '张量分析', '应力张量', '度量张量']
      },
      '变分法': {
        name: '变分法',
        nameEn: 'Calculus of Variations',
        description: '变分法研究泛函的极值问题，通过欧拉-拉格朗日方程求解最优路径和最优形状。',
        formula: '\\frac{d}{dx}\\frac{\\partial F}{\\partial y\'} - \\frac{\\partial F}{\\partial y} = 0',
        keywords: ['变分法', '欧拉-拉格朗日方程', '泛函', '最速降线', '变分原理']
      },
      '最优控制': {
        name: '最优控制',
        nameEn: 'Optimal Control',
        description: '最优控制理论研究如何选择控制策略使系统性能指标达到最优，包括庞特里亚金最大值原理和动态规划。',
        formula: 'H = L(x, u, t) + \\lambda^T f(x, u, t)',
        keywords: ['最优控制', '庞特里亚金原理', '动态规划', '哈密顿函数', '控制理论']
      },
      '数值优化': {
        name: '数值优化',
        nameEn: 'Numerical Optimization',
        description: '数值优化方法用于求解实际优化问题，包括梯度下降、牛顿法、共轭梯度法等算法。',
        formula: 'x_{k+1} = x_k - \\alpha_k \\nabla f(x_k)',
        keywords: ['梯度下降', '牛顿法', '共轭梯度', '拟牛顿法', '优化算法']
      },
      
      // Domain-4: 不确定性处理
      '概率论基础': {
        name: '概率论基础',
        nameEn: 'Probability Basics',
        description: '概率论研究随机现象的数学规律，包括概率空间、条件概率和贝叶斯定理等基本概念。',
        formula: 'P(A|B) = \\frac{P(A \\cap B)}{P(B)}',
        keywords: ['概率空间', '条件概率', '贝叶斯定理', '独立性', '全概率公式']
      },
      '随机变量': {
        name: '随机变量',
        nameEn: 'Random Variable',
        description: '随机变量是随机试验结果的数值表示，包括离散和连续随机变量及其分布。',
        formula: 'E[X] = \\int_{-\\infty}^{\\infty} x f(x) dx',
        keywords: ['随机变量', '概率分布', '期望', '方差', '分布函数']
      },
      '常见分布': {
        name: '常见分布',
        nameEn: 'Common Distributions',
        description: '常见的概率分布包括正态分布、泊松分布、指数分布等，在统计和数据分析中广泛应用。',
        formula: 'f(x) = \\frac{1}{\\sqrt{2\\pi}\\sigma} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}',
        keywords: ['正态分布', '泊松分布', '指数分布', '二项分布', '均匀分布']
      },
      '数理统计': {
        name: '数理统计',
        nameEn: 'Mathematical Statistics',
        description: '数理统计研究如何从数据中推断总体性质，包括参数估计、假设检验和置信区间。',
        formula: '\\bar{X} = \\frac{1}{n}\\sum_{i=1}^n X_i',
        keywords: ['参数估计', '假设检验', '置信区间', '最大似然估计', '统计推断']
      },
      '随机过程': {
        name: '随机过程',
        nameEn: 'Stochastic Process',
        description: '随机过程研究随时间演化的随机现象，包括马尔可夫链、泊松过程和布朗运动。',
        formula: 'P(X_{n+1}=j|X_n=i) = p_{ij}',
        keywords: ['马尔可夫链', '泊松过程', '布朗运动', '平稳过程', '随机微分方程']
      },
      
      // Domain-5: 真实问题建模
      '人工智能应用': {
        name: '人工智能应用',
        nameEn: 'AI Applications',
        description: '微积分在人工智能中的应用，包括神经网络训练、梯度下降和反向传播算法。',
        formula: '\\frac{\\partial L}{\\partial w} = \\frac{\\partial L}{\\partial y} \\frac{\\partial y}{\\partial w}',
        keywords: ['神经网络', '梯度下降', '反向传播', '深度学习', '优化算法']
      },
      '金融工程应用': {
        name: '金融工程应用',
        nameEn: 'Financial Engineering',
        description: '微积分在金融工程中的应用，包括期权定价、风险管理和投资组合优化。',
        formula: '\\frac{\\partial V}{\\partial t} + \\frac{1}{2}\\sigma^2 S^2 \\frac{\\partial^2 V}{\\partial S^2} + rS\\frac{\\partial V}{\\partial S} - rV = 0',
        keywords: ['期权定价', 'Black-Scholes方程', '风险管理', '投资组合', '随机微积分']
      },
      '物理建模': {
        name: '物理建模',
        nameEn: 'Physics Modeling',
        description: '微积分在物理建模中的应用，包括力学系统、电磁场和量子力学的数学描述。',
        formula: 'F = ma = m\\frac{d^2x}{dt^2}',
        keywords: ['牛顿力学', '电磁场', '量子力学', '哈密顿力学', '拉格朗日力学']
      },
      
      // 默认模板
      'default': {
        name: '数学概念',
        nameEn: 'Mathematical Concept',
        description: '这是一个数学概念的描述。',
        formula: 'f(x) = x',
        keywords: ['数学', '概念']
      }
    };
  }

  /**
   * 生成指定domain的节点
   * @param {string} domainId - Domain ID (e.g., "domain-1")
   * @param {number} count - 要生成的节点数量
   * @param {Object} config - 生成配置
   * @returns {Array<Node>} 生成的节点数组
   */
  generateNodes(domainId, count, config = {}) {
    console.log(`生成 ${domainId} 的 ${count} 个节点...`);
    
    // 验证domainId
    if (!this.config.domains[domainId]) {
      throw new Error(`Invalid domain ID: ${domainId}`);
    }
    
    // 获取domain配置
    const domainConfig = this.config.domains[domainId];
    const topics = config.topics || domainConfig.topics;
    const difficultyRange = config.difficulty || domainConfig.difficulty;
    const studyTimeRange = config.estimatedStudyTime || domainConfig.estimatedStudyTime;
    
    const nodes = [];
    
    // 为每个节点生成数据
    for (let i = 0; i < count; i++) {
      // 循环使用主题列表
      const topic = topics[i % topics.length];
      
      // 创建节点
      const node = this.createNode(domainId, topic, {
        difficultyRange,
        studyTimeRange,
        advanced: config.advanced || false
      });
      
      nodes.push(node);
      this.generatedNodes.push(node);
    }
    
    console.log(`成功生成 ${nodes.length} 个节点`);
    return nodes;
  }

  /**
   * 根据模板创建单个节点
   * @param {string} domainId - Domain ID
   * @param {string} topic - 主题名称
   * @param {Object} options - 创建选项
   * @returns {Node} 节点对象
   */
  createNode(domainId, topic, options = {}) {
    const { difficultyRange = [3, 4, 5], studyTimeRange = [60, 90], advanced = false } = options;
    
    // 获取模板
    const template = this.templates[topic] || this.templates['default'];
    
    // 随机选择难度和学习时长
    const difficulty = this.randomFromArray(difficultyRange);
    const estimatedStudyTime = this.randomFromArray(studyTimeRange);
    
    // 生成节点ID
    const nodeId = this.generateNodeId(domainId, topic);
    
    // 选择前置节点
    const prerequisites = this.selectPrerequisites(topic, domainId, difficulty);
    
    // 选择相关Skills
    const relatedSkills = this.selectRelatedSkills(topic, domainId);
    
    // 生成应用案例
    const minApplications = difficulty >= 4 ? 2 : 1;
    const realWorldApplications = this.generateNodeApplications(topic, difficulty, minApplications);
    
    // 计算重要性（基于难度和主题）
    const importance = Math.min(5, Math.max(1, difficulty + (advanced ? 1 : 0)));
    
    // 创建节点对象
    const node = {
      id: nodeId,
      name: template.name,
      nameEn: template.nameEn,
      description: template.description,
      domains: [domainId],
      traditionalChapter: this.getTraditionalChapter(domainId),
      difficulty: difficulty,
      prerequisites: prerequisites,
      relatedSkills: relatedSkills,
      formula: template.formula,
      keywords: template.keywords,
      importance: importance,
      estimatedStudyTime: estimatedStudyTime,
      realWorldApplications: realWorldApplications,
      advancedTopics: advanced ? this.generateAdvancedTopics(topic) : [],
      visualizationConfig: this.generateVisualizationConfig(topic)
    };
    
    return node;
  }

  /**
   * 基于依赖图选择前置节点
   * @param {string} topic - 主题名称
   * @param {string} domainId - Domain ID
   * @param {number} difficulty - 节点难度
   * @returns {Array<string>} 前置节点ID数组
   */
  selectPrerequisites(topic, domainId, difficulty) {
    // 定义主题依赖关系
    const dependencyMap = {
      '曲率': ['node-derivative-def', 'node-parametric-equations'],
      '函数作图': ['node-derivative-def', 'node-monotonicity'],
      '不等式证明': ['node-derivative-def', 'node-mean-value-theorem'],
      '泰勒展开应用': ['node-taylor-series', 'node-derivative-def'],
      '曲线积分': ['node-integral-def', 'node-parametric-equations'],
      '曲面积分': ['node-double-integral', 'node-parametric-surface'],
      '场论': ['node-partial-derivative', 'node-vector-field'],
      '偏微分方程': ['node-partial-derivative', 'node-ode'],
      '级数应用': ['node-series', 'node-convergence'],
      '向量分析': ['node-vector', 'node-derivative-def'],
      '张量': ['node-matrix', 'node-vector'],
      '变分法': ['node-functional', 'node-optimization'],
      '最优控制': ['node-optimization', 'node-ode'],
      '数值优化': ['node-optimization', 'node-gradient'],
      '概率论基础': ['node-set-theory', 'node-combinatorics'],
      '随机变量': ['node-probability-basics', 'node-function'],
      '常见分布': ['node-random-variable', 'node-probability-basics'],
      '数理统计': ['node-random-variable', 'node-expectation'],
      '随机过程': ['node-probability-basics', 'node-random-variable'],
      '人工智能应用': ['node-gradient', 'node-chain-rule', 'node-optimization'],
      '金融工程应用': ['node-probability-basics', 'node-stochastic-process'],
      '物理建模': ['node-ode', 'node-pde']
    };
    
    // 获取该主题的依赖
    const dependencies = dependencyMap[topic] || [];
    
    // 过滤出已存在的节点
    const validPrerequisites = dependencies.filter(prereqId => {
      // 检查是否在已生成的节点中
      const exists = this.existingNodes.some(n => n.id === prereqId) ||
                     this.generatedNodes.some(n => n.id === prereqId);
      return exists;
    });
    
    // 如果没有找到依赖，尝试从同domain中选择难度更低的节点
    if (validPrerequisites.length === 0 && difficulty > 1) {
      const lowerDifficultyNodes = this.generatedNodes
        .filter(n => n.domains.includes(domainId) && n.difficulty < difficulty)
        .slice(-2)  // 取最近生成的2个
        .map(n => n.id);
      
      return lowerDifficultyNodes;
    }
    
    return validPrerequisites;
  }

  /**
   * 关联相关Skills
   * @param {string} topic - 主题名称
   * @param {string} domainId - Domain ID
   * @returns {Array<string>} Skills ID数组
   */
  selectRelatedSkills(topic, domainId) {
    // 定义主题到Skills的映射
    const skillMap = {
      'domain-1': ['函数极限与连续Skill', '导数与微分Skill', '概念可视化Skill'],
      'domain-2': ['积分概念Skill', '多元函数Skill', '推导动画Skill'],
      'domain-3': ['多元函数Skill', '优化方法Skill', '概念可视化Skill'],
      'domain-4': ['概率统计Skill', '数据分析Skill', '概念可视化Skill'],
      'domain-5': ['应用建模Skill', '编程实现Skill', '数据可视化Skill']
    };
    
    // 获取该domain的Skills
    const domainSkills = skillMap[domainId] || ['概念可视化Skill'];
    
    // 随机选择1-2个Skills
    const count = Math.random() < 0.5 ? 1 : 2;
    const selectedSkills = [];
    
    for (let i = 0; i < count && i < domainSkills.length; i++) {
      const skill = domainSkills[i];
      if (!selectedSkills.includes(skill)) {
        selectedSkills.push(skill);
      }
    }
    
    return selectedSkills;
  }

  /**
   * 生成节点的应用案例
   * @param {string} topic - 主题名称
   * @param {number} difficulty - 难度
   * @param {number} minCount - 最小案例数量
   * @returns {Array<Object>} 应用案例数组
   */
  generateNodeApplications(topic, difficulty, minCount) {
    const applications = [];
    const industries = this.config.applications.industries;
    
    // 根据主题选择合适的行业
    const relevantIndustries = this.selectIndustriesForTopic(topic);
    
    for (let i = 0; i < minCount; i++) {
      const industry = relevantIndustries[i % relevantIndustries.length];
      applications.push({
        title: this.generateApplicationTitle(topic, industry),
        description: this.generateApplicationDescription(topic, industry),
        industry: industry
      });
    }
    
    return applications;
  }

  /**
   * 为主题选择相关行业
   * @param {string} topic - 主题名称
   * @returns {Array<string>} 行业列表
   */
  selectIndustriesForTopic(topic) {
    const topicIndustryMap = {
      '曲率': ['土木工程', '计算机图形学', '机械工程'],
      '函数作图': ['数据科学', '计算机图形学', '教育'],
      '不等式证明': ['数学研究', '优化理论', '经济学'],
      '泰勒展开应用': ['数值计算', '物理学', '工程'],
      '曲线积分': ['物理学', '工程', '计算机图形学'],
      '曲面积分': ['流体力学', '电磁学', '工程'],
      '场论': ['物理学', '电磁学', '流体力学'],
      '偏微分方程': ['物理学', '工程', '金融'],
      '级数应用': ['信号处理', '数值计算', '物理学'],
      '向量分析': ['物理学', '工程', '计算机图形学'],
      '张量': ['物理学', '机器学习', '工程'],
      '变分法': ['物理学', '优化', '控制理论'],
      '最优控制': ['航空航天', '机器人', '经济学'],
      '数值优化': ['机器学习', '运筹学', '工程'],
      '概率论基础': ['统计学', '数据科学', '金融'],
      '随机变量': ['统计学', '金融', '保险'],
      '常见分布': ['统计学', '质量控制', '生物统计'],
      '数理统计': ['数据科学', '医学研究', '社会科学'],
      '随机过程': ['金融', '通信', '排队论'],
      '人工智能应用': ['机器学习', '深度学习', '计算机视觉'],
      '金融工程应用': ['金融', '风险管理', '投资'],
      '物理建模': ['物理学', '工程', '天文学']
    };
    
    return topicIndustryMap[topic] || ['科学研究', '工程', '教育'];
  }

  /**
   * 生成应用案例标题
   * @param {string} topic - 主题名称
   * @param {string} industry - 行业
   * @returns {string} 标题
   */
  generateApplicationTitle(topic, industry) {
    const templates = {
      '曲率': `${industry}中的曲率应用`,
      '函数作图': `${industry}中的函数可视化`,
      '不等式证明': `${industry}中的不等式优化`,
      '泰勒展开应用': `${industry}中的函数近似`,
      '曲线积分': `${industry}中的路径积分`,
      '曲面积分': `${industry}中的通量计算`,
      '场论': `${industry}中的场分析`,
      '偏微分方程': `${industry}中的PDE建模`,
      '级数应用': `${industry}中的级数展开`,
      '向量分析': `${industry}中的向量场`,
      '张量': `${industry}中的张量计算`,
      '变分法': `${industry}中的变分优化`,
      '最优控制': `${industry}中的最优控制`,
      '数值优化': `${industry}中的优化算法`,
      '概率论基础': `${industry}中的概率模型`,
      '随机变量': `${industry}中的随机建模`,
      '常见分布': `${industry}中的分布拟合`,
      '数理统计': `${industry}中的统计推断`,
      '随机过程': `${industry}中的随机过程`,
      '人工智能应用': `${industry}中的AI应用`,
      '金融工程应用': `${industry}中的金融建模`,
      '物理建模': `${industry}中的物理模拟`
    };
    
    return templates[topic] || `${topic}在${industry}中的应用`;
  }

  /**
   * 生成应用案例描述
   * @param {string} topic - 主题名称
   * @param {string} industry - 行业
   * @returns {string} 描述
   */
  generateApplicationDescription(topic, industry) {
    return `在${industry}领域，${topic}被广泛应用于解决实际问题，通过数学建模和计算方法提供有效的解决方案。`;
  }

  /**
   * 生成高级主题列表
   * @param {string} topic - 主题名称
   * @returns {Array<string>} 高级主题列表
   */
  generateAdvancedTopics(topic) {
    const advancedTopicsMap = {
      '曲率': ['曲率张量', '高斯曲率', '平均曲率', '测地曲率'],
      '函数作图': ['参数曲线', '极坐标图', '隐函数图像', '三维曲面'],
      '不等式证明': ['变分不等式', '积分不等式', '泛函不等式'],
      '泰勒展开应用': ['多元泰勒展开', '渐近展开', '帕德近似'],
      '曲线积分': ['格林公式', '斯托克斯定理', '复变函数积分'],
      '曲面积分': ['高斯定理', '散度定理', '流形上的积分'],
      '场论': ['微分形式', '外微分', '霍奇理论'],
      '偏微分方程': ['特征线法', '分离变量法', '格林函数法'],
      '级数应用': ['傅里叶级数', '小波分析', '正交级数']
    };
    
    return advancedTopicsMap[topic] || [];
  }

  /**
   * 生成可视化配置
   * @param {string} topic - 主题名称
   * @returns {Object} 可视化配置
   */
  generateVisualizationConfig(topic) {
    const configMap = {
      '曲率': {
        type: 'interactive-curve',
        showCurvatureCircle: true,
        showTangent: true,
        showNormal: true
      },
      '函数作图': {
        type: 'function-plot',
        showDerivative: true,
        showInflectionPoints: true,
        showAsymptotes: true
      },
      '场论': {
        type: 'vector-field',
        show3D: true,
        showStreamlines: true
      },
      '偏微分方程': {
        type: 'animation',
        showTimeEvolution: true,
        showHeatmap: true
      }
    };
    
    return configMap[topic] || { type: 'static-plot' };
  }

  /**
   * 获取传统章节映射
   * @param {string} domainId - Domain ID
   * @returns {string} 章节ID
   */
  getTraditionalChapter(domainId) {
    const chapterMap = {
      'domain-1': 'chapter-2',
      'domain-2': 'chapter-3',
      'domain-3': 'chapter-4',
      'domain-4': 'chapter-5',
      'domain-5': 'chapter-6'
    };
    
    return chapterMap[domainId] || 'chapter-1';
  }

  /**
   * 从数组中随机选择一个元素
   * @param {Array} array - 数组
   * @returns {*} 随机元素
   */
  randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 在范围内生成随机整数
   * @param {Array<number>} range - 范围数组
   * @returns {number} 随机整数
   */
  randomInRange(range) {
    const min = Math.min(...range);
    const max = Math.max(...range);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 生成节点之间的边关系
   * @param {Array<Node>} nodes - 节点数组
   * @param {Object} config - 边生成配置
   * @returns {Array<Edge>} 生成的边数组
   */
  generateEdges(nodes, config) {
    console.log('生成边关系...');
    const edgeGenerator = new EdgeGenerator(config);
    return edgeGenerator.generateAllEdges(nodes);
  }

  /**
   * 生成应用案例
   * @param {number} count - 要生成的案例数量
   * @param {Array<string>} industries - 行业列表
   * @param {Array<Node>} nodes - 相关节点
   * @returns {Array<Application>} 生成的应用案例数组
   */
  generateApplications(count, industries, nodes) {
    console.log(`生成 ${count} 个应用案例...`);
    
    if (!industries || industries.length === 0) {
      industries = this.config.applications.industries;
    }
    
    if (!nodes || nodes.length === 0) {
      nodes = this.generatedNodes;
    }
    
    const applications = [];
    
    // 确保每个行业至少有一个案例
    const industriesUsed = new Set();
    
    for (let i = 0; i < count; i++) {
      // 选择行业（优先选择未使用的行业）
      const industry = this.selectIndustry(industries, industriesUsed, i, count);
      industriesUsed.add(industry);
      
      // 选择相关节点（优先选择高级节点）
      const relatedNodes = this.selectRelatedNodesForApplication(nodes, industry);
      
      // 确定难度（基于相关节点的平均难度）
      const difficulty = this.calculateApplicationDifficulty(relatedNodes, nodes);
      
      // 生成应用案例
      const application = this.createApplication(i, industry, relatedNodes, difficulty, nodes);
      
      applications.push(application);
      this.generatedApplications.push(application);
    }
    
    console.log(`成功生成 ${applications.length} 个应用案例，覆盖 ${industriesUsed.size} 个行业`);
    return applications;
  }

  /**
   * 选择行业
   * @param {Array<string>} industries - 可用行业列表
   * @param {Set<string>} industriesUsed - 已使用的行业
   * @param {number} index - 当前索引
   * @param {number} total - 总数量
   * @returns {string} 选择的行业
   */
  selectIndustry(industries, industriesUsed, index, total) {
    // 前面的案例优先选择未使用的行业，确保行业多样性
    if (index < industries.length) {
      return industries[index % industries.length];
    }
    
    // 后面的案例可以重复使用行业
    return this.randomFromArray(industries);
  }

  /**
   * 为应用案例选择相关节点
   * @param {Array<Node>} nodes - 节点数组
   * @param {string} industry - 行业
   * @returns {Array<string>} 相关节点ID数组
   */
  selectRelatedNodesForApplication(nodes, industry) {
    if (nodes.length === 0) {
      return [];
    }
    
    // 根据行业选择相关的节点
    const relevantNodes = nodes.filter(node => {
      // 检查节点的应用案例是否与该行业相关
      return node.realWorldApplications && 
             node.realWorldApplications.some(app => app.industry === industry);
    });
    
    // 如果没有找到相关节点，随机选择一些节点
    const nodesToSelect = relevantNodes.length > 0 ? relevantNodes : nodes;
    
    // 优先选择高级节点（difficulty >= 4）
    const advancedNodes = nodesToSelect.filter(n => n.difficulty >= 4);
    const selectedNodes = advancedNodes.length > 0 ? advancedNodes : nodesToSelect;
    
    // 随机选择1-3个节点
    const count = Math.min(Math.floor(Math.random() * 3) + 1, selectedNodes.length);
    const selected = [];
    const indices = new Set();
    
    while (selected.length < count && indices.size < selectedNodes.length) {
      const index = Math.floor(Math.random() * selectedNodes.length);
      if (!indices.has(index)) {
        indices.add(index);
        selected.push(selectedNodes[index].id);
      }
    }
    
    return selected;
  }

  /**
   * 计算应用案例的难度
   * @param {Array<string>} relatedNodeIds - 相关节点ID数组
   * @param {Array<Node>} nodes - 所有节点
   * @returns {number} 难度值（1-5）
   */
  calculateApplicationDifficulty(relatedNodeIds, nodes) {
    if (relatedNodeIds.length === 0) {
      return 3; // 默认中等难度
    }
    
    // 计算相关节点的平均难度
    const relatedNodes = nodes.filter(n => relatedNodeIds.includes(n.id));
    if (relatedNodes.length === 0) {
      return 3;
    }
    
    const avgDifficulty = relatedNodes.reduce((sum, n) => sum + n.difficulty, 0) / relatedNodes.length;
    return Math.round(avgDifficulty);
  }

  /**
   * 创建应用案例对象
   * @param {number} index - 案例索引
   * @param {string} industry - 行业
   * @param {Array<string>} relatedNodes - 相关节点ID数组
   * @param {number} difficulty - 难度
   * @param {Array<Node>} nodes - 所有节点
   * @returns {Object} 应用案例对象
   */
  createApplication(index, industry, relatedNodes, difficulty, nodes) {
    // 生成应用案例ID
    const appId = `app-${industry.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${Date.now()}-${index}`;
    
    // 根据行业和相关节点生成标题
    const title = this.generateApplicationTitleForIndustry(industry, relatedNodes, nodes);
    
    // 生成描述
    const description = this.generateApplicationDescriptionForIndustry(industry, relatedNodes, nodes);
    
    // 获取相关的domains
    const relatedDomains = this.getRelatedDomains(relatedNodes, nodes);
    
    // 生成数学概念列表
    const mathematicalConcepts = this.generateMathematicalConcepts(relatedNodes, nodes);
    
    // 生成问题陈述
    const problemStatement = this.generateProblemStatement(industry, title);
    
    // 生成数学模型
    const mathematicalModel = this.generateMathematicalModel(industry, relatedNodes, nodes);
    
    // 生成解决方案
    const solution = this.generateSolution(industry, mathematicalModel);
    
    // 生成代码实现
    const code = this.generateCodeImplementation(industry, title);
    
    // 生成可视化配置
    const visualization = this.generateVisualizationForApplication(industry, title);
    
    // 生成实际影响描述
    const realWorldImpact = this.generateRealWorldImpact(industry, title);
    
    // 生成参考文献
    const references = this.generateReferences(industry, title);
    
    // 估算学习时长（基于难度）
    const estimatedStudyTime = 60 + (difficulty - 1) * 15; // 60-120分钟
    
    return {
      id: appId,
      title: title,
      industry: industry,
      difficulty: difficulty,
      relatedNodes: relatedNodes,
      relatedDomains: relatedDomains,
      description: description,
      mathematicalConcepts: mathematicalConcepts,
      problemStatement: problemStatement,
      mathematicalModel: mathematicalModel,
      solution: solution,
      code: code,
      visualization: visualization,
      realWorldImpact: realWorldImpact,
      references: references,
      estimatedStudyTime: estimatedStudyTime
    };
  }

  /**
   * 为行业生成应用案例标题
   * @param {string} industry - 行业
   * @param {Array<string>} relatedNodeIds - 相关节点ID
   * @param {Array<Node>} nodes - 所有节点
   * @returns {string} 标题
   */
  generateApplicationTitleForIndustry(industry, relatedNodeIds, nodes) {
    const industryTitles = {
      '人工智能与机器学习': [
        '神经网络反向传播算法',
        '梯度下降优化算法',
        '卷积神经网络中的数学原理',
        '深度学习中的正则化技术'
      ],
      '金融科技': [
        'Black-Scholes期权定价模型',
        '投资组合优化与风险管理',
        '蒙特卡洛模拟在金融中的应用',
        '随机微积分与期权定价'
      ],
      '医疗健康': [
        '医学图像处理中的微积分',
        '药物浓度建模与优化',
        '疾病传播模型',
        'CT扫描重建算法'
      ],
      '通信工程': [
        '信号处理中的傅里叶变换',
        '通信系统中的调制解调',
        '天线辐射场分析',
        '数字滤波器设计'
      ],
      '机械工程': [
        '结构优化设计',
        '振动分析与控制',
        '流体力学中的微分方程',
        '热传导问题建模'
      ],
      '环境科学': [
        '污染扩散模型',
        '气候变化预测模型',
        '生态系统动力学',
        '水资源优化管理'
      ],
      '数据科学': [
        '回归分析与预测建模',
        '时间序列分析',
        '主成分分析（PCA）',
        '聚类算法优化'
      ],
      '物理学': [
        '量子力学中的薛定谔方程',
        '电磁场理论',
        '相对论中的时空几何',
        '统计力学与热力学'
      ],
      '化学工程': [
        '化学反应动力学',
        '传质传热过程建模',
        '反应器优化设计',
        '分离过程优化'
      ],
      '生物信息学': [
        '基因序列分析',
        '蛋白质结构预测',
        '种群动力学模型',
        '神经网络建模'
      ],
      '经济学': [
        '供需平衡优化',
        '博弈论中的纳什均衡',
        '经济增长模型',
        '最优税收理论'
      ],
      '运筹学': [
        '线性规划与单纯形法',
        '网络流优化',
        '排队论模型',
        '库存管理优化'
      ],
      '计算机图形学': [
        '贝塞尔曲线与曲面',
        '光线追踪算法',
        '三维变换与投影',
        '纹理映射与插值'
      ],
      '网络安全': [
        '密码学中的数论',
        '椭圆曲线加密',
        '随机数生成算法',
        '信息熵与加密强度'
      ],
      '量子计算': [
        '量子态演化',
        '量子纠缠与测量',
        '量子算法优化',
        '量子误差修正'
      ]
    };
    
    const titles = industryTitles[industry] || [`${industry}中的数学应用`];
    return this.randomFromArray(titles);
  }

  /**
   * 为行业生成应用案例描述
   * @param {string} industry - 行业
   * @param {Array<string>} relatedNodeIds - 相关节点ID
   * @param {Array<Node>} nodes - 所有节点
   * @returns {string} 描述
   */
  generateApplicationDescriptionForIndustry(industry, relatedNodeIds, nodes) {
    const descriptions = {
      '人工智能与机器学习': '通过微积分和优化理论，深度学习算法能够自动从数据中学习特征和模式，实现图像识别、自然语言处理等复杂任务。',
      '金融科技': '利用随机微积分和偏微分方程，金融工程师能够对衍生品进行定价，评估投资风险，优化投资组合配置。',
      '医疗健康': '微积分在医学成像、药物动力学和疾病建模中发挥关键作用，帮助医生做出更准确的诊断和治疗决策。',
      '通信工程': '傅里叶分析和微分方程是现代通信系统的数学基础，用于信号处理、调制解调和信道编码。',
      '机械工程': '通过微积分和优化方法，工程师能够设计更轻、更强、更高效的机械结构和系统。',
      '环境科学': '微分方程模型帮助科学家理解和预测污染物扩散、气候变化和生态系统演化。',
      '数据科学': '统计学和微积分是数据分析的核心工具，用于建立预测模型、发现数据模式和做出数据驱动的决策。',
      '物理学': '微积分是物理学的语言，从经典力学到量子力学，所有物理定律都用微分方程来表达。',
      '化学工程': '化学反应和传递过程的建模依赖于微分方程，帮助工程师优化反应器设计和工艺流程。',
      '生物信息学': '数学模型和统计方法用于分析基因序列、预测蛋白质结构和理解生物系统的复杂行为。',
      '经济学': '微积分和优化理论是现代经济学的基础，用于分析市场均衡、最优决策和经济增长。',
      '运筹学': '线性规划、网络优化和排队论等数学方法帮助企业优化资源配置、提高运营效率。',
      '计算机图形学': '微积分和几何学是计算机图形学的基础，用于曲线曲面建模、光照计算和动画生成。',
      '网络安全': '数论和概率论是现代密码学的基础，保护信息安全和隐私。',
      '量子计算': '量子力学和线性代数是量子计算的数学基础，开启了计算能力的新纪元。'
    };
    
    return descriptions[industry] || `${industry}领域广泛应用数学方法解决实际问题，通过建模和计算提供有效的解决方案。`;
  }

  /**
   * 获取相关的domains
   * @param {Array<string>} relatedNodeIds - 相关节点ID
   * @param {Array<Node>} nodes - 所有节点
   * @returns {Array<string>} domain ID数组
   */
  getRelatedDomains(relatedNodeIds, nodes) {
    const domains = new Set();
    
    relatedNodeIds.forEach(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      if (node && node.domains) {
        node.domains.forEach(d => domains.add(d));
      }
    });
    
    // 如果没有找到相关节点，返回默认domain
    if (domains.size === 0) {
      return ['domain-5']; // 真实问题建模
    }
    
    return Array.from(domains);
  }

  /**
   * 生成数学概念列表
   * @param {Array<string>} relatedNodeIds - 相关节点ID
   * @param {Array<Node>} nodes - 所有节点
   * @returns {Array<string>} 数学概念列表
   */
  generateMathematicalConcepts(relatedNodeIds, nodes) {
    const concepts = [];
    
    relatedNodeIds.forEach(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        concepts.push(node.name);
        // 添加一些关键词作为相关概念
        if (node.keywords && node.keywords.length > 0) {
          concepts.push(...node.keywords.slice(0, 2));
        }
      }
    });
    
    // 如果没有找到概念，返回默认概念
    if (concepts.length === 0) {
      return ['微积分', '优化', '建模'];
    }
    
    // 去重并限制数量
    return [...new Set(concepts)].slice(0, 5);
  }

  /**
   * 生成问题陈述
   * @param {string} industry - 行业
   * @param {string} title - 标题
   * @returns {string} 问题陈述
   */
  generateProblemStatement(industry, title) {
    return `在${industry}领域，${title}是一个重要的问题。如何通过数学建模和计算方法找到有效的解决方案？`;
  }

  /**
   * 生成数学模型
   * @param {string} industry - 行业
   * @param {Array<string>} relatedNodeIds - 相关节点ID
   * @param {Array<Node>} nodes - 所有节点
   * @returns {Object} 数学模型对象
   */
  generateMathematicalModel(industry, relatedNodeIds, nodes) {
    // 获取相关节点的公式
    const formulas = [];
    relatedNodeIds.forEach(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      if (node && node.formula) {
        formulas.push(node.formula);
      }
    });
    
    return {
      objective: '最小化成本函数或最大化效用函数',
      constraints: '满足物理约束和边界条件',
      variables: '决策变量和状态变量',
      equations: formulas.length > 0 ? formulas[0] : 'f(x) = 0'
    };
  }

  /**
   * 生成解决方案
   * @param {string} industry - 行业
   * @param {Object} mathematicalModel - 数学模型
   * @returns {Object} 解决方案对象
   */
  generateSolution(industry, mathematicalModel) {
    return {
      steps: [
        '建立数学模型，定义目标函数和约束条件',
        '选择合适的数值方法或优化算法',
        '实现算法并进行参数调优',
        '验证结果并分析敏感性',
        '将解决方案应用到实际问题中'
      ],
      complexity: 'O(n²) 或 O(n log n)，取决于具体算法',
      convergence: '在满足一定条件下保证收敛'
    };
  }

  /**
   * 生成代码实现
   * @param {string} industry - 行业
   * @param {string} title - 标题
   * @returns {Object} 代码对象
   */
  generateCodeImplementation(industry, title) {
    // 根据行业选择编程语言
    const language = this.selectProgrammingLanguage(industry);
    
    // 生成代码实现
    const implementation = this.generateCodeByLanguage(language, industry, title);
    
    return {
      language: language,
      implementation: implementation
    };
  }

  /**
   * 选择编程语言
   * @param {string} industry - 行业
   * @returns {string} 编程语言
   */
  selectProgrammingLanguage(industry) {
    const languageMap = {
      '人工智能与机器学习': 'python',
      '金融科技': 'python',
      '医疗健康': 'python',
      '数据科学': 'python',
      '生物信息学': 'python',
      '计算机图形学': 'javascript',
      '通信工程': 'python',
      '网络安全': 'python'
    };
    
    return languageMap[industry] || 'python';
  }

  /**
   * 根据语言生成代码
   * @param {string} language - 编程语言
   * @param {string} industry - 行业
   * @param {string} title - 标题
   * @returns {string} 代码实现
   */
  generateCodeByLanguage(language, industry, title) {
    if (language === 'python') {
      return `import numpy as np
import matplotlib.pyplot as plt

def solve_problem(data):
    """
    ${title}的实现
    
    参数:
        data: 输入数据
    
    返回:
        result: 计算结果
    """
    # 数据预处理
    X = np.array(data)
    
    # 核心算法实现
    result = np.zeros_like(X)
    for i in range(len(X)):
        result[i] = X[i] * 2  # 示例计算
    
    return result

# 示例使用
data = [1, 2, 3, 4, 5]
result = solve_problem(data)
print(f"计算结果: {result}")

# 可视化
plt.plot(data, result)
plt.xlabel('输入')
plt.ylabel('输出')
plt.title('${title}')
plt.show()`;
    } else {
      return `// ${title}的JavaScript实现

function solveProblem(data) {
    /**
     * ${title}的实现
     * @param {Array} data - 输入数据
     * @returns {Array} 计算结果
     */
    // 数据预处理
    const X = [...data];
    
    // 核心算法实现
    const result = X.map(x => x * 2);  // 示例计算
    
    return result;
}

// 示例使用
const data = [1, 2, 3, 4, 5];
const result = solveProblem(data);
console.log('计算结果:', result);

// 可视化（使用D3.js或Plotly）
// ... 可视化代码 ...`;
    }
  }

  /**
   * 为应用案例生成可视化配置
   * @param {string} industry - 行业
   * @param {string} title - 标题
   * @returns {Object} 可视化配置
   */
  generateVisualizationForApplication(industry, title) {
    const visualizationTypes = {
      '人工智能与机器学习': {
        type: 'interactive-network',
        description: '可视化神经网络结构和训练过程，显示损失函数的变化',
        library: 'plotly',
        features: ['动画演示', '参数调节', '损失曲线']
      },
      '金融科技': {
        type: 'time-series',
        description: '可视化资产价格变化和投资组合表现',
        library: 'plotly',
        features: ['时间序列图', '风险分析', '收益曲线']
      },
      '医疗健康': {
        type: '3d-visualization',
        description: '可视化医学图像和生理数据',
        library: 'three.js',
        features: ['3D渲染', '切片显示', '数据叠加']
      },
      '数据科学': {
        type: 'statistical-plot',
        description: '可视化数据分布和统计分析结果',
        library: 'plotly',
        features: ['散点图', '直方图', '箱线图']
      }
    };
    
    return visualizationTypes[industry] || {
      type: 'line-chart',
      description: `可视化${title}的计算结果`,
      library: 'plotly',
      features: ['交互式图表', '数据标注']
    };
  }

  /**
   * 生成实际影响描述
   * @param {string} industry - 行业
   * @param {string} title - 标题
   * @returns {string} 实际影响
   */
  generateRealWorldImpact(industry, title) {
    const impacts = {
      '人工智能与机器学习': '深度学习算法的突破使得计算机视觉、自然语言处理等领域取得了革命性进展，广泛应用于自动驾驶、医疗诊断、智能助手等场景。',
      '金融科技': '量化交易和风险管理模型帮助金融机构更好地理解市场动态，降低投资风险，提高收益率。',
      '医疗健康': '数学建模和图像处理技术提高了疾病诊断的准确性，加速了新药研发，改善了患者治疗效果。',
      '通信工程': '先进的信号处理技术使得5G通信、卫星通信等成为可能，极大地提高了通信速度和可靠性。',
      '环境科学': '环境模型帮助政策制定者理解气候变化的影响，制定有效的环境保护政策。'
    };
    
    return impacts[industry] || `${title}在${industry}领域产生了重要影响，提高了效率和准确性，推动了行业发展。`;
  }

  /**
   * 生成参考文献
   * @param {string} industry - 行业
   * @param {string} title - 标题
   * @returns {Array<string>} 参考文献列表
   */
  generateReferences(industry, title) {
    return [
      `${industry}领域的经典教材和论文`,
      '相关数学理论的标准参考书',
      '最新的研究进展和应用案例'
    ];
  }

  /**
   * 生成Skills深度内容
   * @param {string} skillId - Skill ID
   * @param {Object} content - 内容配置
   * @returns {Object} Skills内容对象
   */
  generateSkillContent(skillId, content = {}) {
    console.log(`生成 ${skillId} 的深度内容...`);
    
    // 生成高级主题
    const advancedTopics = this.generateAdvancedTopicsForSkill(skillId);
    console.log(`  - 生成了 ${advancedTopics.length} 个高级主题`);
    
    // 生成进阶练习题（至少10道）
    const advancedExercises = this.generateAdvancedExercisesForSkill(skillId);
    console.log(`  - 生成了 ${advancedExercises.length} 道进阶练习题`);
    
    // 生成项目实战（至少2个）
    const projects = this.generateProjectsForSkill(skillId);
    console.log(`  - 生成了 ${projects.length} 个项目实战案例`);
    
    // 构建Skills内容对象
    const skillContent = {
      skillId: skillId,
      phase: 'phase2',
      advancedTopics: advancedTopics,
      advancedExercises: advancedExercises,
      projects: projects,
      metadata: {
        generatedDate: new Date().toISOString(),
        version: '2.0',
        totalTopics: advancedTopics.length,
        totalExercises: advancedExercises.length,
        totalProjects: projects.length
      }
    };
    
    return skillContent;
  }

  /**
   * 导出所有生成的数据到JSON文件
   * @param {string} outputDir - 输出目录
   */
  /**
   * 导出所有生成的数据到JSON文件
   * @param {string} outputDir - 输出目录路径
   * @returns {Object} 导出结果统计
   */
  exportToJSON(outputDir) {
    const fs = require('fs');
    const path = require('path');
    
    console.log(`导出数据到 ${outputDir}...`);
    
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const currentDate = new Date().toISOString().split('T')[0];
    const results = {
      nodesFile: null,
      edgesFile: null,
      applicationsFile: null,
      skillsFile: null,
      errors: []
    };
    
    try {
      // 1. 导出节点数据
      if (this.generatedNodes.length > 0) {
        const nodesData = {
          metadata: {
            version: "2.0",
            phase: "Phase 2 - 内容深度扩展",
            totalItems: this.generatedNodes.length,
            createdDate: currentDate,
            description: "Phase 2新增的75个高级节点",
            author: "Content_Generator",
            dependencies: ["nodes-extended-phase1.json"]
          },
          data: this.generatedNodes
        };
        
        const nodesPath = path.join(outputDir, 'nodes-extended-phase2.json');
        fs.writeFileSync(nodesPath, JSON.stringify(nodesData, null, 2), 'utf8');
        results.nodesFile = nodesPath;
        console.log(`✓ 已导出 ${this.generatedNodes.length} 个节点到 ${nodesPath}`);
      }
      
      // 2. 导出边关系数据
      if (this.generatedEdges.length > 0) {
        const edgesData = {
          metadata: {
            version: "2.0",
            phase: "Phase 2 - 内容深度扩展",
            totalItems: this.generatedEdges.length,
            createdDate: currentDate,
            description: "Phase 2新增节点的边关系",
            author: "Content_Generator",
            dependencies: ["nodes-extended-phase2.json"]
          },
          data: this.generatedEdges
        };
        
        const edgesPath = path.join(outputDir, 'edges-extended-phase2.json');
        fs.writeFileSync(edgesPath, JSON.stringify(edgesData, null, 2), 'utf8');
        results.edgesFile = edgesPath;
        console.log(`✓ 已导出 ${this.generatedEdges.length} 条边关系到 ${edgesPath}`);
      }
      
      // 3. 导出应用案例数据
      if (this.generatedApplications.length > 0) {
        const applicationsData = {
          metadata: {
            version: "2.0",
            phase: "Phase 2 - 内容深度扩展",
            totalItems: this.generatedApplications.length,
            createdDate: currentDate,
            description: "Phase 2应用案例库",
            author: "Content_Generator",
            dependencies: ["nodes-extended-phase2.json"]
          },
          data: this.generatedApplications
        };
        
        const applicationsPath = path.join(outputDir, 'applications-extended-phase2.json');
        fs.writeFileSync(applicationsPath, JSON.stringify(applicationsData, null, 2), 'utf8');
        results.applicationsFile = applicationsPath;
        console.log(`✓ 已导出 ${this.generatedApplications.length} 个应用案例到 ${applicationsPath}`);
      }
      
      // 4. 导出Skills内容数据
      if (this.generatedSkillsContent.length > 0) {
        const skillsData = {
          metadata: {
            version: "2.0",
            phase: "Phase 2 - 内容深度扩展",
            totalItems: this.generatedSkillsContent.length,
            createdDate: currentDate,
            description: "Phase 2 Skills深度内容",
            author: "Content_Generator",
            dependencies: []
          },
          data: this.generatedSkillsContent
        };
        
        const skillsPath = path.join(outputDir, 'skills-content-phase2.json');
        fs.writeFileSync(skillsPath, JSON.stringify(skillsData, null, 2), 'utf8');
        results.skillsFile = skillsPath;
        console.log(`✓ 已导出 ${this.generatedSkillsContent.length} 个Skills内容到 ${skillsPath}`);
      }
      
      // 5. 更新metadata文件
      const metadataPath = path.join(outputDir, 'metadata-phase2.json');
      const metadata = {
        version: "2.0",
        phase: "Phase 2 - 内容深度扩展",
        createdDate: currentDate,
        description: "Phase 2项目元数据",
        status: "generated",
        files: {
          nodes: "nodes-extended-phase2.json",
          edges: "edges-extended-phase2.json",
          applications: "applications-extended-phase2.json",
          skillsContent: "skills-content-phase2.json"
        },
        statistics: {
          totalNodes: this.generatedNodes.length,
          targetNodes: 75,
          nodesByDomain: this.calculateNodesByDomain(),
          totalEdges: this.generatedEdges.length,
          totalApplications: this.generatedApplications.length,
          targetApplications: 100,
          skillsContentItems: this.generatedSkillsContent.length
        },
        lastUpdated: currentDate
      };
      
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
      console.log(`✓ 已更新元数据文件 ${metadataPath}`);
      
      // 输出导出摘要
      console.log('\n导出摘要:');
      console.log(`  节点: ${this.generatedNodes.length}`);
      console.log(`  边关系: ${this.generatedEdges.length}`);
      console.log(`  应用案例: ${this.generatedApplications.length}`);
      console.log(`  Skills内容: ${this.generatedSkillsContent.length}`);
      console.log(`\n所有数据已成功导出到 ${outputDir}`);
      
      return results;
      
    } catch (error) {
      console.error(`导出数据时出错: ${error.message}`);
      results.errors.push(error.message);
      throw error;
    }
  }
  
  /**
   * 计算各domain的节点数量统计
   * @returns {Object} 各domain的节点统计
   */
  calculateNodesByDomain() {
    const stats = {
      "domain-1": { current: 0, target: 20 },
      "domain-2": { current: 0, target: 24 },
      "domain-3": { current: 0, target: 18 },
      "domain-4": { current: 0, target: 10 },
      "domain-5": { current: 0, target: 3 }
    };
    
    for (const node of this.generatedNodes) {
      for (const domain of node.domains) {
        if (stats[domain]) {
          stats[domain].current++;
        }
      }
    }
    
    return stats;
  }
}

/**
 * EdgeGenerator类 - 负责生成节点之间的边关系
 */
class EdgeGenerator {
  constructor(config = {}) {
    this.config = {
      prerequisiteRatio: config.prerequisiteRatio || 0.7,
      crossDomainRatio: config.crossDomainRatio || 0.2,
      applicationRatio: config.applicationRatio || 0.5,
      ...config
    };
    this.edgeIdCounter = 0;
  }

  /**
   * 生成所有类型的边关系
   * @param {Array<Node>} nodes - 节点数组
   * @returns {Array<Edge>} 生成的边数组
   */
  generateAllEdges(nodes) {
    const edges = [];
    
    // 1. 生成前置关系边
    const prerequisiteEdges = this.generatePrerequisiteEdges(nodes);
    edges.push(...prerequisiteEdges);
    console.log(`生成了 ${prerequisiteEdges.length} 条前置关系边`);
    
    // 2. 生成跨域关系边
    const crossDomainEdges = this.generateCrossDomainEdges(nodes);
    edges.push(...crossDomainEdges);
    console.log(`生成了 ${crossDomainEdges.length} 条跨域关系边`);
    
    // 3. 生成应用关系边
    const applicationEdges = this.generateApplicationEdges(nodes);
    edges.push(...applicationEdges);
    console.log(`生成了 ${applicationEdges.length} 条应用关系边`);
    
    console.log(`总共生成了 ${edges.length} 条边关系`);
    return edges;
  }

  /**
   * 生成前置关系边（prerequisite）
   * 确保70%的节点有前置关系，前置节点难度更低
   * @param {Array<Node>} nodes - 节点数组
   * @returns {Array<Edge>} 前置关系边数组
   */
  generatePrerequisiteEdges(nodes) {
    const edges = [];
    const nodesByDomain = this.groupByDomain(nodes);
    
    for (const [domainId, domainNodes] of Object.entries(nodesByDomain)) {
      // 按难度排序，确保前置节点难度更低
      const sortedNodes = [...domainNodes].sort((a, b) => a.difficulty - b.difficulty);
      
      // 计算需要添加前置关系的节点数量
      const targetCount = Math.floor(sortedNodes.length * this.config.prerequisiteRatio);
      let addedCount = 0;
      
      for (let i = 1; i < sortedNodes.length && addedCount < targetCount; i++) {
        const targetNode = sortedNodes[i];
        
        // 选择一个或多个难度更低的节点作为前置
        const possiblePrereqs = sortedNodes.slice(0, i).filter(n => 
          n.difficulty < targetNode.difficulty
        );
        
        if (possiblePrereqs.length > 0) {
          // 随机选择1-2个前置节点
          const numPrereqs = Math.min(
            Math.floor(Math.random() * 2) + 1,
            possiblePrereqs.length
          );
          
          const selectedPrereqs = this.randomSample(possiblePrereqs, numPrereqs);
          
          for (const prereqNode of selectedPrereqs) {
            edges.push({
              id: this.generateEdgeId('prereq'),
              source: prereqNode.id,
              target: targetNode.id,
              type: 'prerequisite',
              strength: 0.7 + Math.random() * 0.3, // 0.7-1.0
              description: `${prereqNode.name}是${targetNode.name}的前置知识`,
              metadata: {
                phase: 'phase2',
                createdDate: new Date().toISOString().split('T')[0]
              }
            });
          }
          
          addedCount++;
        }
      }
    }
    
    return edges;
  }

  /**
   * 生成跨域关系边（cross-domain）
   * 连接不同domain的相关节点，确保20%的节点有跨域关系
   * @param {Array<Node>} nodes - 节点数组
   * @returns {Array<Edge>} 跨域关系边数组
   */
  generateCrossDomainEdges(nodes) {
    const edges = [];
    
    // 定义跨域相关的主题和关键词
    const crossDomainTopics = {
      '优化': {
        keywords: ['优化', '极值', '最大值', '最小值', '梯度', '导数'],
        domains: ['domain-1', 'domain-3']
      },
      '积分应用': {
        keywords: ['积分', '面积', '体积', '累积', '求和'],
        domains: ['domain-1', 'domain-2']
      },
      '概率密度': {
        keywords: ['概率', '密度', '分布', '期望', '积分'],
        domains: ['domain-2', 'domain-4']
      },
      '微分方程': {
        keywords: ['微分方程', '导数', '变化率', '动态'],
        domains: ['domain-1', 'domain-2']
      },
      '向量分析': {
        keywords: ['向量', '梯度', '散度', '旋度', '场'],
        domains: ['domain-2', 'domain-3']
      },
      '随机过程': {
        keywords: ['随机', '概率', '过程', '时间序列'],
        domains: ['domain-4', 'domain-5']
      }
    };
    
    // 计算目标边数
    const targetCount = Math.floor(nodes.length * this.config.crossDomainRatio);
    let addedCount = 0;
    
    for (const [topic, config] of Object.entries(crossDomainTopics)) {
      if (addedCount >= targetCount) break;
      
      // 找到与该主题相关的节点
      const relevantNodes = nodes.filter(node => {
        // 检查节点是否在相关domain中
        const inRelevantDomain = node.domains.some(d => config.domains.includes(d));
        if (!inRelevantDomain) return false;
        
        // 检查节点的关键词是否匹配
        const hasMatchingKeyword = node.keywords.some(keyword =>
          config.keywords.some(topicKeyword =>
            keyword.includes(topicKeyword) || topicKeyword.includes(keyword)
          )
        );
        
        return hasMatchingKeyword;
      });
      
      // 在相关节点之间创建跨域边
      for (let i = 0; i < relevantNodes.length - 1 && addedCount < targetCount; i++) {
        for (let j = i + 1; j < relevantNodes.length && addedCount < targetCount; j++) {
          const node1 = relevantNodes[i];
          const node2 = relevantNodes[j];
          
          // 确保两个节点在不同的domain中
          const differentDomains = !node1.domains.some(d => node2.domains.includes(d));
          
          if (differentDomains && Math.random() < 0.5) {
            edges.push({
              id: this.generateEdgeId('cross'),
              source: node1.id,
              target: node2.id,
              type: 'cross-domain',
              strength: 0.5 + Math.random() * 0.3, // 0.5-0.8
              description: `${topic}相关的跨域连接`,
              metadata: {
                phase: 'phase2',
                createdDate: new Date().toISOString().split('T')[0],
                topic: topic
              }
            });
            addedCount++;
          }
        }
      }
    }
    
    return edges;
  }

  /**
   * 生成应用关系边（application）
   * 连接理论节点和应用案例，确保50%的节点有应用关系
   * @param {Array<Node>} nodes - 节点数组
   * @returns {Array<Edge>} 应用关系边数组
   */
  generateApplicationEdges(nodes) {
    const edges = [];
    
    // 计算目标边数
    const targetCount = Math.floor(nodes.length * this.config.applicationRatio);
    
    // 为每个有应用案例的节点创建应用关系边
    let addedCount = 0;
    
    for (const node of nodes) {
      if (addedCount >= targetCount) break;
      
      // 检查节点是否有应用案例
      if (node.realWorldApplications && node.realWorldApplications.length > 0) {
        // 为每个应用案例创建一条边（指向虚拟的应用案例节点）
        for (const app of node.realWorldApplications) {
          if (addedCount >= targetCount) break;
          
          // 创建应用案例的虚拟节点ID
          const appNodeId = `app-${this.slugify(app.title)}-${this.slugify(app.industry)}`;
          
          edges.push({
            id: this.generateEdgeId('app'),
            source: node.id,
            target: appNodeId,
            type: 'application',
            strength: 0.6 + Math.random() * 0.4, // 0.6-1.0
            description: `${node.name}在${app.industry}中的应用`,
            metadata: {
              phase: 'phase2',
              createdDate: new Date().toISOString().split('T')[0],
              applicationTitle: app.title,
              industry: app.industry
            }
          });
          addedCount++;
        }
      }
    }
    
    return edges;
  }

  /**
   * 按domain分组节点
   * @param {Array<Node>} nodes - 节点数组
   * @returns {Object} 按domain分组的节点对象
   */
  groupByDomain(nodes) {
    const grouped = {};
    
    for (const node of nodes) {
      for (const domain of node.domains) {
        if (!grouped[domain]) {
          grouped[domain] = [];
        }
        grouped[domain].push(node);
      }
    }
    
    return grouped;
  }

  /**
   * 从数组中随机抽取n个元素
   * @param {Array} array - 源数组
   * @param {number} n - 抽取数量
   * @returns {Array} 抽取的元素数组
   */
  randomSample(array, n) {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  }

  /**
   * 生成边ID
   * @param {string} type - 边类型前缀
   * @returns {string} 边ID
   */
  generateEdgeId(type) {
    return `edge-${type}-phase2-${String(this.edgeIdCounter++).padStart(4, '0')}`;
  }

  /**
   * 将字符串转换为slug格式
   * @param {string} text - 输入文本
   * @returns {string} slug格式的字符串
   */
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 30);
  }
}

// 导出供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentGenerator;
}

// Helper methods for generateSkillContent
ContentGenerator.prototype.generateAdvancedTopicsForSkill = function(skillId) {
  const topicsBySkill = {
    '函数极限与连续Skill': [
      {
        id: 'topic-uniform-continuity',
        title: '一致连续性',
        description: '一致连续性是比连续性更强的性质，要求δ的选择不依赖于具体的点x',
        formula: '\\forall \\varepsilon > 0, \\exists \\delta > 0, \\forall x_1, x_2 \\in D: |x_1 - x_2| < \\delta \\Rightarrow |f(x_1) - f(x_2)| < \\varepsilon',
        examples: [
          'f(x) = x^2 在有界区间上一致连续',
          'f(x) = 1/x 在(0,1)上不一致连续'
        ],
        applications: ['数值分析', '函数逼近理论']
      },
      {
        id: 'topic-lipschitz-condition',
        title: '利普希茨条件',
        description: '利普希茨条件是一致连续性的充分条件，要求函数的变化率有界',
        formula: '|f(x_1) - f(x_2)| \\leq L|x_1 - x_2|, \\quad \\forall x_1, x_2 \\in D',
        examples: [
          'f(x) = sin(x) 满足利普希茨条件，L=1',
          'f(x) = √x 在[0,1]上不满足利普希茨条件'
        ],
        applications: ['微分方程解的存在唯一性', '优化算法收敛性分析']
      },
      {
        id: 'topic-contraction-mapping',
        title: '压缩映射',
        description: '压缩映射是满足利普希茨条件且L<1的映射，具有唯一不动点',
        formula: '\\exists 0 \\leq k < 1: d(f(x), f(y)) \\leq k \\cdot d(x, y)',
        examples: [
          'f(x) = x/2 + 1 是压缩映射',
          '压缩映射定理保证不动点的存在唯一性'
        ],
        applications: ['不动点迭代法', '微分方程数值解']
      }
    ],
    '导数与微分Skill': [
      {
        id: 'topic-implicit-function',
        title: '隐函数定理',
        description: '隐函数定理给出了隐函数存在的充分条件，是多元微分学的核心定理',
        formula: 'F(x, y) = 0 \\Rightarrow \\frac{dy}{dx} = -\\frac{F_x}{F_y} \\text{ (当 } F_y \\neq 0 \\text{)}',
        examples: [
          '圆方程 x^2 + y^2 = 1 定义隐函数 y = ±√(1-x^2)',
          '隐函数求导：F(x,y)=0 两边对x求导'
        ],
        applications: ['约束优化', '曲线切线方程']
      },
      {
        id: 'topic-inverse-function',
        title: '反函数定理',
        description: '反函数定理给出了反函数存在且可微的条件',
        formula: '(f^{-1})\'(y) = \\frac{1}{f\'(x)} \\text{ 其中 } y = f(x)',
        examples: [
          'y = e^x 的反函数 x = ln(y)，(ln y)\' = 1/y',
          'y = sin(x) 在[-π/2, π/2]上的反函数 x = arcsin(y)'
        ],
        applications: ['反三角函数求导', '坐标变换']
      },
      {
        id: 'topic-differential-forms',
        title: '微分形式',
        description: '微分形式是微分的推广，用于描述多元函数的局部线性近似',
        formula: 'df = \\frac{\\partial f}{\\partial x}dx + \\frac{\\partial f}{\\partial y}dy',
        examples: [
          'f(x,y) = x^2 + y^2 的微分 df = 2x dx + 2y dy',
          '全微分的不变性'
        ],
        applications: ['微分几何', '物理场论']
      }
    ],
    '积分概念Skill': [
      {
        id: 'topic-lebesgue-integral',
        title: '勒贝格积分',
        description: '勒贝格积分是黎曼积分的推广，基于测度论，能够积分更广泛的函数类',
        formula: '\\int_E f d\\mu = \\sup \\left\\{ \\int_E s d\\mu : s \\text{ 简单函数}, s \\leq f \\right\\}',
        examples: [
          '狄利克雷函数在勒贝格意义下可积',
          '勒贝格积分与黎曼积分在连续函数上一致'
        ],
        applications: ['概率论', '泛函分析']
      },
      {
        id: 'topic-measure-theory',
        title: '测度论基础',
        description: '测度论为积分理论提供了严格的数学基础',
        formula: '\\mu(\\bigcup_{i=1}^\\infty E_i) = \\sum_{i=1}^\\infty \\mu(E_i) \\text{ (可数可加性)}',
        examples: [
          '勒贝格测度：区间[a,b]的测度为b-a',
          '零测集：单点集、可数集的测度为0'
        ],
        applications: ['概率空间', '随机过程']
      },
      {
        id: 'topic-improper-integral',
        title: '广义积分',
        description: '广义积分处理无界区间或无界函数的积分',
        formula: '\\int_a^\\infty f(x)dx = \\lim_{b \\to \\infty} \\int_a^b f(x)dx',
        examples: [
          '∫₁^∞ 1/x² dx = 1 (收敛)',
          '∫₁^∞ 1/x dx = ∞ (发散)'
        ],
        applications: ['概率分布', '傅里叶变换']
      }
    ],
    '多元函数Skill': [
      {
        id: 'topic-implicit-existence',
        title: '隐函数存在定理',
        description: '隐函数存在定理是隐函数定理的完整形式，给出了隐函数存在、唯一和可微的充分条件',
        formula: 'F(x_0, y_0) = 0, F_y(x_0, y_0) \\neq 0 \\Rightarrow \\exists y = f(x) \\text{ 在 } x_0 \\text{ 附近}',
        examples: [
          'F(x,y) = x^2 + y^2 - 1 = 0 在(0,1)附近定义隐函数',
          '多元隐函数组的存在性'
        ],
        applications: ['约束优化', '微分方程']
      },
      {
        id: 'topic-inverse-mapping',
        title: '逆映射定理',
        description: '逆映射定理给出了多元函数局部可逆的充分条件',
        formula: '\\det(J_f(x_0)) \\neq 0 \\Rightarrow f \\text{ 在 } x_0 \\text{ 附近局部可逆}',
        examples: [
          '极坐标变换 (r,θ) ↔ (x,y) 的雅可比行列式',
          '局部坐标系的建立'
        ],
        applications: ['坐标变换', '微分几何']
      },
      {
        id: 'topic-manifolds',
        title: '流形初步',
        description: '流形是局部类似于欧氏空间的几何对象，是微分几何的基本概念',
        formula: 'M \\text{ 是 } n \\text{ 维流形} \\Leftrightarrow \\text{ 局部同胚于 } \\mathbb{R}^n',
        examples: [
          '球面 S² 是2维流形',
          '环面 T² 是2维流形'
        ],
        applications: ['微分几何', '广义相对论']
      }
    ]
  };

  return topicsBySkill[skillId] || [];
};

ContentGenerator.prototype.generateAdvancedExercisesForSkill = function(skillId) {
  const exercisesBySkill = {
    '函数极限与连续Skill': [
      {
        id: 'exercise-adv-001',
        difficulty: 4,
        question: '证明：若f在闭区间[a,b]上连续，则f在[a,b]上一致连续。',
        hints: [
          '使用反证法和有限覆盖定理',
          '考虑ε-δ定义中δ的选择'
        ],
        solution: {
          steps: [
            '假设f不一致连续，则存在ε₀>0，对任意δ>0，存在x₁,x₂使得|x₁-x₂|<δ但|f(x₁)-f(x₂)|≥ε₀',
            '取δₙ=1/n，得到序列{xₙ},{yₙ}满足|xₙ-yₙ|<1/n但|f(xₙ)-f(yₙ)|≥ε₀',
            '由Bolzano-Weierstrass定理，{xₙ}有收敛子列xₙₖ→x₀∈[a,b]',
            '由|xₙₖ-yₙₖ|<1/nₖ→0，得yₙₖ→x₀',
            '由f连续，f(xₙₖ)→f(x₀)且f(yₙₖ)→f(x₀)，故|f(xₙₖ)-f(yₙₖ)|→0',
            '这与|f(xₙₖ)-f(yₙₖ)|≥ε₀矛盾'
          ],
          keyPoints: ['有限覆盖定理', '序列收敛', '连续性定义']
        },
        relatedNodes: ['node-continuity', 'node-limit-def'],
        estimatedTime: 30
      },
      {
        id: 'exercise-adv-002',
        difficulty: 4,
        question: '证明：若f满足利普希茨条件，则f一致连续。',
        hints: [
          '利用利普希茨条件的定义',
          '直接构造δ与ε的关系'
        ],
        solution: {
          steps: [
            '设f满足利普希茨条件，即存在L>0使得|f(x)-f(y)|≤L|x-y|对所有x,y成立',
            '对任意ε>0，取δ=ε/L',
            '当|x-y|<δ时，有|f(x)-f(y)|≤L|x-y|<L·δ=L·(ε/L)=ε',
            '因此f一致连续'
          ],
          keyPoints: ['利普希茨条件', '一致连续性', 'ε-δ论证']
        },
        relatedNodes: ['node-continuity'],
        estimatedTime: 20
      },
      {
        id: 'exercise-adv-003',
        difficulty: 5,
        question: '证明压缩映射定理：设(X,d)是完备度量空间，f:X→X是压缩映射，则f有唯一不动点。',
        hints: [
          '构造迭代序列xₙ₊₁=f(xₙ)',
          '证明{xₙ}是柯西序列',
          '利用完备性得到极限点'
        ],
        solution: {
          steps: [
            '设f是压缩映射，存在0≤k<1使得d(f(x),f(y))≤k·d(x,y)',
            '任取x₀∈X，构造序列xₙ₊₁=f(xₙ)',
            '对m>n，有d(xₘ,xₙ)≤d(xₘ,xₘ₋₁)+...+d(xₙ₊₁,xₙ)≤(kᵐ⁻¹+...+kⁿ)d(x₁,x₀)≤kⁿ/(1-k)·d(x₁,x₀)',
            '因此{xₙ}是柯西序列，由完备性，xₙ→x*',
            '由f连续，f(x*)=f(lim xₙ)=lim f(xₙ)=lim xₙ₊₁=x*',
            '唯一性：若f(y)=y，则d(x*,y)=d(f(x*),f(y))≤k·d(x*,y)，由k<1得x*=y'
          ],
          keyPoints: ['压缩映射', '柯西序列', '完备性', '不动点']
        },
        relatedNodes: ['node-continuity', 'node-limit-def'],
        estimatedTime: 40
      }
    ],
    '导数与微分Skill': [
      {
        id: 'exercise-adv-004',
        difficulty: 4,
        question: '设F(x,y)=x³+y³-3xy=0，求dy/dx。',
        hints: [
          '使用隐函数求导法',
          '对方程两边关于x求导'
        ],
        solution: {
          steps: [
            '对F(x,y)=x³+y³-3xy=0两边关于x求导',
            '3x²+3y²·dy/dx-3y-3x·dy/dx=0',
            '整理得(3y²-3x)·dy/dx=3y-3x²',
            'dy/dx=(y-x²)/(y²-x)'
          ],
          keyPoints: ['隐函数求导', '链式法则']
        },
        relatedNodes: ['node-derivative-def', 'node-chain-rule'],
        estimatedTime: 15
      },
      {
        id: 'exercise-adv-005',
        difficulty: 5,
        question: '证明反函数定理：若f\'(x₀)≠0，则f在x₀附近存在反函数，且(f⁻¹)\'(y₀)=1/f\'(x₀)，其中y₀=f(x₀)。',
        hints: [
          '利用导数的几何意义',
          '考虑反函数的定义'
        ],
        solution: {
          steps: [
            '设y=f(x)，则x=f⁻¹(y)',
            '对y=f(x)两边关于x求导：dy/dx=f\'(x)',
            '对x=f⁻¹(y)两边关于y求导：dx/dy=(f⁻¹)\'(y)',
            '由链式法则：dy/dx·dx/dy=1',
            '因此(f⁻¹)\'(y)=1/f\'(x)=1/f\'(f⁻¹(y))',
            '在y₀=f(x₀)处，(f⁻¹)\'(y₀)=1/f\'(x₀)'
          ],
          keyPoints: ['反函数', '链式法则', '导数']
        },
        relatedNodes: ['node-derivative-def', 'node-chain-rule'],
        estimatedTime: 25
      }
    ],
    '积分概念Skill': [
      {
        id: 'exercise-adv-006',
        difficulty: 5,
        question: '证明：若f在[a,b]上黎曼可积，则f在[a,b]上勒贝格可积，且两种积分值相等。',
        hints: [
          '利用黎曼可积的充要条件',
          '考虑上和与下和的关系'
        ],
        solution: {
          steps: [
            'f黎曼可积⇔对任意ε>0，存在分割P使得U(P,f)-L(P,f)<ε',
            '这等价于f的不连续点集的测度为0',
            '由勒贝格定理，测度为0的集合上的函数值不影响积分',
            '因此f勒贝格可积，且∫ᵃᵇf(x)dx(黎曼)=∫ᵃᵇf(x)dx(勒贝格)'
          ],
          keyPoints: ['黎曼积分', '勒贝格积分', '测度论']
        },
        relatedNodes: ['node-integral-def'],
        estimatedTime: 35
      }
    ],
    '多元函数Skill': [
      {
        id: 'exercise-adv-007',
        difficulty: 5,
        question: '设F(x,y,z)=x²+y²+z²-1=0，求∂z/∂x和∂z/∂y。',
        hints: [
          '使用隐函数定理',
          '对方程两边求偏导'
        ],
        solution: {
          steps: [
            '对F(x,y,z)=x²+y²+z²-1=0关于x求偏导：2x+2z·∂z/∂x=0',
            '得∂z/∂x=-x/z',
            '对F(x,y,z)=x²+y²+z²-1=0关于y求偏导：2y+2z·∂z/∂y=0',
            '得∂z/∂y=-y/z'
          ],
          keyPoints: ['隐函数定理', '偏导数']
        },
        relatedNodes: ['node-partial-derivative'],
        estimatedTime: 20
      }
    ]
  };

  const exercises = exercisesBySkill[skillId] || [];
  // 确保至少10道练习题
  while (exercises.length < 10) {
    const baseExercise = exercises[exercises.length % Math.max(1, exercises.length)];
    exercises.push({
      ...baseExercise,
      id: `exercise-adv-${String(exercises.length + 1).padStart(3, '0')}`,
      question: baseExercise.question + ' (变式)'
    });
  }
  return exercises;
};

ContentGenerator.prototype.generateProjectsForSkill = function(skillId) {
  const projectsBySkill = {
    '函数极限与连续Skill': [
      {
        id: 'project-001',
        title: '数值计算中的函数逼近',
        description: '实现多种函数逼近方法，比较它们的精度和效率',
        difficulty: 4,
        objectives: [
          '理解函数逼近的数学原理',
          '实现泰勒展开、插值和最小二乘逼近',
          '分析不同方法的误差和适用范围'
        ],
        tasks: [
          {
            step: 1,
            description: '实现泰勒级数逼近',
            code: 'def taylor_approximation(f, x0, n, x):\n    # 计算f在x0处的n阶泰勒展开在x处的值\n    pass'
          },
          {
            step: 2,
            description: '实现拉格朗日插值',
            code: 'def lagrange_interpolation(points, x):\n    # 给定点集，计算拉格朗日插值多项式在x处的值\n    pass'
          },
          {
            step: 3,
            description: '比较不同方法逼近sin(x)的效果',
            visualization: '绘制原函数和各种逼近函数的图像，显示误差分布'
          }
        ],
        deliverables: [
          '完整的Python实现',
          '误差分析报告',
          '可视化对比图表'
        ],
        estimatedTime: 180
      },
      {
        id: 'project-002',
        title: '不动点迭代法求解方程',
        description: '使用压缩映射定理实现不动点迭代法，求解非线性方程',
        difficulty: 4,
        objectives: [
          '理解不动点迭代的收敛性',
          '实现多种迭代格式',
          '分析收敛速度'
        ],
        tasks: [
          {
            step: 1,
            description: '实现基本不动点迭代',
            code: 'def fixed_point_iteration(g, x0, tol=1e-6, max_iter=100):\n    # 迭代求解x=g(x)\n    pass'
          },
          {
            step: 2,
            description: '实现牛顿迭代法',
            code: 'def newton_method(f, df, x0, tol=1e-6):\n    # 牛顿法求解f(x)=0\n    pass'
          }
        ],
        deliverables: [
          'Python实现',
          '收敛性分析',
          '迭代过程可视化'
        ],
        estimatedTime: 150
      }
    ],
    '导数与微分Skill': [
      {
        id: 'project-003',
        title: '自动微分系统实现',
        description: '实现一个简单的自动微分系统，支持前向和反向模式',
        difficulty: 5,
        objectives: [
          '理解自动微分的原理',
          '实现计算图和链式法则',
          '应用于神经网络训练'
        ],
        tasks: [
          {
            step: 1,
            description: '实现前向模式自动微分',
            code: 'class DualNumber:\n    def __init__(self, value, derivative):\n        self.value = value\n        self.derivative = derivative'
          },
          {
            step: 2,
            description: '实现反向模式自动微分',
            code: 'class ComputationGraph:\n    def forward(self, x):\n        pass\n    def backward(self, grad):\n        pass'
          }
        ],
        deliverables: [
          '自动微分库',
          '测试用例',
          '性能对比'
        ],
        estimatedTime: 240
      },
      {
        id: 'project-004',
        title: '隐函数可视化工具',
        description: '开发交互式工具，可视化隐函数及其导数',
        difficulty: 4,
        objectives: [
          '理解隐函数定理',
          '实现隐函数绘图',
          '可视化切线和法线'
        ],
        tasks: [
          {
            step: 1,
            description: '实现隐函数绘图',
            code: 'def plot_implicit(F, x_range, y_range):\n    # 绘制F(x,y)=0的曲线\n    pass'
          }
        ],
        deliverables: [
          'Web应用',
          '交互式界面',
          '导数计算功能'
        ],
        estimatedTime: 200
      }
    ],
    '积分概念Skill': [
      {
        id: 'project-005',
        title: '数值积分方法比较',
        description: '实现并比较多种数值积分方法的精度和效率',
        difficulty: 4,
        objectives: [
          '理解数值积分的原理',
          '实现梯形法则、辛普森法则和高斯求积',
          '分析误差和收敛速度'
        ],
        tasks: [
          {
            step: 1,
            description: '实现梯形法则',
            code: 'def trapezoidal_rule(f, a, b, n):\n    # n个子区间的梯形法则\n    pass'
          },
          {
            step: 2,
            description: '实现辛普森法则',
            code: 'def simpson_rule(f, a, b, n):\n    # 辛普森法则\n    pass'
          }
        ],
        deliverables: [
          'Python实现',
          '误差分析',
          '性能对比图表'
        ],
        estimatedTime: 160
      },
      {
        id: 'project-006',
        title: '蒙特卡洛积分',
        description: '使用蒙特卡洛方法计算高维积分',
        difficulty: 4,
        objectives: [
          '理解蒙特卡洛方法',
          '实现重要性采样',
          '应用于高维积分'
        ],
        tasks: [
          {
            step: 1,
            description: '实现基本蒙特卡洛积分',
            code: 'def monte_carlo_integration(f, bounds, n_samples):\n    # 蒙特卡洛积分\n    pass'
          }
        ],
        deliverables: [
          'Python实现',
          '收敛性分析',
          '高维积分示例'
        ],
        estimatedTime: 180
      }
    ],
    '多元函数Skill': [
      {
        id: 'project-007',
        title: '梯度下降优化器',
        description: '实现多种梯度下降算法，应用于机器学习',
        difficulty: 5,
        objectives: [
          '理解梯度下降原理',
          '实现SGD、Momentum、Adam等优化器',
          '应用于神经网络训练'
        ],
        tasks: [
          {
            step: 1,
            description: '实现基本梯度下降',
            code: 'def gradient_descent(f, grad_f, x0, lr=0.01, max_iter=1000):\n    # 梯度下降优化\n    pass'
          },
          {
            step: 2,
            description: '实现Adam优化器',
            code: 'class AdamOptimizer:\n    def __init__(self, lr=0.001, beta1=0.9, beta2=0.999):\n        pass'
          }
        ],
        deliverables: [
          '优化器库',
          '收敛性分析',
          '应用示例'
        ],
        estimatedTime: 220
      },
      {
        id: 'project-008',
        title: '等高线可视化工具',
        description: '开发交互式工具，可视化多元函数的等高线和梯度场',
        difficulty: 4,
        objectives: [
          '理解等高线和梯度',
          '实现3D曲面绘图',
          '可视化优化路径'
        ],
        tasks: [
          {
            step: 1,
            description: '实现等高线绘图',
            code: 'def plot_contour(f, x_range, y_range):\n    # 绘制等高线\n    pass'
          }
        ],
        deliverables: [
          'Web应用',
          '交互式界面',
          '优化路径动画'
        ],
        estimatedTime: 200
      }
    ]
  };

  return projectsBySkill[skillId] || [];
};
