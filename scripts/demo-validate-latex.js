#!/usr/bin/env node

/**
 * 演示脚本 - LaTeX公式验证
 * 
 * 演示DataValidator的validateLatex方法
 * 展示如何验证节点中的LaTeX公式
 */

const DataValidator = require('./data-validator.js');

// 创建验证器实例
const validator = new DataValidator();

console.log('='.repeat(80));
console.log('LaTeX公式验证演示');
console.log('='.repeat(80));
console.log();

// 示例1: 验证单个公式
console.log('示例1: 验证单个LaTeX公式');
console.log('-'.repeat(80));

const formula1 = '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}';
console.log(`公式: ${formula1}`);
const result1 = validator.validateLatex(formula1);
console.log(`验证结果: ${result1.valid ? '✓ 有效' : '✗ 无效'}`);
if (!result1.valid) {
  console.log('错误:');
  result1.errors.forEach(err => console.log(`  - ${err}`));
}
console.log();

// 示例2: 验证包含错误的公式
console.log('示例2: 验证包含错误的公式');
console.log('-'.repeat(80));

const formula2 = '\\frac{1{2}';  // 缺少右花括号
console.log(`公式: ${formula2}`);
const result2 = validator.validateLatex(formula2);
console.log(`验证结果: ${result2.valid ? '✓ 有效' : '✗ 无效'}`);
if (!result2.valid) {
  console.log('错误:');
  result2.errors.forEach(err => console.log(`  - ${err}`));
}
console.log();

// 示例3: 验证节点数据中的公式
console.log('示例3: 验证节点数据中的LaTeX公式');
console.log('-'.repeat(80));

const testNodes = [
  {
    id: 'node-curvature',
    name: '曲率',
    nameEn: 'Curvature',
    description: '曲率描述曲线在某点的弯曲程度',
    domains: ['domain-1'],
    difficulty: 4,
    prerequisites: ['node-derivative-def'],
    relatedSkills: ['导数与微分Skill'],
    formula: '\\kappa = \\frac{|y\'\'|}{(1 + y\'^2)^{3/2}}',
    keywords: ['曲率', '曲率半径', '曲率中心'],
    estimatedStudyTime: 60,
    realWorldApplications: [
      { title: '道路设计', description: '应用描述', industry: '土木工程' },
      { title: '计算机图形学', description: '应用描述', industry: '计算机' }
    ]
  },
  {
    id: 'node-invalid-formula',
    name: '无效公式节点',
    nameEn: 'Invalid Formula Node',
    description: '这个节点包含无效的LaTeX公式',
    domains: ['domain-1'],
    difficulty: 3,
    prerequisites: [],
    relatedSkills: [],
    formula: '\\frac{a}{b',  // 缺少右花括号
    keywords: ['测试', '无效', '公式'],
    estimatedStudyTime: 45,
    realWorldApplications: [
      { title: '测试应用', description: '测试描述', industry: '测试' }
    ]
  }
];

console.log('验证节点数据...\n');
const validationResult = validator.validateNodes(testNodes);

console.log(`验证结果: ${validationResult.success ? '✓ 通过' : '✗ 失败'}`);
console.log(`总节点数: ${testNodes.length}`);
console.log(`错误数: ${validationResult.errors.length}`);
console.log(`警告数: ${validationResult.warnings.length}`);
console.log();

if (validationResult.errors.length > 0) {
  console.log('错误详情:');
  validationResult.errors.forEach((error, index) => {
    console.log(`\n${index + 1}. ${error.type}: ${error.message}`);
    if (error.details) {
      console.log(`   节点ID: ${error.details.nodeId}`);
      if (error.details.formula) {
        console.log(`   公式: ${error.details.formula}`);
      }
      if (error.details.error) {
        console.log(`   具体错误: ${error.details.error}`);
      }
    }
  });
  console.log();
}

// 示例4: 常见的LaTeX公式验证
console.log('示例4: 常见数学公式验证');
console.log('-'.repeat(80));

const commonFormulas = [
  { name: '二次公式', formula: '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
  { name: '欧拉公式', formula: 'e^{i\\pi} + 1 = 0' },
  { name: '积分公式', formula: '\\int_{a}^{b} f(x) dx' },
  { name: '求和公式', formula: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}' },
  { name: '极限公式', formula: '\\lim_{x \\to \\infty} \\frac{1}{x} = 0' },
  { name: '偏导数', formula: '\\frac{\\partial f}{\\partial x}' },
  { name: '梯度', formula: '\\nabla f = \\left(\\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y}\\right)' },
  { name: '泰勒级数', formula: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n' }
];

console.log('验证常见数学公式:\n');
commonFormulas.forEach((item, index) => {
  const result = validator.validateLatex(item.formula);
  const status = result.valid ? '✓' : '✗';
  console.log(`${status} ${item.name}`);
  if (!result.valid) {
    console.log(`  公式: ${item.formula}`);
    console.log(`  错误: ${result.errors.join(', ')}`);
  }
});

console.log();
console.log('='.repeat(80));
console.log('演示完成');
console.log('='.repeat(80));
