/**
 * DataParser 演示脚本
 * 
 * 演示如何使用DataParser解析Phase 2数据文件
 */

const fs = require('fs').promises;
const DataParser = require('./data-parser.js');

async function demonstrateDataParser() {
  console.log('='.repeat(60));
  console.log('DataParser 功能演示');
  console.log('='.repeat(60));
  console.log();

  const parser = new DataParser();

  // ========== 演示1: 解析节点数据 ==========
  console.log('演示1: 解析节点数据');
  console.log('-'.repeat(60));
  
  try {
    const nodesContent = await fs.readFile('data/nodes-extended-phase2.json', 'utf-8');
    const nodesResult = parser.parseNodes(nodesContent);
    
    if (nodesResult.success) {
      console.log('✓ 节点数据解析成功');
      console.log(`  - 节点数量: ${nodesResult.count}`);
      console.log(`  - 元数据版本: ${nodesResult.metadata?.version || 'N/A'}`);
      console.log(`  - 元数据阶段: ${nodesResult.metadata?.phase || 'N/A'}`);
      
      if (nodesResult.data.length > 0) {
        const firstNode = nodesResult.data[0];
        console.log(`  - 第一个节点ID: ${firstNode.id}`);
        console.log(`  - 第一个节点名称: ${firstNode.name}`);
        console.log(`  - 第一个节点难度: ${firstNode.difficulty || 'N/A'}`);
      }
    } else {
      console.log('✗ 节点数据解析失败');
      console.log(`  错误类型: ${nodesResult.error.type}`);
      console.log(`  错误消息: ${nodesResult.error.message}`);
      if (nodesResult.error.details) {
        console.log(`  错误详情: ${JSON.stringify(nodesResult.error.details, null, 2)}`);
      }
    }
  } catch (error) {
    console.log(`✗ 读取节点文件失败: ${error.message}`);
  }
  
  console.log();

  // ========== 演示2: 解析边数据 ==========
  console.log('演示2: 解析边数据');
  console.log('-'.repeat(60));
  
  try {
    const edgesContent = await fs.readFile('data/edges-extended-phase2.json', 'utf-8');
    const edgesResult = parser.parseEdges(edgesContent);
    
    if (edgesResult.success) {
      console.log('✓ 边数据解析成功');
      console.log(`  - 边数量: ${edgesResult.count}`);
      console.log(`  - 元数据版本: ${edgesResult.metadata?.version || 'N/A'}`);
      
      if (edgesResult.data.length > 0) {
        const firstEdge = edgesResult.data[0];
        console.log(`  - 第一条边ID: ${firstEdge.id}`);
        console.log(`  - 第一条边类型: ${firstEdge.type || 'N/A'}`);
        console.log(`  - 第一条边强度: ${firstEdge.strength || 'N/A'}`);
        console.log(`  - 从 ${firstEdge.source} 到 ${firstEdge.target}`);
      }
    } else {
      console.log('✗ 边数据解析失败');
      console.log(`  错误类型: ${edgesResult.error.type}`);
      console.log(`  错误消息: ${edgesResult.error.message}`);
    }
  } catch (error) {
    console.log(`✗ 读取边文件失败: ${error.message}`);
  }
  
  console.log();

  // ========== 演示3: 解析应用案例数据 ==========
  console.log('演示3: 解析应用案例数据');
  console.log('-'.repeat(60));
  
  try {
    const appsContent = await fs.readFile('data/applications-extended-phase2.json', 'utf-8');
    const appsResult = parser.parseApplications(appsContent);
    
    if (appsResult.success) {
      console.log('✓ 应用案例数据解析成功');
      console.log(`  - 应用案例数量: ${appsResult.count}`);
      console.log(`  - 元数据版本: ${appsResult.metadata?.version || 'N/A'}`);
      
      if (appsResult.data.length > 0) {
        const firstApp = appsResult.data[0];
        console.log(`  - 第一个案例ID: ${firstApp.id}`);
        console.log(`  - 第一个案例标题: ${firstApp.title}`);
        console.log(`  - 第一个案例行业: ${firstApp.industry || 'N/A'}`);
        console.log(`  - 第一个案例难度: ${firstApp.difficulty || 'N/A'}`);
      }
    } else {
      console.log('✗ 应用案例数据解析失败');
      console.log(`  错误类型: ${appsResult.error.type}`);
      console.log(`  错误消息: ${appsResult.error.message}`);
    }
  } catch (error) {
    console.log(`✗ 读取应用案例文件失败: ${error.message}`);
  }
  
  console.log();

  // ========== 演示4: 使用parseFromFile方法 ==========
  console.log('演示4: 使用parseFromFile方法');
  console.log('-'.repeat(60));
  
  const nodesResult2 = await parser.parseFromFile('data/nodes-extended-phase2.json', 'nodes');
  if (nodesResult2.success) {
    console.log('✓ 使用parseFromFile解析节点成功');
    console.log(`  - 节点数量: ${nodesResult2.count}`);
  } else {
    console.log('✗ 使用parseFromFile解析节点失败');
    console.log(`  错误: ${nodesResult2.error.message}`);
  }
  
  console.log();

  // ========== 演示5: 批量解析多个文件 ==========
  console.log('演示5: 批量解析多个文件');
  console.log('-'.repeat(60));
  
  const files = [
    { path: 'data/nodes-extended-phase2.json', type: 'nodes' },
    { path: 'data/edges-extended-phase2.json', type: 'edges' },
    { path: 'data/applications-extended-phase2.json', type: 'applications' }
  ];
  
  const batchResult = await parser.parseMultipleFiles(files);
  
  console.log(`批量解析结果: ${batchResult.success ? '成功' : '部分失败'}`);
  console.log(`  - 总文件数: ${batchResult.summary.total}`);
  console.log(`  - 成功: ${batchResult.summary.succeeded}`);
  console.log(`  - 失败: ${batchResult.summary.failed}`);
  
  if (batchResult.files.length > 0) {
    console.log('\n成功解析的文件:');
    batchResult.files.forEach(file => {
      console.log(`  ✓ ${file.path} (${file.type}): ${file.count} 项`);
    });
  }
  
  if (batchResult.errors.length > 0) {
    console.log('\n解析失败的文件:');
    batchResult.errors.forEach(error => {
      console.log(`  ✗ ${error.path} (${error.type}): ${error.error.message}`);
    });
  }
  
  console.log();

  // ========== 演示6: 错误处理示例 ==========
  console.log('演示6: 错误处理示例');
  console.log('-'.repeat(60));
  
  // 测试无效的JSON
  const invalidJson = '{ invalid json }';
  const invalidResult = parser.parseNodes(invalidJson);
  console.log('测试无效JSON:');
  console.log(`  - 解析成功: ${invalidResult.success}`);
  console.log(`  - 错误类型: ${invalidResult.error.type}`);
  console.log(`  - 错误消息: ${invalidResult.error.message}`);
  console.log(`  - 建议: ${invalidResult.error.details.suggestion || 'N/A'}`);
  
  console.log();
  
  // 测试缺少必需字段的节点
  const invalidNode = { id: 'node-test' }; // 缺少name字段
  const invalidNodeResult = parser.parseNodes([invalidNode]);
  console.log('测试缺少必需字段的节点:');
  console.log(`  - 解析成功: ${invalidNodeResult.success}`);
  console.log(`  - 错误类型: ${invalidNodeResult.error.type}`);
  console.log(`  - 错误消息: ${invalidNodeResult.error.message}`);
  console.log(`  - 节点索引: ${invalidNodeResult.error.details.index}`);
  
  console.log();

  // ========== 演示7: 解析统计信息 ==========
  console.log('演示7: 解析统计信息');
  console.log('-'.repeat(60));
  
  try {
    const nodesContent = await fs.readFile('data/nodes-extended-phase2.json', 'utf-8');
    const edgesContent = await fs.readFile('data/edges-extended-phase2.json', 'utf-8');
    const appsContent = await fs.readFile('data/applications-extended-phase2.json', 'utf-8');
    
    const nodesResult = parser.parseNodes(nodesContent);
    const edgesResult = parser.parseEdges(edgesContent);
    const appsResult = parser.parseApplications(appsContent);
    
    console.log('Phase 2 数据统计:');
    console.log(`  - 节点总数: ${nodesResult.success ? nodesResult.count : 'N/A'}`);
    console.log(`  - 边总数: ${edgesResult.success ? edgesResult.count : 'N/A'}`);
    console.log(`  - 应用案例总数: ${appsResult.success ? appsResult.count : 'N/A'}`);
    
    if (nodesResult.success && nodesResult.data.length > 0) {
      // 统计各domain的节点数
      const domainCounts = {};
      nodesResult.data.forEach(node => {
        if (node.domains && Array.isArray(node.domains)) {
          node.domains.forEach(domain => {
            domainCounts[domain] = (domainCounts[domain] || 0) + 1;
          });
        }
      });
      
      console.log('\n各Domain节点分布:');
      Object.entries(domainCounts).sort().forEach(([domain, count]) => {
        console.log(`  - ${domain}: ${count} 个节点`);
      });
    }
    
    if (edgesResult.success && edgesResult.data.length > 0) {
      // 统计各类型边的数量
      const typeCounts = {};
      edgesResult.data.forEach(edge => {
        if (edge.type) {
          typeCounts[edge.type] = (typeCounts[edge.type] || 0) + 1;
        }
      });
      
      console.log('\n各类型边分布:');
      Object.entries(typeCounts).sort().forEach(([type, count]) => {
        console.log(`  - ${type}: ${count} 条边`);
      });
    }
    
  } catch (error) {
    console.log(`统计失败: ${error.message}`);
  }
  
  console.log();
  console.log('='.repeat(60));
  console.log('演示完成');
  console.log('='.repeat(60));
}

// 运行演示
if (require.main === module) {
  demonstrateDataParser().catch(error => {
    console.error('演示过程中发生错误:', error);
    process.exit(1);
  });
}

module.exports = { demonstrateDataParser };
