/**
 * 测试Phase 2数据的循环依赖检测
 * 
 * 加载实际的Phase 2边数据，检测是否存在循环依赖
 */

const fs = require('fs');
const path = require('path');
const DataValidator = require('./data-validator.js');

console.log('========================================');
console.log('Phase 2 数据循环依赖检测');
console.log('========================================\n');

// 加载Phase 2边数据
const edgesPath = path.join(__dirname, '../data/edges-extended-phase2.json');

if (!fs.existsSync(edgesPath)) {
  console.log('⚠️  edges-extended-phase2.json 文件不存在');
  console.log('这是正常的，因为边数据还未生成');
  console.log('当Task 11完成后，可以运行此脚本验证边数据\n');
  process.exit(0);
}

try {
  const edgesData = JSON.parse(fs.readFileSync(edgesPath, 'utf-8'));
  const edges = edgesData.data || edgesData;
  
  console.log(`加载了 ${edges.length} 条边关系`);
  
  // 统计边类型
  const edgeTypes = {};
  edges.forEach(edge => {
    edgeTypes[edge.type] = (edgeTypes[edge.type] || 0) + 1;
  });
  
  console.log('\n边类型统计:');
  Object.entries(edgeTypes).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count} 条`);
  });
  
  // 检测循环依赖
  console.log('\n开始检测循环依赖...');
  const validator = new DataValidator();
  const cycles = validator.detectCycles(edges);
  
  console.log('\n========================================');
  console.log('检测结果');
  console.log('========================================\n');
  
  if (cycles.length === 0) {
    console.log('✓ 未检测到循环依赖');
    console.log('所有前置关系边都是有向无环图(DAG)');
    console.log('学习路径是有效的\n');
  } else {
    console.log(`✗ 检测到 ${cycles.length} 个循环依赖:\n`);
    
    cycles.forEach((cycle, index) => {
      console.log(`循环 ${index + 1}:`);
      console.log(`  路径: ${cycle.join(' -> ')}`);
      console.log(`  长度: ${cycle.length - 1} 条边\n`);
    });
    
    console.log('建议修复方案:');
    console.log('1. 检查每个循环中的前置关系是否合理');
    console.log('2. 移除不必要的前置关系边');
    console.log('3. 考虑将某些边改为cross-domain或application类型');
    console.log('4. 重新运行Content_Generator生成边数据\n');
  }
  
  // 生成详细报告
  console.log('========================================');
  console.log('详细分析');
  console.log('========================================\n');
  
  // 统计prerequisite边
  const prerequisiteEdges = edges.filter(e => e.type === 'prerequisite');
  console.log(`Prerequisite边数量: ${prerequisiteEdges.length}`);
  
  // 构建图统计
  const graph = new Map();
  prerequisiteEdges.forEach(edge => {
    if (!graph.has(edge.source)) {
      graph.set(edge.source, []);
    }
    graph.get(edge.source).push(edge.target);
  });
  
  console.log(`图中节点数量: ${graph.size}`);
  
  // 统计出度
  const outDegrees = Array.from(graph.values()).map(neighbors => neighbors.length);
  const avgOutDegree = outDegrees.reduce((a, b) => a + b, 0) / outDegrees.length;
  const maxOutDegree = Math.max(...outDegrees);
  
  console.log(`平均出度: ${avgOutDegree.toFixed(2)}`);
  console.log(`最大出度: ${maxOutDegree}`);
  
  console.log('\n检测完成！');
  
} catch (error) {
  console.error('✗ 加载或解析数据时出错:', error.message);
  process.exit(1);
}
