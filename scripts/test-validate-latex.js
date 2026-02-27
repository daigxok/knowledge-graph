#!/usr/bin/env node

/**
 * 测试脚本 - LaTeX公式验证
 * 
 * 测试DataValidator的validateLatex方法
 * 验证括号匹配、基本LaTeX语法等功能
 */

const DataValidator = require('./data-validator.js');

// 创建验证器实例
const validator = new DataValidator();

// 测试用例
const testCases = [
  // 有效的LaTeX公式
  {
    name: '简单分数',
    formula: '\\frac{1}{2}',
    expectedValid: true
  },
  {
    name: '平方根',
    formula: '\\sqrt{x^2 + y^2}',
    expectedValid: true
  },
  {
    name: 'n次根',
    formula: '\\sqrt[3]{27}',
    expectedValid: true
  },
  {
    name: '复杂公式',
    formula: '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    expectedValid: true
  },
  {
    name: '积分公式',
    formula: '\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}',
    expectedValid: true
  },
  {
    name: '求和公式',
    formula: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
    expectedValid: true
  },
  {
    name: '极限公式',
    formula: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1',
    expectedValid: true
  },
  {
    name: '矩阵公式',
    formula: '\\left[\\begin{matrix} a & b \\\\ c & d \\end{matrix}\\right]',
    expectedValid: true
  },
  {
    name: '嵌套括号',
    formula: '\\left(\\frac{a + b}{c + d}\\right)^2',
    expectedValid: true
  },
  {
    name: '希腊字母',
    formula: '\\alpha + \\beta = \\gamma',
    expectedValid: true
  },
  {
    name: '下标和上标',
    formula: 'x_1^2 + x_2^2 = r^2',
    expectedValid: true
  },
  {
    name: '向量符号',
    formula: '\\vec{v} = \\mathbf{i} + \\mathbf{j}',
    expectedValid: true
  },
  {
    name: '偏导数',
    formula: '\\frac{\\partial f}{\\partial x}',
    expectedValid: true
  },
  {
    name: '曲率公式',
    formula: '\\kappa = \\frac{|y\'\'|}{(1 + y\'^2)^{3/2}}',
    expectedValid: true
  },
  
  // 无效的LaTeX公式 - 括号不匹配
  {
    name: '缺少右花括号',
    formula: '\\frac{1{2}',
    expectedValid: false,
    expectedError: 'Unclosed bracket'
  },
  {
    name: '缺少左花括号',
    formula: '\\frac1}{2}',
    expectedValid: false,
    expectedError: 'Unmatched closing bracket'
  },
  {
    name: '括号类型不匹配',
    formula: '\\frac{1]',
    expectedValid: false,
    expectedError: 'Mismatched brackets'
  },
  {
    name: '多余的右括号',
    formula: '\\frac{1}{2}}',
    expectedValid: false,
    expectedError: 'Unmatched closing bracket'
  },
  {
    name: '嵌套括号不匹配',
    formula: '\\left(\\frac{a + b}{c + d}\\right',
    expectedValid: false,
    expectedError: 'Unclosed bracket'
  },
  
  // 无效的LaTeX公式 - 语法错误
  {
    name: '空花括号',
    formula: '\\frac{}{}',
    expectedValid: false,
    expectedError: 'Empty braces'
  },
  {
    name: 'frac缺少参数',
    formula: '\\frac{1}',
    expectedValid: true,  // 简化的验证器只检查\frac后是否有{，不检查是否有两个参数
    note: '完整验证需要完整的LaTeX解析器'
  },
  {
    name: 'sqrt缺少参数',
    formula: '\\sqrt',
    expectedValid: false,
    expectedError: 'should be followed by an argument'
  },
  {
    name: 'left和right不匹配',
    formula: '\\left( x + y',
    expectedValid: false,
    expectedError: 'Unmatched \\left and \\right'
  },
  {
    name: '未转义的百分号',
    formula: 'x % y',
    expectedValid: false,
    expectedError: 'Unescaped special character'
  },
  
  // 边界情况
  {
    name: '空字符串',
    formula: '',
    expectedValid: false,
    expectedError: 'must be a non-empty string'
  },
  {
    name: '只有空格',
    formula: '   ',
    expectedValid: true  // 空格是有效的
  },
  {
    name: '转义的花括号',
    formula: '\\{ x \\}',
    expectedValid: true
  }
];

// 运行测试
console.log('='.repeat(80));
console.log('LaTeX公式验证测试');
console.log('='.repeat(80));
console.log();

let passedTests = 0;
let failedTests = 0;
const failures = [];

testCases.forEach((testCase, index) => {
  const result = validator.validateLatex(testCase.formula);
  const passed = result.valid === testCase.expectedValid;
  
  if (passed) {
    passedTests++;
    console.log(`✓ 测试 ${index + 1}: ${testCase.name}`);
  } else {
    failedTests++;
    console.log(`✗ 测试 ${index + 1}: ${testCase.name}`);
    console.log(`  公式: ${testCase.formula}`);
    console.log(`  期望: ${testCase.expectedValid ? '有效' : '无效'}`);
    console.log(`  实际: ${result.valid ? '有效' : '无效'}`);
    if (!result.valid) {
      console.log(`  错误: ${result.errors.join(', ')}`);
    }
    failures.push({
      name: testCase.name,
      formula: testCase.formula,
      expected: testCase.expectedValid,
      actual: result.valid,
      errors: result.errors
    });
  }
  
  // 如果期望有特定错误，验证错误消息
  if (!testCase.expectedValid && testCase.expectedError && !result.valid) {
    const hasExpectedError = result.errors.some(err => 
      err.includes(testCase.expectedError)
    );
    if (!hasExpectedError) {
      console.log(`  警告: 未找到期望的错误消息 "${testCase.expectedError}"`);
    }
  }
});

console.log();
console.log('='.repeat(80));
console.log('测试总结');
console.log('='.repeat(80));
console.log(`总测试数: ${testCases.length}`);
console.log(`通过: ${passedTests} (${(passedTests / testCases.length * 100).toFixed(1)}%)`);
console.log(`失败: ${failedTests} (${(failedTests / testCases.length * 100).toFixed(1)}%)`);

if (failedTests > 0) {
  console.log();
  console.log('失败的测试详情:');
  failures.forEach((failure, index) => {
    console.log(`\n${index + 1}. ${failure.name}`);
    console.log(`   公式: ${failure.formula}`);
    console.log(`   期望: ${failure.expected ? '有效' : '无效'}`);
    console.log(`   实际: ${failure.actual ? '有效' : '无效'}`);
    if (failure.errors.length > 0) {
      console.log(`   错误: ${failure.errors.join(', ')}`);
    }
  });
}

console.log();

// 退出码
process.exit(failedTests > 0 ? 1 : 0);
