/**
 * 测试边关系生成功能
 * 验证Task 2.4的实现
 */

const ContentGenerator = require('./content-generator.js');

// 创建测试节点数据
function createTestNodes() {
  const nodes = [];
  
  // Domain-1: 5个节点，难度1-5
  for (let i = 1; i <= 5; i++) {
    nodes.push({
      id: `node-domain1-${i}`,
      name: `Domain1节点${i}`,
      nameEn: `Domain1 Node ${i}`,
      domains: ['domain-1'],
      difficulty: i,
      keywords: ['导数', '极限', '微分'],
      realWorldApplications: i >= 3 ? [
        { title: `应用案例${i}`, industry: '人工智能', description: '测试应用' }
      ] : []
    });
  }
  
  // Domain-2: 5个节点，难度2-5
  for (let i = 1; i <= 5; i++) {
    nodes.push({
      id: `node-domain2-${i}`,
      name: `Domain2节点${i}`,
      nameEn: `Domain2 Node ${i}`,
      domains: ['domain-2'],
      difficulty: i + 1,
      keywords: ['积分', '面积', '累积'],
      realWorldApplications: i >= 3 ? [
        { title: `积分应用${i}`, industry: '工程', description: '测试应用' }
      ] : []
    });
  }
  
  // Domain-3: 5个节点，难度3-5
  for (let i = 1; i <= 5; i++) {
    nodes.push({
      id: `node-domain3-${i}`,
      name: `Domain3节点${i}`,
      nameEn: `Domain3 Node ${i}`,
      domains: ['domain-3'],
      difficulty: i + 2,
      keywords: ['优化', '极值', '梯度'],
      realWorldApplications: i >= 2 ? [
        { title: `优化应用${i}`, industry: '金融', description: '测试应用' }
      ] : []
    });
  }
  
  // Domain-4: 3个节点
  for (let i = 1; i <= 3; i++) {
    nodes.push({
      id: `node-domain4-${i}`,
      name: `Domain4节点${i}`,
      nameEn: `Domain4 Node ${i}`,
      domains: ['domain-4'],
      difficulty: i + 2,
      keywords: ['概率', '分布', '随机'],
      realWorldApplications: [
        { title: `概率应用${i}`, industry: '数据科学', description: '测试应用' }
      ]
    });
  }
  
  return nodes;
}

// 测试边生成功能
function testEdgeGeneration() {
  console.log('=== 测试边关系生成功能 ===\n');
  
  const nodes = createTestNodes();
  console.log(`创建了 ${nodes.length} 个测试节点\n`);
  
  const generator = new ContentGenerator();
  const config = {
    prerequisiteRatio: 0.7,
    crossDomainRatio: 0.2,
    applicationRatio: 0.5
  };
  
  const edges = generator.generateEdges(nodes, config);
  
  console.log('\n=== 边生成统计 ===');
  console.log(`总边数: ${edges.length}`);
  
  // 按类型统计
  const edgesByType = {
    prerequisite: edges.filter(e => e.type === 'prerequisite'),
    'cross-domain': edges.filter(e => e.type === 'cross-domain'),
    application: edges.filter(e => e.type === 'application')
  };
  
  console.log(`\n按类型统计:`);
  console.log(`  - 前置关系边 (prerequisite): ${edgesByType.prerequisite.length}`);
  console.log(`  - 跨域关系边 (cross-domain): ${edgesByType['cross-domain'].length}`);
  console.log(`  - 应用关系边 (application): ${edgesByType.application.length}`);
  
  // 验证前置关系边
  console.log('\n=== 验证前置关系边 ===');
  let validPrereqCount = 0;
  for (const edge of edgesByType.prerequisite) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (sourceNode && targetNode) {
      if (sourceNode.difficulty < targetNode.difficulty) {
        validPrereqCount++;
      } else {
        console.log(`⚠️  警告: 前置关系边 ${edge.id} 的难度不正确`);
        console.log(`   Source: ${sourceNode.name} (难度${sourceNode.difficulty})`);
        console.log(`   Target: ${targetNode.name} (难度${targetNode.difficulty})`);
      }
    }
  }
  console.log(`✓ ${validPrereqCount}/${edgesByType.prerequisite.length} 条前置关系边的难度关系正确`);
  
  // 验证跨域关系边
  console.log('\n=== 验证跨域关系边 ===');
  let validCrossDomainCount = 0;
  for (const edge of edgesByType['cross-domain']) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (sourceNode && targetNode) {
      const differentDomains = !sourceNode.domains.some(d => targetNode.domains.includes(d));
      if (differentDomains) {
        validCrossDomainCount++;
      } else {
        console.log(`⚠️  警告: 跨域关系边 ${edge.id} 连接了相同domain的节点`);
      }
    }
  }
  console.log(`✓ ${validCrossDomainCount}/${edgesByType['cross-domain'].length} 条跨域关系边连接了不同domain`);
  
  // 验证应用关系边
  console.log('\n=== 验证应用关系边 ===');
  let validAppCount = 0;
  for (const edge of edgesByType.application) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    if (sourceNode && sourceNode.realWorldApplications.length > 0) {
      validAppCount++;
    }
  }
  console.log(`✓ ${validAppCount}/${edgesByType.application.length} 条应用关系边的源节点有应用案例`);
  
  // 验证边的必需字段
  console.log('\n=== 验证边数据完整性 ===');
  const requiredFields = ['id', 'source', 'target', 'type', 'strength', 'description', 'metadata'];
  let validEdgeCount = 0;
  
  for (const edge of edges) {
    const hasAllFields = requiredFields.every(field => field in edge);
    const validStrength = edge.strength >= 0 && edge.strength <= 1;
    const validType = ['prerequisite', 'cross-domain', 'application'].includes(edge.type);
    
    if (hasAllFields && validStrength && validType) {
      validEdgeCount++;
    } else {
      console.log(`⚠️  警告: 边 ${edge.id} 数据不完整或无效`);
      if (!hasAllFields) console.log(`   缺少字段`);
      if (!validStrength) console.log(`   strength值无效: ${edge.strength}`);
      if (!validType) console.log(`   type值无效: ${edge.type}`);
    }
  }
  console.log(`✓ ${validEdgeCount}/${edges.length} 条边数据完整且有效`);
  
  // 验证比例
  console.log('\n=== 验证边生成比例 ===');
  const nodesWithPrereq = new Set(edgesByType.prerequisite.map(e => e.target)).size;
  const prereqRatio = nodesWithPrereq / nodes.length;
  console.log(`前置关系覆盖率: ${(prereqRatio * 100).toFixed(1)}% (目标: 70%)`);
  
  const nodesWithCrossDomain = new Set([
    ...edgesByType['cross-domain'].map(e => e.source),
    ...edgesByType['cross-domain'].map(e => e.target)
  ]).size;
  const crossDomainRatio = nodesWithCrossDomain / nodes.length;
  console.log(`跨域关系覆盖率: ${(crossDomainRatio * 100).toFixed(1)}% (目标: 20%)`);
  
  const nodesWithApp = new Set(edgesByType.application.map(e => e.source)).size;
  const appRatio = nodesWithApp / nodes.length;
  console.log(`应用关系覆盖率: ${(appRatio * 100).toFixed(1)}% (目标: 50%)`);
  
  // 显示示例边
  console.log('\n=== 示例边数据 ===');
  if (edgesByType.prerequisite.length > 0) {
    console.log('\n前置关系边示例:');
    console.log(JSON.stringify(edgesByType.prerequisite[0], null, 2));
  }
  
  if (edgesByType['cross-domain'].length > 0) {
    console.log('\n跨域关系边示例:');
    console.log(JSON.stringify(edgesByType['cross-domain'][0], null, 2));
  }
  
  if (edgesByType.application.length > 0) {
    console.log('\n应用关系边示例:');
    console.log(JSON.stringify(edgesByType.application[0], null, 2));
  }
  
  console.log('\n=== 测试完成 ===');
  
  return {
    success: validEdgeCount === edges.length,
    edges: edges,
    stats: {
      total: edges.length,
      byType: {
        prerequisite: edgesByType.prerequisite.length,
        crossDomain: edgesByType['cross-domain'].length,
        application: edgesByType.application.length
      },
      ratios: {
        prerequisite: prereqRatio,
        crossDomain: crossDomainRatio,
        application: appRatio
      }
    }
  };
}

// 运行测试
if (require.main === module) {
  const result = testEdgeGeneration();
  process.exit(result.success ? 0 : 1);
}

module.exports = { testEdgeGeneration, createTestNodes };
