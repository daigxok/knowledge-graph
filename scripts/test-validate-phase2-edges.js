/**
 * 测试Phase 2实际边数据验证 - Task 3.3验证
 * 
 * 使用真实的Phase 2数据文件测试validateEdges方法
 */

const fs = require('fs');
const path = require('path');
const DataValidator = require('./data-validator.js');

console.log('=== Task 3.3: Phase 2边数据验证测试 ===\n');

const validator = new DataValidator();

// 加载Phase 2节点数据
console.log('加载Phase 2节点数据...');
const nodesPath = path.join(__dirname, '..', 'data', 'nodes-extended-phase2.json');
const nodesData = JSON.parse(fs.readFileSync(nodesPath, 'utf-8'));
const nodes = nodesData.data || nodesData;
console.log(`✓ 加载了 ${nodes.length} 个节点\n`);

// 加载Phase 2边数据
console.log('加载Phase 2边数据...');
const edgesPath = path.join(__dirname, '..', 'data', 'edges-extended-phase2.json');
const edgesData = JSON.parse(fs.readFileSync(edgesPath, 'utf-8'));
const edges = edgesData.data || edgesData;
console.log(`✓ 加载了 ${edges.length} 条边\n`);

// 验证边数据
console.log('开始验证边数据...');
const result = validator.validateEdges(edges, nodes);

console.log('\n=== 验证结果 ===');
console.log('验证状态:', result.success ? '✓ 通过' : '✗ 失败');
console.log('总错误数:', result.errors.length);
console.log('总警告数:', result.warnings.length);

if (result.errors.length > 0) {
  console.log('\n错误详情:');
  result.errors.forEach((error, index) => {
    console.log(`\n错误 ${index + 1}:`);
    console.log('  类型:', error.type);
    console.log('  消息:', error.message);
    console.log('  详情:', JSON.stringify(error.details, null, 2));
  });
}

if (result.warnings.length > 0) {
  console.log('\n警告详情:');
  result.warnings.forEach((warning, index) => {
    console.log(`\n警告 ${index + 1}:`);
    console.log('  类型:', warning.type);
    console.log('  消息:', warning.message);
    console.log('  详情:', JSON.stringify(warning.details, null, 2));
  });
}

// 统计边类型分布
console.log('\n=== 边类型统计 ===');
const typeStats = {};
edges.forEach(edge => {
  typeStats[edge.type] = (typeStats[edge.type] || 0) + 1;
});
Object.entries(typeStats).forEach(([type, count]) => {
  console.log(`${type}: ${count} 条边`);
});

// 统计strength值分布
console.log('\n=== Strength值统计 ===');
const strengths = edges.map(e => e.strength).filter(s => typeof s === 'number');
if (strengths.length > 0) {
  const min = Math.min(...strengths);
  const max = Math.max(...strengths);
  const avg = strengths.reduce((a, b) => a + b, 0) / strengths.length;
  console.log(`最小值: ${min.toFixed(4)}`);
  console.log(`最大值: ${max.toFixed(4)}`);
  console.log(`平均值: ${avg.toFixed(4)}`);
}

// 检查引用完整性
console.log('\n=== 引用完整性检查 ===');
const nodeIds = new Set(nodes.map(n => n.id));
let missingSourceCount = 0;
let missingTargetCount = 0;

edges.forEach(edge => {
  if (edge.source && !nodeIds.has(edge.source)) {
    missingSourceCount++;
  }
  if (edge.target && !nodeIds.has(edge.target)) {
    missingTargetCount++;
  }
});

console.log(`缺失的source节点: ${missingSourceCount}`);
console.log(`缺失的target节点: ${missingTargetCount}`);

if (missingSourceCount === 0 && missingTargetCount === 0) {
  console.log('✓ 所有边的source和target节点都存在');
}

console.log('\n=== Task 3.3 Phase 2数据验证完成 ===');
if (result.success) {
  console.log('✓ Phase 2边数据验证通过');
  console.log('✓ 所有边都符合验证规则');
} else {
  console.log('✗ Phase 2边数据存在问题，请查看上述错误详情');
}
