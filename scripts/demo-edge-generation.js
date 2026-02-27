/**
 * 演示边关系生成功能
 * 使用实际的Phase 1数据（如果可用）或生成示例数据
 */

const fs = require('fs');
const path = require('path');
const ContentGenerator = require('./content-generator.js');

// 加载Phase 1节点数据
function loadPhase1Nodes() {
  const phase1Path = path.join(__dirname, '../data/nodes-extended-phase1.json');
  
  try {
    if (fs.existsSync(phase1Path)) {
      const data = JSON.parse(fs.readFileSync(phase1Path, 'utf8'));
      if (data.data && data.data.length > 0) {
        console.log(`✓ 加载了 ${data.data.length} 个Phase 1节点`);
        return data.data;
      }
    }
  } catch (error) {
    console.log(`⚠️  无法加载Phase 1数据: ${error.message}`);
  }
  
  return null;
}

// 生成示例节点数据（如果Phase 1数据不可用）
function generateSampleNodes() {
  console.log('生成示例节点数据...');
  
  const nodes = [];
  const domains = ['domain-1', 'domain-2', 'domain-3', 'domain-4', 'domain-5'];
  const topics = {
    'domain-1': ['极限', '导数', '微分', '泰勒展开', '曲率'],
    'domain-2': ['积分', '定积分', '不定积分', '曲线积分', '曲面积分'],
    'domain-3': ['梯度', '优化', '拉格朗日乘数', '变分法', '最优控制'],
    'domain-4': ['概率', '随机变量', '分布', '期望', '方差'],
    'domain-5': ['神经网络', '机器学习', '数据分析', '金融建模', '物理模拟']
  };
  
  let nodeId = 1;
  
  for (const domain of domains) {
    const domainTopics = topics[domain];
    const nodeCount = domain === 'domain-1' ? 15 : domain === 'domain-2' ? 12 : 10;
    
    for (let i = 0; i < nodeCount; i++) {
      const topic = domainTopics[i % domainTopics.length];
      const difficulty = Math.min(5, Math.floor(i / 3) + 1);
      
      nodes.push({
        id: `node-${String(nodeId++).padStart(3, '0')}`,
        name: `${topic}${i > 0 ? i : ''}`,
        nameEn: `${topic} ${i > 0 ? i : ''}`,
        domains: [domain],
        difficulty: difficulty,
        keywords: [topic, domain.replace('domain-', '学域')],
        realWorldApplications: difficulty >= 3 ? [
          {
            title: `${topic}的实际应用`,
            industry: ['人工智能', '金融', '工程', '医疗', '数据科学'][Math.floor(Math.random() * 5)],
            description: `${topic}在实际场景中的应用示例`
          }
        ] : []
      });
    }
  }
  
  console.log(`✓ 生成了 ${nodes.length} 个示例节点`);
  return nodes;
}

// 主演示函数
function demonstrateEdgeGeneration() {
  console.log('=== 边关系生成演示 ===\n');
  
  // 加载或生成节点数据
  let nodes = loadPhase1Nodes();
  if (!nodes || nodes.length === 0) {
    nodes = generateSampleNodes();
  }
  
  console.log(`\n使用 ${nodes.length} 个节点进行边关系生成\n`);
  
  // 创建ContentGenerator实例
  const generator = new ContentGenerator();
  
  // 配置边生成参数
  const config = {
    prerequisiteRatio: 0.7,   // 70%的节点有前置关系
    crossDomainRatio: 0.2,    // 20%的节点有跨域关系
    applicationRatio: 0.5     // 50%的节点有应用关系
  };
  
  console.log('边生成配置:');
  console.log(`  - 前置关系比例: ${config.prerequisiteRatio * 100}%`);
  console.log(`  - 跨域关系比例: ${config.crossDomainRatio * 100}%`);
  console.log(`  - 应用关系比例: ${config.applicationRatio * 100}%\n`);
  
  // 生成边关系
  const startTime = Date.now();
  const edges = generator.generateEdges(nodes, config);
  const duration = Date.now() - startTime;
  
  console.log(`\n边生成耗时: ${duration}ms\n`);
  
  // 统计分析
  console.log('=== 边关系统计 ===');
  
  const edgesByType = {
    prerequisite: edges.filter(e => e.type === 'prerequisite'),
    'cross-domain': edges.filter(e => e.type === 'cross-domain'),
    application: edges.filter(e => e.type === 'application')
  };
  
  console.log(`\n总边数: ${edges.length}`);
  console.log(`  - 前置关系边: ${edgesByType.prerequisite.length}`);
  console.log(`  - 跨域关系边: ${edgesByType['cross-domain'].length}`);
  console.log(`  - 应用关系边: ${edgesByType.application.length}`);
  
  // 计算覆盖率
  const nodesWithPrereq = new Set(edgesByType.prerequisite.map(e => e.target)).size;
  const nodesWithCrossDomain = new Set([
    ...edgesByType['cross-domain'].map(e => e.source),
    ...edgesByType['cross-domain'].map(e => e.target)
  ]).size;
  const nodesWithApp = new Set(edgesByType.application.map(e => e.source)).size;
  
  console.log(`\n节点覆盖率:`);
  console.log(`  - 有前置关系的节点: ${nodesWithPrereq} (${(nodesWithPrereq / nodes.length * 100).toFixed(1)}%)`);
  console.log(`  - 有跨域关系的节点: ${nodesWithCrossDomain} (${(nodesWithCrossDomain / nodes.length * 100).toFixed(1)}%)`);
  console.log(`  - 有应用关系的节点: ${nodesWithApp} (${(nodesWithApp / nodes.length * 100).toFixed(1)}%)`);
  
  // 强度统计
  const avgStrength = {
    prerequisite: edgesByType.prerequisite.reduce((sum, e) => sum + e.strength, 0) / edgesByType.prerequisite.length,
    'cross-domain': edgesByType['cross-domain'].reduce((sum, e) => sum + e.strength, 0) / edgesByType['cross-domain'].length,
    application: edgesByType.application.reduce((sum, e) => sum + e.strength, 0) / edgesByType.application.length
  };
  
  console.log(`\n平均边强度:`);
  console.log(`  - 前置关系: ${avgStrength.prerequisite.toFixed(3)}`);
  console.log(`  - 跨域关系: ${avgStrength['cross-domain'].toFixed(3)}`);
  console.log(`  - 应用关系: ${avgStrength.application.toFixed(3)}`);
  
  // 显示每种类型的示例
  console.log('\n=== 边关系示例 ===');
  
  if (edgesByType.prerequisite.length > 0) {
    console.log('\n1. 前置关系边示例:');
    const example = edgesByType.prerequisite[0];
    const sourceNode = nodes.find(n => n.id === example.source);
    const targetNode = nodes.find(n => n.id === example.target);
    console.log(`   ${sourceNode?.name || example.source} → ${targetNode?.name || example.target}`);
    console.log(`   强度: ${example.strength.toFixed(3)}`);
    console.log(`   描述: ${example.description}`);
  }
  
  if (edgesByType['cross-domain'].length > 0) {
    console.log('\n2. 跨域关系边示例:');
    const example = edgesByType['cross-domain'][0];
    const sourceNode = nodes.find(n => n.id === example.source);
    const targetNode = nodes.find(n => n.id === example.target);
    console.log(`   ${sourceNode?.name || example.source} ↔ ${targetNode?.name || example.target}`);
    console.log(`   强度: ${example.strength.toFixed(3)}`);
    console.log(`   描述: ${example.description}`);
    console.log(`   主题: ${example.metadata.topic}`);
  }
  
  if (edgesByType.application.length > 0) {
    console.log('\n3. 应用关系边示例:');
    const example = edgesByType.application[0];
    const sourceNode = nodes.find(n => n.id === example.source);
    console.log(`   ${sourceNode?.name || example.source} → ${example.metadata.applicationTitle}`);
    console.log(`   强度: ${example.strength.toFixed(3)}`);
    console.log(`   行业: ${example.metadata.industry}`);
    console.log(`   描述: ${example.description}`);
  }
  
  // 保存结果（可选）
  const outputPath = path.join(__dirname, '../data/edges-demo-output.json');
  const output = {
    metadata: {
      version: '2.0',
      phase: 'Phase 2 - 边关系生成演示',
      totalItems: edges.length,
      createdDate: new Date().toISOString().split('T')[0],
      description: '边关系生成演示输出',
      nodeCount: nodes.length,
      generationTime: duration
    },
    data: edges
  };
  
  try {
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`\n✓ 边关系数据已保存到: ${outputPath}`);
  } catch (error) {
    console.log(`\n⚠️  无法保存边关系数据: ${error.message}`);
  }
  
  console.log('\n=== 演示完成 ===\n');
  
  return {
    edges,
    stats: {
      total: edges.length,
      byType: {
        prerequisite: edgesByType.prerequisite.length,
        crossDomain: edgesByType['cross-domain'].length,
        application: edgesByType.application.length
      },
      coverage: {
        prerequisite: nodesWithPrereq / nodes.length,
        crossDomain: nodesWithCrossDomain / nodes.length,
        application: nodesWithApp / nodes.length
      },
      avgStrength
    }
  };
}

// 运行演示
if (require.main === module) {
  demonstrateEdgeGeneration();
}

module.exports = { demonstrateEdgeGeneration };
