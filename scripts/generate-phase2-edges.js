/**
 * 生成Phase 2的边关系网络
 * - 前置关系边（prerequisite）
 * - 跨域关系边（cross-domain）
 * - 应用关系边（application）
 */

const fs = require('fs');

// 读取节点数据
const nodesData = JSON.parse(fs.readFileSync('data/nodes-extended-phase2.json', 'utf8'));
const nodes = nodesData.data;

console.log('开始生成Phase 2边关系...\n');
console.log(`节点总数: ${nodes.length}`);

const edges = [];
let edgeIdCounter = 1;

// 1. 生成前置关系边（prerequisite）
console.log('\n生成前置关系边...');
let prerequisiteCount = 0;

nodes.forEach((node, index) => {
  // 70%的节点有前置关系
  if (Math.random() < 0.7 && index > 0) {
    // 选择1-2个前置节点（难度更低的）
    const numPrereqs = Math.random() < 0.7 ? 1 : 2;
    const possiblePrereqs = nodes.slice(0, index).filter(n => 
      n.difficulty <= node.difficulty && 
      n.domains[0] === node.domains[0]
    );
    
    if (possiblePrereqs.length > 0) {
      for (let i = 0; i < Math.min(numPrereqs, possiblePrereqs.length); i++) {
        const prereq = possiblePrereqs[Math.floor(Math.random() * possiblePrereqs.length)];
        edges.push({
          id: `edge-phase2-${edgeIdCounter++}`,
          source: prereq.id,
          target: node.id,
          type: 'prerequisite',
          strength: 0.7 + Math.random() * 0.3,
          description: `${prereq.name}是${node.name}的前置知识`
        });
        prerequisiteCount++;
      }
    }
  }
});

console.log(`✓ 生成了 ${prerequisiteCount} 条前置关系边`);

// 2. 生成跨域关系边（cross-domain）
console.log('\n生成跨域关系边...');
let crossDomainCount = 0;

// 识别可能的跨域关系
const crossDomainPairs = [
  { keywords: ['优化', '极值'], domains: ['domain-1', 'domain-3'] },
  { keywords: ['积分', '微分方程'], domains: ['domain-2', 'domain-1'] },
  { keywords: ['概率', '统计'], domains: ['domain-4', 'domain-2'] },
  { keywords: ['向量', '场'], domains: ['domain-3', 'domain-2'] }
];

nodes.forEach(node => {
  // 20%的节点有跨域关系
  if (Math.random() < 0.2) {
    crossDomainPairs.forEach(pair => {
      if (pair.keywords.some(kw => node.name.includes(kw) || node.keywords.some(k => k.includes(kw)))) {
        // 找到其他domain的相关节点
        const relatedNodes = nodes.filter(n => 
          n.id !== node.id &&
          n.domains[0] !== node.domains[0] &&
          pair.domains.includes(n.domains[0]) &&
          pair.keywords.some(kw => n.name.includes(kw) || n.keywords.some(k => k.includes(kw)))
        );
        
        if (relatedNodes.length > 0) {
          const related = relatedNodes[Math.floor(Math.random() * relatedNodes.length)];
          edges.push({
            id: `edge-phase2-${edgeIdCounter++}`,
            source: node.id,
            target: related.id,
            type: 'cross-domain',
            strength: 0.5 + Math.random() * 0.3,
            description: `${node.name}与${related.name}有跨域关联`
          });
          crossDomainCount++;
        }
      }
    });
  }
});

console.log(`✓ 生成了 ${crossDomainCount} 条跨域关系边`);

// 3. 生成应用关系边（application）
console.log('\n生成应用关系边...');
let applicationCount = 0;

nodes.forEach(node => {
  // 50%的节点有应用关系
  if (Math.random() < 0.5 && node.realWorldApplications && node.realWorldApplications.length > 0) {
    // 为每个应用案例创建一条边
    node.realWorldApplications.forEach((app, appIndex) => {
      edges.push({
        id: `edge-phase2-${edgeIdCounter++}`,
        source: node.id,
        target: `application-${node.id}-${appIndex}`,
        type: 'application',
        strength: 0.8 + Math.random() * 0.2,
        description: `${node.name}应用于${app.industry}`
      });
      applicationCount++;
    });
  }
});

console.log(`✓ 生成了 ${applicationCount} 条应用关系边`);

// 统计
console.log('\n' + '='.repeat(60));
console.log('边关系生成完成！');
console.log(`总边数: ${edges.length}`);
console.log(`  前置关系: ${prerequisiteCount} (${(prerequisiteCount/edges.length*100).toFixed(1)}%)`);
console.log(`  跨域关系: ${crossDomainCount} (${(crossDomainCount/edges.length*100).toFixed(1)}%)`);
console.log(`  应用关系: ${applicationCount} (${(applicationCount/edges.length*100).toFixed(1)}%)`);
console.log('='.repeat(60));

// 保存到文件
const output = {
  metadata: {
    version: '2.0',
    phase: 'Phase 2 - 内容深度扩展',
    totalItems: edges.length,
    createdDate: new Date().toISOString().split('T')[0],
    description: 'Phase 2节点的边关系网络',
    author: 'EdgeGenerator',
    edgeTypes: {
      prerequisite: prerequisiteCount,
      'cross-domain': crossDomainCount,
      application: applicationCount
    }
  },
  data: edges
};

fs.writeFileSync('data/edges-extended-phase2.json', JSON.stringify(output, null, 2));
console.log('\n✓ 已保存到 data/edges-extended-phase2.json');
