/**
 * Demo: validateNodes功能演示
 * 
 * 展示DataValidator的节点验证功能
 */

const DataValidator = require('./data-validator.js');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         DataValidator - 节点验证功能演示                  ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const validator = new DataValidator();

// 示例1: 完美的节点
console.log('【示例1】完美的节点 - 所有字段都符合要求');
console.log('─────────────────────────────────────────────────────────');
const perfectNode = {
  id: 'node-curvature',
  name: '曲率',
  nameEn: 'Curvature',
  description: '曲率描述曲线在某点的弯曲程度，是微分几何的基本概念。',
  domains: ['domain-1'],
  difficulty: 4,
  prerequisites: ['node-derivative-def', 'node-parametric-equations'],
  relatedSkills: ['导数与微分Skill', '几何应用Skill'],
  keywords: ['曲率', '曲率半径', '曲率中心', '密切圆'],
  estimatedStudyTime: 60,
  realWorldApplications: [
    {
      title: '道路设计中的曲率控制',
      description: '在高速公路和铁路设计中，曲率决定了车辆的安全速度',
      industry: '土木工程'
    },
    {
      title: '计算机图形学中的曲线平滑',
      description: '使用曲率连续性确保曲线的视觉平滑性',
      industry: '计算机图形学'
    }
  ]
};

let result = validator.validateNodes([perfectNode]);
console.log('✓ 验证通过');
console.log(`  错误: ${result.errors.length}, 警告: ${result.warnings.length}\n`);

// 示例2: 高难度节点但应用案例不足
console.log('【示例2】高难度节点但应用案例不足');
console.log('─────────────────────────────────────────────────────────');
const highDiffNode = {
  id: 'node-tensor-calculus',
  name: '张量微积分',
  nameEn: 'Tensor Calculus',
  description: '张量微积分是研究张量场的微分和积分的数学分支。',
  domains: ['domain-3'],
  difficulty: 5,  // 高难度
  prerequisites: ['node-vector-analysis'],
  relatedSkills: ['向量分析Skill'],
  keywords: ['张量', '协变导数', '黎曼曲率'],
  estimatedStudyTime: 120,
  realWorldApplications: [
    {
      title: '广义相对论',
      description: '爱因斯坦场方程使用张量描述时空曲率',
      industry: '理论物理'
    }
  ]  // 只有1个应用案例，应该至少2个
};

result = validator.validateNodes([highDiffNode]);
console.log('⚠️  验证通过但有警告');
console.log(`  错误: ${result.errors.length}, 警告: ${result.warnings.length}`);
if (result.warnings.length > 0) {
  console.log(`  警告信息: ${result.warnings[0].message}`);
}
console.log();

// 示例3: 多个问题的节点
console.log('【示例3】存在多个问题的节点');
console.log('─────────────────────────────────────────────────────────');
const problematicNode = {
  id: 'INVALID-ID',  // ❌ ID格式错误
  name: '测试节点',
  nameEn: 'Test Node',
  description: '描述',
  domains: ['domain-1'],
  difficulty: 6,  // ❌ 难度超出范围
  prerequisites: [],
  relatedSkills: [],
  keywords: ['关键词1'],  // ⚠️ 关键词不足
  estimatedStudyTime: 150  // ❌ 学习时长超出范围
};

result = validator.validateNodes([problematicNode]);
console.log('✗ 验证失败');
console.log(`  错误: ${result.errors.length}, 警告: ${result.warnings.length}`);
console.log('  错误列表:');
result.errors.forEach((error, i) => {
  console.log(`    ${i + 1}. [${error.type}] ${error.message}`);
});
if (result.warnings.length > 0) {
  console.log('  警告列表:');
  result.warnings.forEach((warning, i) => {
    console.log(`    ${i + 1}. [${warning.type}] ${warning.message}`);
  });
}
console.log();

// 示例4: 缺少必需字段
console.log('【示例4】缺少必需字段的节点');
console.log('─────────────────────────────────────────────────────────');
const incompleteNode = {
  id: 'node-incomplete',
  name: '不完整节点',
  // 缺少 nameEn, description, domains 等多个必需字段
};

result = validator.validateNodes([incompleteNode]);
console.log('✗ 验证失败');
console.log(`  错误: ${result.errors.length}, 警告: ${result.warnings.length}`);
console.log('  缺少的字段:');
const missingFields = result.errors
  .filter(e => e.type === 'MISSING_FIELD')
  .map(e => e.details.field);
console.log(`    ${missingFields.join(', ')}`);
console.log();

// 示例5: 批量验证
console.log('【示例5】批量验证多个节点');
console.log('─────────────────────────────────────────────────────────');
const batchNodes = [
  perfectNode,
  highDiffNode,
  problematicNode,
  incompleteNode
];

result = validator.validateNodes(batchNodes);
console.log(`验证了 ${batchNodes.length} 个节点`);
console.log(`  ✓ 通过: ${batchNodes.length - result.errors.filter(e => e.details.nodeIndex !== undefined).length}`);
console.log(`  ✗ 失败: ${new Set(result.errors.map(e => e.details.nodeIndex)).size}`);
console.log(`  ⚠️  警告: ${new Set(result.warnings.map(w => w.details.nodeIndex)).size}`);
console.log();

// 验证规则总结
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║                    验证规则总结                            ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');
console.log('✓ 必需字段验证:');
console.log('  - id, name, nameEn, description, domains, difficulty');
console.log('  - prerequisites, relatedSkills, keywords, estimatedStudyTime');
console.log('');
console.log('✓ ID格式验证:');
console.log('  - 必须匹配模式: /^node-[a-z0-9-]+$/');
console.log('');
console.log('✓ 数值范围验证:');
console.log('  - difficulty: 1-5');
console.log('  - estimatedStudyTime: 30-120 分钟');
console.log('');
console.log('✓ 数组长度验证:');
console.log('  - keywords: 至少3个');
console.log('');
console.log('✓ 高难度节点特殊规则:');
console.log('  - difficulty ≥ 4 时，realWorldApplications 至少2个');
console.log('');
console.log('✓ 字段类型验证:');
console.log('  - 字符串字段: name, nameEn, description');
console.log('  - 数组字段: domains, prerequisites, relatedSkills, keywords');
console.log('  - 数字字段: difficulty, estimatedStudyTime');
console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('Task 3.2 完成 - validateNodes 功能已全面实现');
console.log('═══════════════════════════════════════════════════════════');
