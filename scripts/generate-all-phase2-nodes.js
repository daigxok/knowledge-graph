/**
 * 生成Phase 2的所有75个节点
 * Domain-1: 20个, Domain-2: 24个, Domain-3: 18个, Domain-4: 10个, Domain-5: 3个
 */

const fs = require('fs');
const ContentGenerator = require('./content-generator.js');

// 创建生成器实例
const generator = new ContentGenerator();

console.log('开始生成Phase 2的75个节点...\n');

// 定义各domain的主题
const domainTopics = {
  'domain-1': [
    '曲率', '函数作图', '不等式证明', '泰勒展开应用', '渐近线分析',
    '凹凸性判断', '拐点分析', '极值问题', '最值定理', '中值定理应用',
    '高阶导数', '隐函数求导', '参数方程求导', '极坐标求导', '微分中值定理',
    '洛必达法则', '导数应用', '函数单调性', '函数极值', '曲线的性质'
  ],
  'domain-2': [
    '曲线积分', '曲面积分', '场论', '格林公式', '高斯公式',
    '斯托克斯公式', '散度定理', '旋度', '梯度场', '保守场',
    '一阶微分方程', '二阶微分方程', '高阶微分方程', '微分方程组', '边值问题',
    '特征值问题', '偏微分方程', '热传导方程', '波动方程', '拉普拉斯方程',
    '级数应用', '傅里叶级数', '幂级数应用', '泰勒级数应用'
  ],
  'domain-3': [
    '向量分析', '向量场', '散度', '旋度', '梯度',
    '张量基础', '张量运算', '变分法', '泛函', '欧拉-拉格朗日方程',
    '最优控制', '哈密顿系统', '数值优化', '梯度下降', '牛顿法优化',
    '拟牛顿法', '共轭梯度法', '约束优化'
  ],
  'domain-4': [
    '概率论基础', '随机变量', '概率分布', '正态分布', '泊松分布',
    '数理统计', '参数估计', '假设检验', '随机过程', '马尔可夫链'
  ],
  'domain-5': [
    '人工智能应用', '金融工程应用', '物理建模应用'
  ]
};

// 生成各domain的节点
const allNodes = [];

// Domain-1: 20个节点
console.log('生成Domain-1节点（20个）...');
const domain1Nodes = generator.generateNodes('domain-1', 20, {
  topics: domainTopics['domain-1'],
  difficulty: [3, 5],
  estimatedStudyTime: [45, 90],
  advanced: true
});
allNodes.push(...domain1Nodes);
console.log(`✓ Domain-1: ${domain1Nodes.length}个节点\n`);

// Domain-2: 24个节点
console.log('生成Domain-2节点（24个）...');
const domain2Nodes = generator.generateNodes('domain-2', 24, {
  topics: domainTopics['domain-2'],
  difficulty: [3, 5],
  estimatedStudyTime: [60, 120],
  advanced: true
});
allNodes.push(...domain2Nodes);
console.log(`✓ Domain-2: ${domain2Nodes.length}个节点\n`);

// Domain-3: 18个节点
console.log('生成Domain-3节点（18个）...');
const domain3Nodes = generator.generateNodes('domain-3', 18, {
  topics: domainTopics['domain-3'],
  difficulty: [3, 5],
  estimatedStudyTime: [60, 120],
  advanced: true
});
allNodes.push(...domain3Nodes);
console.log(`✓ Domain-3: ${domain3Nodes.length}个节点\n`);

// Domain-4: 10个节点
console.log('生成Domain-4节点（10个）...');
const domain4Nodes = generator.generateNodes('domain-4', 10, {
  topics: domainTopics['domain-4'],
  difficulty: [3, 5],
  estimatedStudyTime: [60, 120],
  advanced: true
});
allNodes.push(...domain4Nodes);
console.log(`✓ Domain-4: ${domain4Nodes.length}个节点\n`);

// Domain-5: 3个节点
console.log('生成Domain-5节点（3个）...');
const domain5Nodes = generator.generateNodes('domain-5', 3, {
  topics: domainTopics['domain-5'],
  difficulty: [4, 5],
  estimatedStudyTime: [90, 150],
  advanced: true
});
allNodes.push(...domain5Nodes);
console.log(`✓ Domain-5: ${domain5Nodes.length}个节点\n`);

// 统计
console.log('='.repeat(60));
console.log('生成完成！');
console.log(`总节点数: ${allNodes.length}`);
console.log(`  Domain-1: ${domain1Nodes.length}`);
console.log(`  Domain-2: ${domain2Nodes.length}`);
console.log(`  Domain-3: ${domain3Nodes.length}`);
console.log(`  Domain-4: ${domain4Nodes.length}`);
console.log(`  Domain-5: ${domain5Nodes.length}`);
console.log('='.repeat(60));

// 保存到文件
const output = {
  metadata: {
    version: '2.0',
    phase: 'Phase 2 - 内容深度扩展',
    totalItems: allNodes.length,
    createdDate: new Date().toISOString().split('T')[0],
    description: 'Phase 2新增的75个高级节点',
    author: 'Content_Generator',
    dependencies: ['nodes-extended-phase1.json']
  },
  data: allNodes
};

fs.writeFileSync('data/nodes-extended-phase2.json', JSON.stringify(output, null, 2));
console.log('\n✓ 已保存到 data/nodes-extended-phase2.json');
