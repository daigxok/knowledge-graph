/**
 * 测试DataValidator的generateReport和formatErrorMessage功能
 * 
 * 测试场景:
 * 1. 生成包含各种错误类型的报告
 * 2. 测试formatErrorMessage的用户友好提示
 * 3. 测试HTML和文本格式报告
 * 4. 测试统计摘要的准确性
 */

const DataValidator = require('./data-validator.js');
const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('测试 DataValidator 报告生成功能');
console.log('='.repeat(60));
console.log();

// 创建验证器实例
const validator = new DataValidator();

// 测试场景1: 测试formatErrorMessage
console.log('测试 1: formatErrorMessage 用户友好提示');
console.log('-'.repeat(60));

const testErrors = [
  {
    type: 'MISSING_NODE',
    severity: 'error',
    message: '边引用了不存在的节点',
    details: {
      edgeIndex: 5,
      edgeId: 'edge-test-001',
      missingId: 'node-nonexistent'
    }
  },
  {
    type: 'INVALID_DIFFICULTY',
    severity: 'error',
    message: '节点难度值超出范围',
    details: {
      nodeIndex: 10,
      nodeId: 'node-test-002',
      value: 6,
      min: 1,
      max: 5
    }
  },
  {
    type: 'INSUFFICIENT_APPLICATIONS',
    severity: 'warning',
    message: '高难度节点应用案例数量不足',
    details: {
      nodeIndex: 15,
      nodeId: 'node-advanced-topic',
      difficulty: 4,
      count: 1,
      min: 2
    }
  },
  {
    type: 'INVALID_LATEX',
    severity: 'error',
    message: 'LaTeX公式语法错误',
    details: {
      nodeIndex: 20,
      nodeId: 'node-formula-test',
      formula: '\\frac{1}{2',
      error: 'Unclosed bracket \'{\' at position 5'
    }
  }
];

testErrors.forEach((error, index) => {
  console.log(`\n错误 ${index + 1}:`);
  console.log(validator.formatErrorMessage(error));
});

console.log('\n✓ formatErrorMessage 测试完成\n');

// 测试场景2: 生成包含多种错误的验证报告
console.log('测试 2: 生成验证报告（包含多种错误类型）');
console.log('-'.repeat(60));

// 创建模拟的验证结果
const mockResults = [
  {
    fileName: 'nodes-extended-phase2.json',
    success: false,
    errors: [
      {
        type: 'MISSING_FIELD',
        severity: 'error',
        message: '节点缺少必需字段: description',
        details: {
          nodeIndex: 0,
          nodeId: 'node-test-001',
          field: 'description'
        }
      },
      {
        type: 'INVALID_DIFFICULTY',
        severity: 'error',
        message: '节点难度值超出范围',
        details: {
          nodeIndex: 1,
          nodeId: 'node-test-002',
          value: 6,
          min: 1,
          max: 5
        }
      },
      {
        type: 'INVALID_STUDY_TIME',
        severity: 'error',
        message: '节点学习时长超出范围',
        details: {
          nodeIndex: 2,
          nodeId: 'node-test-003',
          value: 150,
          min: 30,
          max: 120
        }
      }
    ],
    warnings: [
      {
        type: 'INSUFFICIENT_APPLICATIONS',
        severity: 'warning',
        message: '高难度节点应用案例数量不足',
        details: {
          nodeIndex: 3,
          nodeId: 'node-advanced-001',
          difficulty: 4,
          count: 1,
          min: 2
        }
      },
      {
        type: 'INSUFFICIENT_KEYWORDS',
        severity: 'warning',
        message: '节点关键词数量不足',
        details: {
          nodeIndex: 4,
          nodeId: 'node-test-004',
          count: 2,
          min: 3
        }
      }
    ],
    summary: {
      totalErrors: 3,
      totalWarnings: 2,
      hasErrors: true,
      hasWarnings: true
    }
  },
  {
    fileName: 'edges-extended-phase2.json',
    success: false,
    errors: [
      {
        type: 'MISSING_NODE',
        severity: 'error',
        message: '边引用了不存在的source节点',
        details: {
          edgeIndex: 0,
          edgeId: 'edge-test-001',
          field: 'source',
          missingId: 'node-nonexistent-source'
        }
      },
      {
        type: 'INVALID_EDGE_TYPE',
        severity: 'error',
        message: '边类型无效',
        details: {
          edgeIndex: 1,
          edgeId: 'edge-test-002',
          value: 'invalid-type',
          validTypes: ['prerequisite', 'cross-domain', 'application']
        }
      }
    ],
    warnings: [],
    summary: {
      totalErrors: 2,
      totalWarnings: 0,
      hasErrors: true,
      hasWarnings: false
    }
  },
  {
    fileName: 'applications-extended-phase2.json',
    success: false,
    errors: [
      {
        type: 'INSUFFICIENT_CODE_LENGTH',
        severity: 'error',
        message: '应用案例代码长度不足',
        details: {
          appIndex: 0,
          appId: 'app-test-001',
          length: 30,
          minLength: 50
        }
      }
    ],
    warnings: [],
    summary: {
      totalErrors: 1,
      totalWarnings: 0,
      hasErrors: true,
      hasWarnings: false
    }
  }
];

// 生成HTML报告
console.log('\n生成HTML格式报告...');
const htmlReport = validator.generateReport(mockResults, { format: 'html' });
const htmlOutputPath = path.join(__dirname, 'test-validation-report.html');
fs.writeFileSync(htmlOutputPath, htmlReport, 'utf8');
console.log(`✓ HTML报告已保存到: ${htmlOutputPath}`);

// 生成文本报告
console.log('\n生成文本格式报告...');
const textReport = validator.generateReport(mockResults, { format: 'text' });
const textOutputPath = path.join(__dirname, 'test-validation-report.txt');
fs.writeFileSync(textOutputPath, textReport, 'utf8');
console.log(`✓ 文本报告已保存到: ${textOutputPath}`);

// 在控制台显示文本报告
console.log('\n文本报告内容:');
console.log(textReport);

console.log('\n✓ 报告生成测试完成\n');

// 测试场景3: 测试空结果
console.log('测试 3: 空结果报告生成');
console.log('-'.repeat(60));

const emptyHtmlReport = validator.generateReport([], { format: 'html' });
console.log('HTML报告长度:', emptyHtmlReport.length, '字符');

const emptyTextReport = validator.generateReport([], { format: 'text' });
console.log('文本报告:');
console.log(emptyTextReport);

console.log('\n✓ 空结果测试完成\n');

// 测试场景4: 测试成功的验证结果（无错误）
console.log('测试 4: 成功验证报告（无错误）');
console.log('-'.repeat(60));

const successResults = [
  {
    fileName: 'nodes-extended-phase2.json',
    success: true,
    errors: [],
    warnings: [],
    summary: {
      totalErrors: 0,
      totalWarnings: 0,
      hasErrors: false,
      hasWarnings: false
    }
  }
];

const successReport = validator.generateReport(successResults, { format: 'text' });
console.log(successReport);

console.log('\n✓ 成功验证报告测试完成\n');

// 测试场景5: 测试统计摘要的准确性
console.log('测试 5: 统计摘要准确性');
console.log('-'.repeat(60));

// 计算预期的统计数据
const expectedErrors = mockResults.reduce((sum, r) => sum + (r.errors?.length || 0), 0);
const expectedWarnings = mockResults.reduce((sum, r) => sum + (r.warnings?.length || 0), 0);
const expectedFiles = mockResults.length;

console.log(`预期错误数: ${expectedErrors}`);
console.log(`预期警告数: ${expectedWarnings}`);
console.log(`预期文件数: ${expectedFiles}`);

// 验证报告中的统计数据
const reportHasCorrectStats = 
  htmlReport.includes(`<div class="stat-value" style="color: #d32f2f;">${expectedErrors}</div>`) &&
  htmlReport.includes(`<div class="stat-value" style="color: #f57c00;">${expectedWarnings}</div>`) &&
  htmlReport.includes(`<div class="stat-value">${expectedFiles}</div>`);

if (reportHasCorrectStats) {
  console.log('✓ 统计数据正确');
} else {
  console.log('✗ 统计数据不正确');
}

console.log('\n✓ 统计摘要测试完成\n');

// 总结
console.log('='.repeat(60));
console.log('所有测试完成！');
console.log('='.repeat(60));
console.log('\n生成的文件:');
console.log(`  - ${htmlOutputPath}`);
console.log(`  - ${textOutputPath}`);
console.log('\n请打开HTML文件查看完整的报告样式。');
