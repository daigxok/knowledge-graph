/**
 * Phase 1 数据整合脚本
 * 合并所有Phase 1节点和边关系到主数据文件
 */

const fs = require('fs');
const path = require('path');

// 文件路径
const DATA_DIR = path.join(__dirname, 'data');
const NODES_FILE = path.join(DATA_DIR, 'nodes.json');
const EDGES_FILE = path.join(DATA_DIR, 'edges.json');

// Phase 1 数据文件
const PHASE1_FILES = {
  nodes: [
    'nodes-extended-phase1.json',
    'nodes-extended-phase1-part2.json',
    'nodes-extended-phase1-part3.json',
    'nodes-extended-phase1-part4.json'
  ],
  edges: 'edges-extended-phase1.json'
};

/**
 * 读取JSON文件
 */
function readJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 写入JSON文件
 */
function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Successfully wrote ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * 合并Phase 1节点数据
 */
function mergeNodes() {
  console.log('\n📦 Merging Phase 1 nodes...\n');
  
  // 读取现有节点
  const existingData = readJSON(NODES_FILE);
  if (!existingData) {
    console.error('❌ Failed to read existing nodes.json');
    return false;
  }
  
  const existingNodes = existingData.nodes || [];
  console.log(`Current nodes: ${existingNodes.length}`);
  
  // 读取所有Phase 1节点
  let phase1Nodes = [];
  let totalAdded = 0;
  
  for (const file of PHASE1_FILES.nodes) {
    const filePath = path.join(DATA_DIR, file);
    const data = readJSON(filePath);
    
    if (data && data.newNodes) {
      phase1Nodes = phase1Nodes.concat(data.newNodes);
      console.log(`✅ ${file}: ${data.newNodes.length} nodes`);
      totalAdded += data.newNodes.length;
    } else {
      console.log(`⚠️  ${file}: No nodes found`);
    }
  }
  
  console.log(`\nTotal Phase 1 nodes: ${totalAdded}`);
  
  // 检查重复ID
  const existingIds = new Set(existingNodes.map(n => n.id));
  const duplicates = phase1Nodes.filter(n => existingIds.has(n.id));
  
  if (duplicates.length > 0) {
    console.warn(`\n⚠️  Found ${duplicates.length} duplicate node IDs:`);
    duplicates.forEach(n => console.warn(`   - ${n.id}`));
    console.log('\nSkipping duplicates...');
    phase1Nodes = phase1Nodes.filter(n => !existingIds.has(n.id));
  }
  
  // 合并节点
  const mergedNodes = [...existingNodes, ...phase1Nodes];
  
  // 更新元数据
  const updatedData = {
    ...existingData,
    nodes: mergedNodes,
    metadata: {
      ...existingData.metadata,
      totalNodes: mergedNodes.length,
      lastUpdated: new Date().toISOString(),
      phase1NodesAdded: phase1Nodes.length,
      phase1CompletionDate: '2026-02-22'
    }
  };
  
  // 写入文件
  if (writeJSON(NODES_FILE, updatedData)) {
    console.log(`\n✅ Nodes merged successfully!`);
    console.log(`   Total nodes: ${mergedNodes.length}`);
    console.log(`   New nodes added: ${phase1Nodes.length}`);
    return true;
  }
  
  return false;
}

/**
 * 合并Phase 1边关系数据
 */
function mergeEdges() {
  console.log('\n🔗 Merging Phase 1 edges...\n');
  
  // 读取现有边关系
  const existingData = readJSON(EDGES_FILE);
  if (!existingData) {
    console.error('❌ Failed to read existing edges.json');
    return false;
  }
  
  const existingEdges = existingData.edges || [];
  console.log(`Current edges: ${existingEdges.length}`);
  
  // 读取Phase 1边关系
  const phase1File = path.join(DATA_DIR, PHASE1_FILES.edges);
  const phase1Data = readJSON(phase1File);
  
  if (!phase1Data || !phase1Data.newEdges) {
    console.error('❌ Failed to read Phase 1 edges');
    return false;
  }
  
  const phase1Edges = phase1Data.newEdges;
  console.log(`Phase 1 edges: ${phase1Edges.length}`);
  
  // 检查重复ID
  const existingIds = new Set(existingEdges.map(e => e.id));
  const duplicates = phase1Edges.filter(e => existingIds.has(e.id));
  
  if (duplicates.length > 0) {
    console.warn(`\n⚠️  Found ${duplicates.length} duplicate edge IDs:`);
    duplicates.forEach(e => console.warn(`   - ${e.id}`));
    console.log('\nSkipping duplicates...');
  }
  
  const newEdges = phase1Edges.filter(e => !existingIds.has(e.id));
  
  // 合并边关系
  const mergedEdges = [...existingEdges, ...newEdges];
  
  // 更新元数据
  const updatedData = {
    ...existingData,
    edges: mergedEdges,
    metadata: {
      ...existingData.metadata,
      totalEdges: mergedEdges.length,
      lastUpdated: new Date().toISOString(),
      phase1EdgesAdded: newEdges.length,
      phase1CompletionDate: '2026-02-22'
    }
  };
  
  // 写入文件
  if (writeJSON(EDGES_FILE, updatedData)) {
    console.log(`\n✅ Edges merged successfully!`);
    console.log(`   Total edges: ${mergedEdges.length}`);
    console.log(`   New edges added: ${newEdges.length}`);
    return true;
  }
  
  return false;
}

/**
 * 生成统计报告
 */
function generateReport() {
  console.log('\n📊 Generating integration report...\n');
  
  const nodesData = readJSON(NODES_FILE);
  const edgesData = readJSON(EDGES_FILE);
  
  if (!nodesData || !edgesData) {
    console.error('❌ Failed to generate report');
    return;
  }
  
  const nodes = nodesData.nodes || [];
  const edges = edgesData.edges || [];
  
  // 按学域统计节点
  const domainStats = {};
  nodes.forEach(node => {
    const domain = node.domain || 'unknown';
    domainStats[domain] = (domainStats[domain] || 0) + 1;
  });
  
  // 按类型统计边
  const edgeTypeStats = {};
  edges.forEach(edge => {
    const type = edge.type || 'unknown';
    edgeTypeStats[type] = (edgeTypeStats[type] || 0) + 1;
  });
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      phase1NodesAdded: nodesData.metadata?.phase1NodesAdded || 0,
      phase1EdgesAdded: edgesData.metadata?.phase1EdgesAdded || 0
    },
    nodesByDomain: domainStats,
    edgesByType: edgeTypeStats
  };
  
  const reportPath = path.join(__dirname, 'PHASE1-INTEGRATION-REPORT.json');
  writeJSON(reportPath, report);
  
  console.log('📊 Integration Report:');
  console.log('─'.repeat(50));
  console.log(`Total Nodes: ${report.summary.totalNodes}`);
  console.log(`Total Edges: ${report.summary.totalEdges}`);
  console.log(`Phase 1 Nodes Added: ${report.summary.phase1NodesAdded}`);
  console.log(`Phase 1 Edges Added: ${report.summary.phase1EdgesAdded}`);
  console.log('\nNodes by Domain:');
  Object.entries(report.nodesByDomain).forEach(([domain, count]) => {
    console.log(`  ${domain}: ${count}`);
  });
  console.log('\nEdges by Type:');
  Object.entries(report.edgesByType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  console.log('─'.repeat(50));
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 Phase 1 Data Integration');
  console.log('═'.repeat(50));
  
  const nodesSuccess = mergeNodes();
  const edgesSuccess = mergeEdges();
  
  if (nodesSuccess && edgesSuccess) {
    generateReport();
    console.log('\n🎉 Phase 1 integration completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Test the system with merged data');
    console.log('  2. Verify visualization works correctly');
    console.log('  3. Check all node connections');
    console.log('  4. Begin Phase 2 planning\n');
  } else {
    console.error('\n❌ Integration failed. Please check errors above.\n');
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { mergeNodes, mergeEdges, generateReport };
