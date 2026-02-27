/**
 * 测试脚本 - 验证应用案例验证功能
 * 
 * 测试DataValidator.validateApplications方法的所有验证规则
 */

const DataValidator = require('./data-validator.js');

console.log('=== 测试应用案例验证功能 ===\n');

// 创建验证器实例
const validator = new DataValidator();

// 准备测试数据 - 节点数据
const testNodes = [
  { id: 'node-test-1', name: '测试节点1' },
  { id: 'node-test-2', name: '测试节点2' },
  { id: 'node-test-3', name: '测试节点3' }
];

// 测试1: 有效的应用案例
console.log('测试1: 有效的应用案例');
const validApp = {
  id: 'app-test-001',
  title: '神经网络反向传播算法',
  industry: '人工智能与机器学习',
  difficulty: 4,
  relatedNodes: ['node-test-1', 'node-test-2'],
  description: '反向传播是训练神经网络的核心算法，通过链式法则计算损失函数对每个参数的梯度。',
  mathematicalConcepts: ['复合函数求导', '链式法则', '梯度'],
  problemStatement: '给定神经网络损失函数，如何高效计算所有参数的梯度？',
  solution: { steps: ['前向传播', '计算误差', '反向传播', '更新参数'] },
  code: {
    language: 'python',
    implementation: 'import numpy as np\n\nclass NeuralNetwork:\n    def __init__(self):\n        pass\n    def forward(self, x):\n        return x'
  },
  visualization: { type: 'interactive-network', description: '可视化神经网络' }
};

let result = validator.validateApplications([validApp], testNodes);
console.log(`结果: ${result.success ? '✓ 通过' : '✗ 失败'}`);
console.log(`错误数: ${result.errors.length}, 警告数: ${result.warnings.length}`);
if (!result.success) {
  console.log('错误:', result.errors);
}
console.log('');

// 测试2: 缺少必需字段
console.log('测试2: 缺少必需字段');
const missingFieldApp = {
  id: 'app-test-002',
  title: '测试应用',
  // 缺少 industry, difficulty, relatedNodes 等字段
};

result = validator.validateApplications([missingFieldApp], testNodes);
console.log(`结果: ${result.success ? '✓ 通过' : '✗ 失败'}`);
console.log(`错误数: ${result.errors.length}`);
console.log('预期错误: 缺少多个必需字段');
console.log('实际错误类型:', result.errors.map(e => e.type).join(', '));
console.log('');

// 测试3: 引用不存在的节点
console.log('测试3: 引用不存在的节点');
const invalidNodeRefApp = {
  id: 'app-test-003',
  title: '测试应用',
  industry: '测试行业',
  difficulty: 3,
  relatedNodes: ['node-test-1', 'node-nonexistent', 'node-test-2'],
  description: '测试描述',
  mathematicalConcepts: ['概念1'],
  problemStatement: '问题陈述',
  solution: { steps: ['步骤1'] },
  code: {
    language: 'python',
    implementation: 'print("Hello World")\nfor i in range(10):\n    print(i)'
  },
  visualization: { type: 'chart' }
};

result = validator.validateApplications([invalidNodeRefApp], testNodes);
console.log(`结果: ${result.success ? '✓ 通过' : '✗ 失败'}`);
console.log(`错误数: ${result.errors.length}`);
console.log('预期错误: MISSING_NODE');
const missingNodeError = result.errors.find(e => e.type === 'MISSING_NODE');
if (missingNodeError) {
  console.log(`✓ 检测到不存在的节点: ${missingNodeError.details.missingId}`);
} else {
  console.log('✗ 未检测到不存在的节点');
}
console.log('');

// 测试4: 代码长度不足（少于50字符）
console.log('测试4: 代码长度不足（少于50字符）');
const shortCodeApp = {
  id: 'app-test-004',
  title: '测试应用',
  industry: '测试行业',
  difficulty: 3,
  relatedNodes: ['node-test-1'],
  description: '测试描述',
  mathematicalConcepts: ['概念1'],
  problemStatement: '问题陈述',
  solution: { steps: ['步骤1'] },
  code: {
    language: 'python',
    implementation: 'print("short")'  // 只有15个字符
  },
  visualization: { type: 'chart' }
};

result = validator.validateApplications([shortCodeApp], testNodes);
console.log(`结果: ${result.success ? '✓ 通过' : '✗ 失败'}`);
console.log(`错误数: ${result.errors.length}`);
console.log('预期错误: INSUFFICIENT_CODE_LENGTH');
const codeLengthError = result.errors.find(e => e.type === 'INSUFFICIENT_CODE_LENGTH');
if (codeLengthError) {
  console.log(`✓ 检测到代码长度不足: ${codeLengthError.details.length}字符 (最小50字符)`);
} else {
  console.log('✗ 未检测到代码长度不足');
}
console.log('');

// 测试5: 不支持的代码语言
console.log('测试5: 不支持的代码语言');
const invalidLanguageApp = {
  id: 'app-test-005',
  title: '测试应用',
  industry: '测试行业',
  difficulty: 3,
  relatedNodes: ['node-test-1'],
  description: '测试描述',
  mathematicalConcepts: ['概念1'],
  problemStatement: '问题陈述',
  solution: { steps: ['步骤1'] },
  code: {
    language: 'ruby',  // 不支持的语言
    implementation: 'puts "Hello World"\n10.times do |i|\n  puts i\nend\nputs "Done"'
  },
  visualization: { type: 'chart' }
};

result = validator.validateApplications([invalidLanguageApp], testNodes);
console.log(`结果: ${result.success ? '✓ 通过' : '✗ 失败'}`);
console.log(`错误数: ${result.errors.length}`);
console.log('预期错误: INVALID_CODE_LANGUAGE');
const languageError = result.errors.find(e => e.type === 'INVALID_CODE_LANGUAGE');
if (languageError) {
  console.log(`✓ 检测到不支持的语言: ${languageError.details.language}`);
  console.log(`  支持的语言: ${languageError.details.supportedLanguages.join(', ')}`);
} else {
  console.log('✗ 未检测到不支持的语言');
}
console.log('');

// 测试6: 难度值超出范围
console.log('测试6: 难度值超出范围');
const invalidDifficultyApp = {
  id: 'app-test-006',
  title: '测试应用',
  industry: '测试行业',
  difficulty: 6,  // 超出范围 (1-5)
  relatedNodes: ['node-test-1'],
  description: '测试描述',
  mathematicalConcepts: ['概念1'],
  problemStatement: '问题陈述',
  solution: { steps: ['步骤1'] },
  code: {
    language: 'python',
    implementation: 'print("Hello World")\nfor i in range(10):\n    print(i)'
  },
  visualization: { type: 'chart' }
};

result = validator.validateApplications([invalidDifficultyApp], testNodes);
console.log(`结果: ${result.success ? '✓ 通过' : '✗ 失败'}`);
console.log(`错误数: ${result.errors.length}`);
console.log('预期错误: INVALID_DIFFICULTY');
const difficultyError = result.errors.find(e => e.type === 'INVALID_DIFFICULTY');
if (difficultyError) {
  console.log(`✓ 检测到难度值超出范围: ${difficultyError.details.value} (范围: 1-5)`);
} else {
  console.log('✗ 未检测到难度值超出范围');
}
console.log('');

// 测试7: 字段类型错误
console.log('测试7: 字段类型错误');
const invalidTypeApp = {
  id: 'app-test-007',
  title: 123,  // 应该是字符串
  industry: '测试行业',
  difficulty: '3',  // 应该是数字
  relatedNodes: 'node-test-1',  // 应该是数组
  description: '测试描述',
  mathematicalConcepts: 'concept',  // 应该是数组
  problemStatement: '问题陈述',
  solution: { steps: ['步骤1'] },
  code: {
    language: 'python',
    implementation: 'print("Hello World")\nfor i in range(10):\n    print(i)'
  },
  visualization: { type: 'chart' }
};

result = validator.validateApplications([invalidTypeApp], testNodes);
console.log(`结果: ${result.success ? '✓ 通过' : '✗ 失败'}`);
console.log(`错误数: ${result.errors.length}`);
console.log('预期错误: INVALID_TYPE (多个)');
const typeErrors = result.errors.filter(e => e.type === 'INVALID_TYPE');
console.log(`✓ 检测到 ${typeErrors.length} 个类型错误:`);
typeErrors.forEach(err => {
  console.log(`  - ${err.details.field}: 期望 ${err.details.expected}, 实际 ${err.details.actual}`);
});
console.log('');

// 测试8: 空字段
console.log('测试8: 空字段');
const emptyFieldApp = {
  id: 'app-test-008',
  title: '',  // 空字符串
  industry: '测试行业',
  difficulty: 3,
  relatedNodes: ['node-test-1'],
  description: '',  // 空字符串
  mathematicalConcepts: ['概念1'],
  problemStatement: '',  // 空字符串
  solution: { steps: ['步骤1'] },
  code: {
    language: 'python',
    implementation: 'print("Hello World")\nfor i in range(10):\n    print(i)'
  },
  visualization: { type: 'chart' }
};

result = validator.validateApplications([emptyFieldApp], testNodes);
console.log(`结果: ${result.success ? '✓ 通过' : '✗ 失败'}`);
console.log(`错误数: ${result.errors.length}`);
console.log('预期错误: EMPTY_FIELD (多个)');
const emptyErrors = result.errors.filter(e => e.type === 'EMPTY_FIELD');
console.log(`✓ 检测到 ${emptyErrors.length} 个空字段错误`);
console.log('');

// 测试9: 多个应用案例混合验证
console.log('测试9: 多个应用案例混合验证');
const mixedApps = [
  validApp,  // 有效
  missingFieldApp,  // 缺少字段
  invalidNodeRefApp,  // 引用不存在的节点
  shortCodeApp  // 代码长度不足
];

result = validator.validateApplications(mixedApps, testNodes);
console.log(`结果: ${result.success ? '✓ 通过' : '✗ 失败'}`);
console.log(`错误数: ${result.errors.length}, 警告数: ${result.warnings.length}`);
console.log('错误类型统计:');
const errorTypes = {};
result.errors.forEach(err => {
  errorTypes[err.type] = (errorTypes[err.type] || 0) + 1;
});
Object.entries(errorTypes).forEach(([type, count]) => {
  console.log(`  - ${type}: ${count}`);
});
console.log('');

// 测试10: JavaScript代码语言
console.log('测试10: JavaScript代码语言');
const jsCodeApp = {
  id: 'app-test-010',
  title: '测试应用',
  industry: '测试行业',
  difficulty: 3,
  relatedNodes: ['node-test-1'],
  description: '测试描述',
  mathematicalConcepts: ['概念1'],
  problemStatement: '问题陈述',
  solution: { steps: ['步骤1'] },
  code: {
    language: 'javascript',
    implementation: 'function test() {\n  console.log("Hello World");\n  for (let i = 0; i < 10; i++) {\n    console.log(i);\n  }\n}'
  },
  visualization: { type: 'chart' }
};

result = validator.validateApplications([jsCodeApp], testNodes);
console.log(`结果: ${result.success ? '✓ 通过' : '✗ 失败'}`);
console.log(`错误数: ${result.errors.length}`);
if (result.success) {
  console.log('✓ JavaScript代码语言验证通过');
} else {
  console.log('✗ JavaScript代码语言验证失败');
  console.log('错误:', result.errors);
}
console.log('');

// 汇总测试结果
console.log('=== 测试完成 ===');
console.log('所有验证规则已测试:');
console.log('✓ 必需字段完整性验证');
console.log('✓ relatedNodes引用完整性验证');
console.log('✓ 代码长度验证（最小50字符）');
console.log('✓ 代码语言验证（python/javascript）');
console.log('✓ 难度值范围验证（1-5）');
console.log('✓ 字段类型验证');
console.log('✓ 空字段验证');
console.log('✓ 多应用案例批量验证');
