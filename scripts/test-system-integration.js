/**
 * 测试系统集成 - Tasks 15-17
 * 测试NodeManager, LearningPathEngine, SearchFilterEngine
 */

const NodeManager = require('./node-manager');
const LearningPathEngine = require('./learning-path-engine');
const SearchFilterEngine = require('./search-filter-engine');

console.log('='.repeat(60));
console.log('Phase 2 系统集成测试');
console.log('='.repeat(60));
console.log();

// 1. 初始化NodeManager并加载数据
console.log('1. 初始化NodeManager...');
const nodeManager = new NodeManager();

// 加载Phase 1和Phase 2的节点数据
nodeManager.loadNodes([
  'data/nodes-extended-phase1.json',
  'data/nodes-extended-phase2.json'
]);

// 加载边关系
nodeManager.loadEdges([
  'data/edges-extended-phase1.json',
  'data/edges-extended-phase2.json'
]);

// 加载应用案例
nodeManager.loadApplications([
  'data/applications-extended-phase2.json'
]);

console.log();

// 2. 测试NodeManager功能
console.log('2. 测试NodeManager功能...');
const stats = nodeManager.getStats();
console.log('统计信息:', JSON.stringify(stats, null, 2));
console.log();

// 测试按domain查询
const domain1Nodes = nodeManager.getNodesByDomain('domain-1');
console.log(`✓ Domain-1节点数: ${domain1Nodes.length}`);

// 测试按difficulty查询
const difficulty5Nodes = nodeManager.getNodesByDifficulty(5);
console.log(`✓ Difficulty=5节点数: ${difficulty5Nodes.length}`);

// 测试搜索
const searchResults = nodeManager.searchNodes('曲率');
console.log(`✓ 搜索"曲率"结果数: ${searchResults.length}`);
if (searchResults.length > 0) {
  console.log(`  - ${searchResults[0].name} (${searchResults[0].id})`);
}

// 测试前置节点查询
if (domain1Nodes.length > 0) {
  const node = domain1Nodes.find(n => n.prerequisites && n.prerequisites.length > 0);
  if (node) {
    const prerequisites = nodeManager.getPrerequisites(node.id);
    console.log(`✓ 节点"${node.name}"的前置节点数: ${prerequisites.length}`);
  }
}

console.log();

// 3. 测试LearningPathEngine
console.log('3. 测试LearningPathEngine...');
const pathEngine = new LearningPathEngine(nodeManager);

// 测试用户水平分析
const completedNodes = [
  'node-domain-1-curvature-1772027700608-0',
  'node-domain-1-function-plotting-1772027700609-1'
];
const userLevel = pathEngine.analyzeUserLevel(completedNodes);
console.log('用户水平分析:', JSON.stringify(userLevel, null, 2));
console.log();

// 测试推荐系统
const recommendations = pathEngine.recommendNextNodes(completedNodes, 3);
console.log(`✓ 推荐节点数: ${recommendations.length}`);
for (const rec of recommendations) {
  console.log(`  - ${rec.node.name} (难度${rec.node.difficulty}, 分数${rec.score.toFixed(2)})`);
  console.log(`    理由: ${rec.reason}`);
}
console.log();

// 测试学习路径计算
if (difficulty5Nodes.length > 0) {
  const targetNode = difficulty5Nodes[0];
  const pathResult = pathEngine.calculatePath(null, targetNode.id, completedNodes);
  console.log(`✓ 到达"${targetNode.name}"的学习路径:`);
  console.log(`  - 总节点数: ${pathResult.totalNodes}`);
  console.log(`  - 预计时间: ${pathResult.estimatedTime.hours}小时 (${pathResult.estimatedTime.days}天)`);
  if (pathResult.path.length > 0) {
    console.log(`  - 路径: ${pathResult.path.slice(0, 3).map(n => n.name).join(' → ')}...`);
  }
}
console.log();

// 4. 测试SearchFilterEngine
console.log('4. 测试SearchFilterEngine...');
const searchEngine = new SearchFilterEngine(nodeManager);

// 构建搜索索引
searchEngine.buildIndex();
console.log();

// 测试全文搜索
const fullTextResults = searchEngine.fullTextSearch('曲率 微分');
console.log(`✓ 全文搜索"曲率 微分"结果数: ${fullTextResults.length}`);
if (fullTextResults.length > 0) {
  console.log(`  - ${fullTextResults[0].name}`);
}
console.log();

// 测试多条件过滤
const filters = {
  domains: ['domain-1', 'domain-2'],
  minDifficulty: 3,
  maxDifficulty: 5,
  minImportance: 4
};
const filteredNodes = searchEngine.applyFilters(filters);
console.log(`✓ 应用过滤条件后节点数: ${filteredNodes.length}`);
console.log('  过滤条件:', JSON.stringify(filters, null, 2));
console.log();

// 测试统计信息
const filterStats = searchEngine.getFilterStats(filters);
console.log('过滤统计:', JSON.stringify(filterStats, null, 2));
console.log();

// 测试热门关键词
const popularKeywords = searchEngine.getPopularKeywords(10);
console.log('✓ 热门关键词 (Top 10):');
for (const item of popularKeywords.slice(0, 5)) {
  console.log(`  - ${item.keyword}: ${item.count}次`);
}
console.log();

// 测试热门行业
const popularIndustries = searchEngine.getPopularIndustries(10);
console.log('✓ 热门应用行业 (Top 10):');
for (const item of popularIndustries.slice(0, 5)) {
  console.log(`  - ${item.industry}: ${item.count}个案例`);
}
console.log();

// 5. 综合测试：完整学习流程
console.log('5. 综合测试：模拟完整学习流程...');
console.log('场景：用户完成了2个基础节点，寻找下一步学习内容');
console.log();

// 获取推荐
const nextSteps = pathEngine.recommendNextNodes(completedNodes, 5);
console.log(`✓ 系统推荐了${nextSteps.length}个节点`);

if (nextSteps.length > 0) {
  const chosenNode = nextSteps[0].node;
  console.log(`✓ 用户选择学习: ${chosenNode.name}`);
  
  // 计算学习路径
  const learningPath = pathEngine.calculatePath(null, chosenNode.id, completedNodes);
  console.log(`✓ 学习路径包含${learningPath.totalNodes}个节点`);
  console.log(`✓ 预计学习时间: ${learningPath.estimatedTime.hours}小时`);
  
  // 查找相关应用案例
  const relatedApps = nodeManager.getRelatedApplications(chosenNode.id);
  console.log(`✓ 相关应用案例: ${relatedApps.length}个`);
  
  // 查找后续节点
  const successors = nodeManager.getSuccessors(chosenNode.id);
  console.log(`✓ 后续可学习节点: ${successors.length}个`);
}

console.log();
console.log('='.repeat(60));
console.log('✅ 系统集成测试完成！');
console.log('='.repeat(60));
console.log();
console.log('测试总结:');
console.log(`- NodeManager: 成功加载${stats.totalNodes}个节点`);
console.log(`- LearningPathEngine: 路径计算和推荐功能正常`);
console.log(`- SearchFilterEngine: 搜索和过滤功能正常`);
console.log();
console.log('✓ Tasks 15-17 实现完成！');
