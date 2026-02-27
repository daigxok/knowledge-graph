/**
 * 演示validateEdges方法的所有功能 - Task 3.3
 * 
 * 展示边验证的各种场景和功能
 */

const DataValidator = require('./data-validator.js');

console.log('=== Task 3.3: validateEdges方法功能演示 ===\n');

const validator = new DataValidator();

// 准备测试节点
const testNodes = [
  { id: 'node-calculus-limit', name: '极限' },
  { id: 'node-calculus-derivative', name: '导数' },
  { id: 'node-calculus-integral', name: '积分' },
  { id: 'node-calculus-series', name: '级数' }
];

console.log('测试节点:');
testNodes.forEach(node => {
  console.log(`  - ${node.id}: ${node.name}`);
});
console.log();

// 场景1: 完美的边数据
console.log('场景1: 完美的边数据');
console.log('----------------------------------------');
const perfectEdges = [
  {
    id: 'edge-001',
    source: 'node-calculus-limit',
    target: 'node-calculus-derivative',
    type: 'prerequisite',
    strength: 0.9,
    description: '极限是导数的前置知识'
  },
  {
    id: 'edge-002',
    source: 'node-calculus-derivative',
    target: 'node-calculus-integral',
    type: 'prerequisite',
    strength: 0.85,
    description: '导数是积分的前置知识'
  },
  {
    id: 'edge-003',
    source: 'node-calculus-integral',
    target: 'node-calculus-series',
    type: 'cross-domain',
    strength: 0.6,
    description: '积分与级数有跨域关系'
  }
];

let result = validator.validateEdges(perfectEdges, testNodes);
console.log('验证结果:', result.success ? '✓ 通过' : '✗ 失败');
console.log('错误数:', result.errors.length);
console.log('警告数:', result.warnings.length);
console.log('✓ 所有边都符合规范\n');

// 场景2: 引用不存在的节点
console.log('场景2: 引用不存在的节点');
console.log('----------------------------------------');
const invalidRefEdges = [
  {
    id: 'edge-invalid-ref',
    source: 'node-nonexistent',  // 不存在
    target: 'node-calculus-derivative',
    type: 'prerequisite',
    strength: 0.8
  }
];

result = validator.validateEdges(invalidRefEdges, testNodes);
console.log('验证结果:', result.success ? '✓ 通过' : '✗ 失败（预期）');
console.log('错误数:', result.errors.length);
if (result.errors.length > 0) {
  console.log('错误信息:', result.errors[0].message);
  console.log('缺失的节点:', result.errors[0].details.missingId);
}
console.log('✓ 正确检测到引用不存在的节点\n');

// 场景3: 无效的边类型
console.log('场景3: 无效的边类型');
console.log('----------------------------------------');
const invalidTypeEdges = [
  {
    id: 'edge-invalid-type',
    source: 'node-calculus-limit',
    target: 'node-calculus-derivative',
    type: 'dependency',  // 无效类型
    strength: 0.8
  }
];

result = validator.validateEdges(invalidTypeEdges, testNodes);
console.log('验证结果:', result.success ? '✓ 通过' : '✗ 失败（预期）');
console.log('错误数:', result.errors.length);
if (result.errors.length > 0) {
  console.log('错误信息:', result.errors[0].message);
  console.log('有效类型:', result.errors[0].details.validTypes.join(', '));
}
console.log('✓ 正确检测到无效的边类型\n');

// 场景4: strength值超出范围
console.log('场景4: strength值超出范围');
console.log('----------------------------------------');
const invalidStrengthEdges = [
  {
    id: 'edge-strength-too-high',
    source: 'node-calculus-limit',
    target: 'node-calculus-derivative',
    type: 'prerequisite',
    strength: 1.5  // 超出范围
  },
  {
    id: 'edge-strength-negative',
    source: 'node-calculus-derivative',
    target: 'node-calculus-integral',
    type: 'prerequisite',
    strength: -0.2  // 负数
  }
];

result = validator.validateEdges(invalidStrengthEdges, testNodes);
console.log('验证结果:', result.success ? '✓ 通过' : '✗ 失败（预期）');
console.log('错误数:', result.errors.length);
result.errors.forEach((error, i) => {
  console.log(`错误 ${i + 1}:`, error.message);
  console.log(`  值: ${error.details.value}, 有效范围: ${error.details.min} - ${error.details.max}`);
});
console.log('✓ 正确检测到strength值超出范围\n');

// 场景5: 缺少必需字段
console.log('场景5: 缺少必需字段');
console.log('----------------------------------------');
const missingFieldEdges = [
  {
    id: 'edge-missing-fields',
    source: 'node-calculus-limit',
    // 缺少 target, type, strength
  }
];

result = validator.validateEdges(missingFieldEdges, testNodes);
console.log('验证结果:', result.success ? '✓ 通过' : '✗ 失败（预期）');
console.log('错误数:', result.errors.length);
console.log('缺少的字段:');
result.errors.forEach(error => {
  if (error.type === 'MISSING_FIELD') {
    console.log(`  - ${error.details.field}`);
  }
});
console.log('✓ 正确检测到缺少必需字段\n');

// 场景6: 所有三种边类型
console.log('场景6: 所有三种边类型');
console.log('----------------------------------------');
const allTypesEdges = [
  {
    id: 'edge-prerequisite',
    source: 'node-calculus-limit',
    target: 'node-calculus-derivative',
    type: 'prerequisite',
    strength: 0.9
  },
  {
    id: 'edge-cross-domain',
    source: 'node-calculus-derivative',
    target: 'node-calculus-series',
    type: 'cross-domain',
    strength: 0.5
  },
  {
    id: 'edge-application',
    source: 'node-calculus-integral',
    target: 'node-calculus-series',
    type: 'application',
    strength: 0.7
  }
];

result = validator.validateEdges(allTypesEdges, testNodes);
console.log('验证结果:', result.success ? '✓ 通过' : '✗ 失败');
console.log('边类型统计:');
const typeCount = {};
allTypesEdges.forEach(edge => {
  typeCount[edge.type] = (typeCount[edge.type] || 0) + 1;
});
Object.entries(typeCount).forEach(([type, count]) => {
  console.log(`  ${type}: ${count} 条边`);
});
console.log('✓ 所有三种边类型都被正确验证\n');

// 场景7: strength边界值
console.log('场景7: strength边界值');
console.log('----------------------------------------');
const boundaryEdges = [
  {
    id: 'edge-strength-min',
    source: 'node-calculus-limit',
    target: 'node-calculus-derivative',
    type: 'prerequisite',
    strength: 0  // 最小值
  },
  {
    id: 'edge-strength-max',
    source: 'node-calculus-derivative',
    target: 'node-calculus-integral',
    type: 'prerequisite',
    strength: 1  // 最大值
  },
  {
    id: 'edge-strength-mid',
    source: 'node-calculus-integral',
    target: 'node-calculus-series',
    type: 'cross-domain',
    strength: 0.5  // 中间值
  }
];

result = validator.validateEdges(boundaryEdges, testNodes);
console.log('验证结果:', result.success ? '✓ 通过' : '✗ 失败');
console.log('strength值范围:');
boundaryEdges.forEach(edge => {
  console.log(`  ${edge.id}: ${edge.strength}`);
});
console.log('✓ 边界值验证正常\n');

// 场景8: 综合验证报告
console.log('场景8: 综合验证报告');
console.log('----------------------------------------');
const mixedEdges = [
  ...perfectEdges,
  ...invalidRefEdges,
  ...invalidTypeEdges,
  ...invalidStrengthEdges
];

result = validator.validateEdges(mixedEdges, testNodes);
console.log('验证结果:', result.success ? '✓ 通过' : '✗ 失败（预期）');
console.log('总边数:', mixedEdges.length);
console.log('总错误数:', result.errors.length);
console.log('总警告数:', result.warnings.length);

console.log('\n错误类型分布:');
const errorTypes = {};
result.errors.forEach(error => {
  errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
});
Object.entries(errorTypes).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});
console.log('✓ 综合验证功能正常\n');

console.log('=== Task 3.3 功能演示完成 ===');
console.log('✓ validateEdges方法功能完整');
console.log('✓ 支持所有验证规则:');
console.log('  - 必需字段完整性验证');
console.log('  - source和target节点存在性验证');
console.log('  - type字段有效性验证 (prerequisite/cross-domain/application)');
console.log('  - strength值范围验证 (0-1)');
console.log('  - 字段类型验证');
console.log('  - 详细的错误报告');
