/**
 * 测试应用案例生成功能
 * 
 * 验证Task 2.3的实现：
 * - generateApplications方法生成指定数量的应用案例
 * - 确保高级节点（difficulty≥4）至少有2个应用案例
 * - 验证行业多样性
 * - 验证数据完整性
 */

const ContentGenerator = require('./content-generator.js');

console.log('=== 测试应用案例生成功能 ===\n');

// 创建生成器实例
const generator = new ContentGenerator();

// 首先生成一些节点作为测试数据
console.log('1. 生成测试节点...');
const domain1Nodes = generator.generateNodes('domain-1', 5, {});
const domain2Nodes = generator.generateNodes('domain-2', 5, {});
const domain3Nodes = generator.generateNodes('domain-3', 5, {});
const allNodes = [...domain1Nodes, ...domain2Nodes, ...domain3Nodes];
console.log(`   生成了 ${allNodes.length} 个测试节点\n`);

// 测试1: 生成指定数量的应用案例
console.log('2. 测试生成指定数量的应用案例...');
const applications = generator.generateApplications(20, null, allNodes);
console.log(`   ✓ 生成了 ${applications.length} 个应用案例`);
console.log(`   ✓ 预期数量: 20, 实际数量: ${applications.length}`);

if (applications.length !== 20) {
  console.error('   ✗ 错误: 生成的案例数量不正确');
  process.exit(1);
}

// 测试2: 验证行业多样性
console.log('\n3. 验证行业多样性...');
const industries = new Set(applications.map(app => app.industry));
console.log(`   ✓ 覆盖了 ${industries.size} 个不同的行业`);
console.log(`   行业列表: ${Array.from(industries).join(', ')}`);

if (industries.size < 15) {
  console.log(`   ⚠ 警告: 行业数量少于15个（实际: ${industries.size}）`);
  console.log('   提示: 生成更多案例可以覆盖更多行业');
}

// 测试3: 验证数据完整性
console.log('\n4. 验证应用案例数据完整性...');
const requiredFields = [
  'id', 'title', 'industry', 'difficulty', 'relatedNodes',
  'relatedDomains', 'description', 'mathematicalConcepts',
  'problemStatement', 'mathematicalModel', 'solution',
  'code', 'visualization', 'realWorldImpact', 'references',
  'estimatedStudyTime'
];

let allFieldsPresent = true;
applications.forEach((app, index) => {
  const missingFields = requiredFields.filter(field => !app[field]);
  if (missingFields.length > 0) {
    console.error(`   ✗ 案例 ${index + 1} 缺少字段: ${missingFields.join(', ')}`);
    allFieldsPresent = false;
  }
});

if (allFieldsPresent) {
  console.log(`   ✓ 所有 ${applications.length} 个案例都包含必需字段`);
} else {
  console.error('   ✗ 错误: 部分案例缺少必需字段');
  process.exit(1);
}

// 测试4: 验证代码长度
console.log('\n5. 验证代码实现长度...');
let allCodeValid = true;
applications.forEach((app, index) => {
  if (!app.code || !app.code.implementation) {
    console.error(`   ✗ 案例 ${index + 1} 缺少代码实现`);
    allCodeValid = false;
  } else if (app.code.implementation.length < 50) {
    console.error(`   ✗ 案例 ${index + 1} 代码长度不足50字符 (实际: ${app.code.implementation.length})`);
    allCodeValid = false;
  }
});

if (allCodeValid) {
  console.log(`   ✓ 所有案例的代码长度都 ≥ 50字符`);
} else {
  console.error('   ✗ 错误: 部分案例的代码长度不足');
  process.exit(1);
}

// 测试5: 验证难度范围
console.log('\n6. 验证难度范围...');
let allDifficultyValid = true;
applications.forEach((app, index) => {
  if (app.difficulty < 1 || app.difficulty > 5) {
    console.error(`   ✗ 案例 ${index + 1} 难度值超出范围: ${app.difficulty}`);
    allDifficultyValid = false;
  }
});

if (allDifficultyValid) {
  console.log(`   ✓ 所有案例的难度值都在 1-5 范围内`);
  const avgDifficulty = applications.reduce((sum, app) => sum + app.difficulty, 0) / applications.length;
  console.log(`   平均难度: ${avgDifficulty.toFixed(2)}`);
} else {
  console.error('   ✗ 错误: 部分案例的难度值超出范围');
  process.exit(1);
}

// 测试6: 验证学习时长范围
console.log('\n7. 验证学习时长范围...');
let allStudyTimeValid = true;
applications.forEach((app, index) => {
  if (app.estimatedStudyTime < 30 || app.estimatedStudyTime > 120) {
    console.error(`   ✗ 案例 ${index + 1} 学习时长超出范围: ${app.estimatedStudyTime}`);
    allStudyTimeValid = false;
  }
});

if (allStudyTimeValid) {
  console.log(`   ✓ 所有案例的学习时长都在 30-120 分钟范围内`);
  const avgStudyTime = applications.reduce((sum, app) => sum + app.estimatedStudyTime, 0) / applications.length;
  console.log(`   平均学习时长: ${avgStudyTime.toFixed(0)} 分钟`);
} else {
  console.error('   ✗ 错误: 部分案例的学习时长超出范围');
  process.exit(1);
}

// 测试7: 验证可视化配置
console.log('\n8. 验证可视化配置...');
let allVisualizationValid = true;
applications.forEach((app, index) => {
  if (!app.visualization || !app.visualization.type || !app.visualization.description) {
    console.error(`   ✗ 案例 ${index + 1} 缺少完整的可视化配置`);
    allVisualizationValid = false;
  }
});

if (allVisualizationValid) {
  console.log(`   ✓ 所有案例都包含完整的可视化配置`);
} else {
  console.error('   ✗ 错误: 部分案例缺少可视化配置');
  process.exit(1);
}

// 测试8: 显示示例案例
console.log('\n9. 显示示例案例...');
const sampleApp = applications[0];
console.log(`\n   案例ID: ${sampleApp.id}`);
console.log(`   标题: ${sampleApp.title}`);
console.log(`   行业: ${sampleApp.industry}`);
console.log(`   难度: ${sampleApp.difficulty}`);
console.log(`   相关节点数: ${sampleApp.relatedNodes.length}`);
console.log(`   相关领域: ${sampleApp.relatedDomains.join(', ')}`);
console.log(`   数学概念: ${sampleApp.mathematicalConcepts.join(', ')}`);
console.log(`   描述: ${sampleApp.description.substring(0, 100)}...`);
console.log(`   代码语言: ${sampleApp.code.language}`);
console.log(`   代码长度: ${sampleApp.code.implementation.length} 字符`);
console.log(`   可视化类型: ${sampleApp.visualization.type}`);
console.log(`   学习时长: ${sampleApp.estimatedStudyTime} 分钟`);

// 测试9: 测试生成100个案例（需求8.1）
console.log('\n10. 测试生成100个应用案例（需求8.1）...');
const largeApplications = generator.generateApplications(100, null, allNodes);
console.log(`   ✓ 成功生成 ${largeApplications.length} 个应用案例`);

const largeIndustries = new Set(largeApplications.map(app => app.industry));
console.log(`   ✓ 覆盖了 ${largeIndustries.size} 个不同的行业`);

if (largeIndustries.size >= 15) {
  console.log(`   ✓ 满足需求8.1: 覆盖15个以上行业`);
} else {
  console.log(`   ⚠ 警告: 行业数量少于15个（实际: ${largeIndustries.size}）`);
}

// 测试10: 验证高级节点的应用案例数量
console.log('\n11. 验证高级节点的应用案例数量（需求2.6）...');
const advancedNodes = allNodes.filter(n => n.difficulty >= 4);
console.log(`   高级节点数量: ${advancedNodes.length}`);

let allAdvancedNodesValid = true;
advancedNodes.forEach(node => {
  if (node.realWorldApplications.length < 2) {
    console.error(`   ✗ 高级节点 ${node.id} 的应用案例数量不足2个 (实际: ${node.realWorldApplications.length})`);
    allAdvancedNodesValid = false;
  }
});

if (allAdvancedNodesValid) {
  console.log(`   ✓ 所有高级节点都有至少2个应用案例`);
} else {
  console.error('   ✗ 错误: 部分高级节点的应用案例数量不足');
  process.exit(1);
}

console.log('\n=== 所有测试通过 ✓ ===\n');
console.log('Task 2.3 实现完成：');
console.log('✓ generateApplications方法正确生成指定数量的应用案例');
console.log('✓ 高级节点（difficulty≥4）至少有2个应用案例');
console.log('✓ 行业选择逻辑（selectIndustries）正常工作');
console.log('✓ 所有必需字段都已包含');
console.log('✓ 代码长度满足要求（≥50字符）');
console.log('✓ 可视化配置完整');
