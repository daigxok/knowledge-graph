/**
 * 演示DataValidator的报告生成功能
 * 
 * 展示如何:
 * 1. 验证多个数据文件
 * 2. 生成综合验证报告
 * 3. 保存HTML和文本格式报告
 */

const DataValidator = require('./data-validator.js');
const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('DataValidator 报告生成演示');
console.log('='.repeat(60));
console.log();

// 创建验证器实例
const validator = new DataValidator();

// 加载数据文件
console.log('加载数据文件...');

let nodesData = [];
let edgesData = [];
let appsData = [];

try {
  // 尝试加载Phase 2数据文件
  const nodesPath = path.join(__dirname, '../data/nodes-extended-phase2.json');
  const edgesPath = path.join(__dirname, '../data/edges-extended-phase2.json');
  const appsPath = path.join(__dirname, '../data/applications-extended-phase2.json');

  if (fs.existsSync(nodesPath)) {
    const nodesContent = JSON.parse(fs.readFileSync(nodesPath, 'utf8'));
    nodesData = nodesContent.data || nodesContent;
    console.log(`✓ 加载了 ${nodesData.length} 个节点`);
  } else {
    console.log('⚠ nodes-extended-phase2.json 文件不存在，使用模拟数据');
    nodesData = [
      {
        id: 'node-demo-001',
        name: '演示节点1',
        nameEn: 'Demo Node 1',
        description: '这是一个演示节点',
        domains: ['domain-1'],
        difficulty: 3,
        prerequisites: [],
        relatedSkills: ['skill-1'],
        keywords: ['演示', '测试', '示例'],
        estimatedStudyTime: 60,
        realWorldApplications: [
          { title: 'App 1', description: 'Desc 1', industry: 'Tech' }
        ]
      },
      {
        id: 'node-demo-002',
        name: '演示节点2',
        nameEn: 'Demo Node 2',
        description: '这是另一个演示节点',
        domains: ['domain-2'],
        difficulty: 4,
        prerequisites: ['node-demo-001'],
        relatedSkills: ['skill-2'],
        keywords: ['高级', '演示'],
        estimatedStudyTime: 90,
        realWorldApplications: [
          { title: 'App 2', description: 'Desc 2', industry: 'Finance' }
        ]
      }
    ];
  }

  if (fs.existsSync(edgesPath)) {
    const edgesContent = JSON.parse(fs.readFileSync(edgesPath, 'utf8'));
    edgesData = edgesContent.data || edgesContent;
    console.log(`✓ 加载了 ${edgesData.length} 条边`);
  } else {
    console.log('⚠ edges-extended-phase2.json 文件不存在，使用模拟数据');
    edgesData = [
      {
        id: 'edge-demo-001',
        source: 'node-demo-001',
        target: 'node-demo-002',
        type: 'prerequisite',
        strength: 0.8
      }
    ];
  }

  if (fs.existsSync(appsPath)) {
    const appsContent = JSON.parse(fs.readFileSync(appsPath, 'utf8'));
    appsData = appsContent.data || appsContent;
    console.log(`✓ 加载了 ${appsData.length} 个应用案例`);
  } else {
    console.log('⚠ applications-extended-phase2.json 文件不存在，使用模拟数据');
    appsData = [
      {
        id: 'app-demo-001',
        title: '演示应用案例',
        industry: '人工智能',
        difficulty: 3,
        relatedNodes: ['node-demo-001'],
        description: '这是一个演示应用案例',
        mathematicalConcepts: ['概念1', '概念2'],
        problemStatement: '问题描述',
        solution: { steps: ['步骤1', '步骤2'] },
        code: {
          language: 'python',
          implementation: 'def demo():\n    print("Hello, World!")\n    return 42'
        },
        visualization: { type: 'chart' }
      }
    ];
  }
} catch (error) {
  console.error('加载数据文件时出错:', error.message);
  process.exit(1);
}

console.log();

// 执行验证
console.log('执行数据验证...');
console.log('-'.repeat(60));

const results = [];

// 验证节点
console.log('\n1. 验证节点数据...');
const nodesResult = validator.validateNodes(nodesData);
nodesResult.fileName = 'nodes-extended-phase2.json';
results.push(nodesResult);
console.log(`   错误: ${nodesResult.errors.length}, 警告: ${nodesResult.warnings.length}`);

// 验证边
console.log('\n2. 验证边数据...');
const edgesResult = validator.validateEdges(edgesData, nodesData);
edgesResult.fileName = 'edges-extended-phase2.json';
results.push(edgesResult);
console.log(`   错误: ${edgesResult.errors.length}, 警告: ${edgesResult.warnings.length}`);

// 验证应用案例
console.log('\n3. 验证应用案例数据...');
const appsResult = validator.validateApplications(appsData, nodesData);
appsResult.fileName = 'applications-extended-phase2.json';
results.push(appsResult);
console.log(`   错误: ${appsResult.errors.length}, 警告: ${appsResult.warnings.length}`);

// 检测循环依赖
console.log('\n4. 检测循环依赖...');
const cycles = validator.detectCycles(edgesData);
if (cycles.length > 0) {
  console.log(`   发现 ${cycles.length} 个循环依赖`);
  cycles.forEach((cycle, index) => {
    console.log(`   循环 ${index + 1}: ${cycle.join(' → ')}`);
  });
  
  // 将循环依赖添加到结果中
  const cycleResult = {
    fileName: 'edges-extended-phase2.json',
    success: false,
    errors: cycles.map(cycle => ({
      type: 'CIRCULAR_DEPENDENCY',
      severity: 'error',
      message: '检测到循环依赖',
      details: { cycle }
    })),
    warnings: [],
    summary: {
      totalErrors: cycles.length,
      totalWarnings: 0,
      hasErrors: true,
      hasWarnings: false
    }
  };
  results.push(cycleResult);
} else {
  console.log('   ✓ 未发现循环依赖');
}

console.log();
console.log('-'.repeat(60));

// 生成报告
console.log('\n生成验证报告...');

// 生成HTML报告
const htmlReport = validator.generateReport(results, { format: 'html' });
const htmlPath = path.join(__dirname, 'validation-report.html');
fs.writeFileSync(htmlPath, htmlReport, 'utf8');
console.log(`✓ HTML报告已保存: ${htmlPath}`);

// 生成文本报告
const textReport = validator.generateReport(results, { format: 'text' });
const textPath = path.join(__dirname, 'validation-report.txt');
fs.writeFileSync(textPath, textReport, 'utf8');
console.log(`✓ 文本报告已保存: ${textPath}`);

// 显示摘要
console.log();
console.log('='.repeat(60));
console.log('验证摘要');
console.log('='.repeat(60));

const totalErrors = results.reduce((sum, r) => sum + (r.errors?.length || 0), 0);
const totalWarnings = results.reduce((sum, r) => sum + (r.warnings?.length || 0), 0);

console.log(`总错误数: ${totalErrors}`);
console.log(`总警告数: ${totalWarnings}`);
console.log(`验证文件数: ${results.length}`);
console.log(`状态: ${totalErrors === 0 ? '✓ 通过' : '✗ 失败'}`);

if (totalErrors > 0 || totalWarnings > 0) {
  console.log();
  console.log('请查看生成的报告文件了解详细信息:');
  console.log(`  - HTML报告: ${htmlPath}`);
  console.log(`  - 文本报告: ${textPath}`);
}

console.log();
console.log('='.repeat(60));
console.log('演示完成！');
console.log('='.repeat(60));
