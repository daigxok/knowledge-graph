/**
 * 循环依赖检测演示脚本
 * 
 * 演示如何使用DataValidator检测知识图谱中的循环依赖
 */

const DataValidator = require('./data-validator.js');

console.log('========================================');
console.log('循环依赖检测演示');
console.log('========================================\n');

// 场景1: 正常的学习路径（无循环）
console.log('场景1: 正常的学习路径');
console.log('--------------------------------------');
console.log('学习路径: 极限 -> 导数 -> 积分 -> 微分方程');

const normalEdges = [
  { id: 'e1', source: 'node-limit', target: 'node-derivative', type: 'prerequisite' },
  { id: 'e2', source: 'node-derivative', target: 'node-integral', type: 'prerequisite' },
  { id: 'e3', source: 'node-integral', target: 'node-diff-eq', type: 'prerequisite' }
];

const validator1 = new DataValidator();
const cycles1 = validator1.detectCycles(normalEdges);

if (cycles1.length === 0) {
  console.log('✓ 未检测到循环依赖，学习路径有效\n');
} else {
  console.log('✗ 检测到循环依赖:', cycles1, '\n');
}

// 场景2: 错误的循环依赖
console.log('场景2: 错误的循环依赖');
console.log('--------------------------------------');
console.log('问题: 导数 -> 微分 -> 链式法则 -> 导数');
console.log('这会导致学习者无法确定从哪里开始学习');

const cyclicEdges = [
  { id: 'e1', source: 'node-derivative', target: 'node-differential', type: 'prerequisite' },
  { id: 'e2', source: 'node-differential', target: 'node-chain-rule', type: 'prerequisite' },
  { id: 'e3', source: 'node-chain-rule', target: 'node-derivative', type: 'prerequisite' }
];

const validator2 = new DataValidator();
const cycles2 = validator2.detectCycles(cyclicEdges);

if (cycles2.length > 0) {
  console.log('✗ 检测到循环依赖:');
  cycles2.forEach((cycle, index) => {
    console.log(`  循环 ${index + 1}: ${cycle.join(' -> ')}`);
  });
  console.log('建议: 移除其中一条前置关系边以打破循环\n');
} else {
  console.log('✓ 未检测到循环依赖\n');
}

// 场景3: 复杂的知识图谱（包含多个循环）
console.log('场景3: 复杂的知识图谱');
console.log('--------------------------------------');
console.log('包含多个独立的循环依赖');

const complexEdges = [
  // 正常路径
  { id: 'e1', source: 'node-limit', target: 'node-continuity', type: 'prerequisite' },
  { id: 'e2', source: 'node-continuity', target: 'node-derivative', type: 'prerequisite' },
  
  // 循环1: 微分 <-> 积分
  { id: 'e3', source: 'node-differential', target: 'node-integral', type: 'prerequisite' },
  { id: 'e4', source: 'node-integral', target: 'node-differential', type: 'prerequisite' },
  
  // 循环2: 偏导数 -> 梯度 -> 方向导数 -> 偏导数
  { id: 'e5', source: 'node-partial-derivative', target: 'node-gradient', type: 'prerequisite' },
  { id: 'e6', source: 'node-gradient', target: 'node-directional-derivative', type: 'prerequisite' },
  { id: 'e7', source: 'node-directional-derivative', target: 'node-partial-derivative', type: 'prerequisite' },
  
  // 跨域关系（不会被检测为循环）
  { id: 'e8', source: 'node-derivative', target: 'node-optimization', type: 'cross-domain' },
  { id: 'e9', source: 'node-optimization', target: 'node-derivative', type: 'application' }
];

const validator3 = new DataValidator();
const cycles3 = validator3.detectCycles(complexEdges);

console.log(`检测到 ${cycles3.length} 个循环依赖:`);
cycles3.forEach((cycle, index) => {
  console.log(`  循环 ${index + 1}: ${cycle.join(' -> ')}`);
});

if (cycles3.length > 0) {
  console.log('\n建议修复方案:');
  console.log('  1. 检查每个循环中的前置关系是否合理');
  console.log('  2. 移除不必要的前置关系边');
  console.log('  3. 考虑将某些边改为cross-domain或application类型\n');
}

// 场景4: 自循环（节点依赖自己）
console.log('场景4: 自循环检测');
console.log('--------------------------------------');
console.log('问题: 节点的前置知识是它自己');

const selfLoopEdges = [
  { id: 'e1', source: 'node-recursion', target: 'node-recursion', type: 'prerequisite' }
];

const validator4 = new DataValidator();
const cycles4 = validator4.detectCycles(selfLoopEdges);

if (cycles4.length > 0) {
  console.log('✗ 检测到自循环:');
  cycles4.forEach((cycle, index) => {
    console.log(`  循环 ${index + 1}: ${cycle.join(' -> ')}`);
  });
  console.log('建议: 移除自循环边，节点不应该依赖自己\n');
}

// 场景5: 集成到验证流程
console.log('场景5: 集成到完整验证流程');
console.log('--------------------------------------');

const testEdges = [
  { id: 'e1', source: 'A', target: 'B', type: 'prerequisite' },
  { id: 'e2', source: 'B', target: 'C', type: 'prerequisite' },
  { id: 'e3', source: 'C', target: 'A', type: 'prerequisite' }
];

const testNodes = [
  { id: 'A', name: '节点A' },
  { id: 'B', name: '节点B' },
  { id: 'C', name: '节点C' }
];

const validator5 = new DataValidator();

// 验证边关系
const edgeValidation = validator5.validateEdges(testEdges, testNodes);
console.log('边关系验证结果:');
console.log(`  - 总边数: ${testEdges.length}`);
console.log(`  - 验证通过: ${edgeValidation.success}`);
console.log(`  - 错误数: ${edgeValidation.errors.length}`);
console.log(`  - 警告数: ${edgeValidation.warnings.length}`);

// 检测循环
const cycles5 = validator5.detectCycles(testEdges);
if (cycles5.length > 0) {
  console.log(`\n✗ 发现 ${cycles5.length} 个循环依赖:`);
  cycles5.forEach((cycle, index) => {
    console.log(`  循环 ${index + 1}: ${cycle.join(' -> ')}`);
  });
}

console.log('\n========================================');
console.log('演示完成');
console.log('========================================');
console.log('\n使用说明:');
console.log('1. 在生成边关系后，调用 detectCycles(edges) 检测循环');
console.log('2. 如果返回空数组，说明没有循环依赖');
console.log('3. 如果返回非空数组，每个元素是一个循环路径');
console.log('4. 循环路径是节点ID数组，首尾节点相同');
console.log('5. 只检查type为"prerequisite"的边');
