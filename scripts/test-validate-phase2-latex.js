#!/usr/bin/env node

/**
 * 测试脚本 - Phase 2节点LaTeX公式验证
 * 
 * 验证Phase 2节点数据中的LaTeX公式
 */

const fs = require('fs');
const path = require('path');
const DataValidator = require('./data-validator.js');

console.log('='.repeat(80));
console.log('Phase 2节点LaTeX公式验证');
console.log('='.repeat(80));
console.log();

// 读取Phase 2节点数据
const nodesPath = path.join(__dirname, '..', 'data', 'nodes-extended-phase2.json');

if (!fs.existsSync(nodesPath)) {
  console.log('❌ 错误: 找不到Phase 2节点数据文件');
  console.log(`   路径: ${nodesPath}`);
  process.exit(1);
}

const nodesData = JSON.parse(fs.readFileSync(nodesPath, 'utf-8'));
const nodes = nodesData.data || [];

console.log(`读取到 ${nodes.length} 个节点\n`);

// 创建验证器
const validator = new DataValidator();

// 统计信息
let totalNodes = 0;
let nodesWithFormula = 0;
let validFormulas = 0;
let invalidFormulas = 0;
const invalidFormulaDetails = [];

// 验证每个节点的公式
nodes.forEach((node, index) => {
  totalNodes++;
  
  if (node.formula) {
    nodesWithFormula++;
    const result = validator.validateLatex(node.formula);
    
    if (result.valid) {
      validFormulas++;
      console.log(`✓ 节点 ${index + 1}: ${node.name} (${node.id})`);
      console.log(`  公式: ${node.formula}`);
    } else {
      invalidFormulas++;
      console.log(`✗ 节点 ${index + 1}: ${node.name} (${node.id})`);
      console.log(`  公式: ${node.formula}`);
      console.log(`  错误:`);
      result.errors.forEach(err => console.log(`    - ${err}`));
      
      invalidFormulaDetails.push({
        nodeId: node.id,
        nodeName: node.name,
        formula: node.formula,
        errors: result.errors
      });
    }
    console.log();
  }
});

// 输出统计信息
console.log('='.repeat(80));
console.log('验证统计');
console.log('='.repeat(80));
console.log(`总节点数: ${totalNodes}`);
console.log(`包含公式的节点: ${nodesWithFormula} (${(nodesWithFormula / totalNodes * 100).toFixed(1)}%)`);
console.log(`有效公式: ${validFormulas} (${nodesWithFormula > 0 ? (validFormulas / nodesWithFormula * 100).toFixed(1) : 0}%)`);
console.log(`无效公式: ${invalidFormulas} (${nodesWithFormula > 0 ? (invalidFormulas / nodesWithFormula * 100).toFixed(1) : 0}%)`);

if (invalidFormulas > 0) {
  console.log();
  console.log('='.repeat(80));
  console.log('无效公式详情');
  console.log('='.repeat(80));
  invalidFormulaDetails.forEach((detail, index) => {
    console.log(`\n${index + 1}. ${detail.nodeName} (${detail.nodeId})`);
    console.log(`   公式: ${detail.formula}`);
    console.log(`   错误:`);
    detail.errors.forEach(err => console.log(`     - ${err}`));
  });
}

console.log();
console.log('='.repeat(80));
console.log(invalidFormulas === 0 ? '✓ 所有公式验证通过' : `✗ 发现 ${invalidFormulas} 个无效公式`);
console.log('='.repeat(80));

// 退出码
process.exit(invalidFormulas > 0 ? 1 : 0);
