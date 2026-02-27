/**
 * 测试Phase 2实际节点数据验证
 */

const fs = require('fs');
const path = require('path');
const DataValidator = require('./data-validator.js');

console.log('=== 验证Phase 2实际节点数据 ===\n');

const validator = new DataValidator();

// 读取Phase 2节点数据
const nodesPath = path.join(__dirname, '..', 'data', 'nodes-extended-phase2.json');

if (!fs.existsSync(nodesPath)) {
  console.log('⚠️  Phase 2节点数据文件不存在:', nodesPath);
  console.log('这是正常的，因为节点数据还未生成');
  console.log('Task 3.2验证器实现已完成，可以在生成节点数据后使用');
  process.exit(0);
}

try {
  const fileContent = fs.readFileSync(nodesPath, 'utf-8');
  const data = JSON.parse(fileContent);
  
  const nodes = data.data || data;
  
  console.log(`读取到 ${nodes.length} 个节点`);
  console.log('开始验证...\n');
  
  const result = validator.validateNodes(nodes);
  
  console.log('=== 验证结果 ===');
  console.log('状态:', result.success ? '✓ 通过' : '✗ 失败');
  console.log('错误数:', result.errors.length);
  console.log('警告数:', result.warnings.length);
  console.log();
  
  if (result.errors.length > 0) {
    console.log('=== 错误详情 ===');
    result.errors.forEach((error, index) => {
      console.log(`${index + 1}. [${error.type}] ${error.message}`);
      if (error.details) {
        console.log('   详情:', JSON.stringify(error.details, null, 2));
      }
    });
    console.log();
  }
  
  if (result.warnings.length > 0) {
    console.log('=== 警告详情 ===');
    result.warnings.forEach((warning, index) => {
      console.log(`${index + 1}. [${warning.type}] ${warning.message}`);
      if (warning.details) {
        console.log('   详情:', JSON.stringify(warning.details, null, 2));
      }
    });
    console.log();
  }
  
  // 生成HTML报告
  const report = validator.generateReport([result]);
  const reportPath = path.join(__dirname, '..', 'validation-report.html');
  fs.writeFileSync(reportPath, report);
  console.log('✓ 验证报告已生成:', reportPath);
  
} catch (error) {
  console.error('✗ 验证失败:', error.message);
  process.exit(1);
}
