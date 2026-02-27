/**
 * 演示节点生成功能
 * 展示生成的节点的完整结构
 */

const ContentGenerator = require('./content-generator');

console.log('=== 节点生成演示 ===\n');

const generator = new ContentGenerator();

// 生成一个domain-1的节点
console.log('生成domain-1的节点示例:\n');
const nodes = generator.generateNodes('domain-1', 1, { difficulty: [4] });
const node = nodes[0];

console.log('节点完整结构:');
console.log(JSON.stringify(node, null, 2));

console.log('\n\n=== 字段说明 ===');
console.log(`ID: ${node.id}`);
console.log(`中文名: ${node.name}`);
console.log(`英文名: ${node.nameEn}`);
console.log(`描述: ${node.description}`);
console.log(`所属领域: ${node.domains.join(', ')}`);
console.log(`传统章节: ${node.traditionalChapter}`);
console.log(`难度: ${node.difficulty}/5`);
console.log(`前置节点: ${node.prerequisites.length > 0 ? node.prerequisites.join(', ') : '无'}`);
console.log(`相关Skills: ${node.relatedSkills.join(', ')}`);
console.log(`公式: ${node.formula}`);
console.log(`关键词: ${node.keywords.join(', ')}`);
console.log(`重要性: ${node.importance}/5`);
console.log(`预计学习时长: ${node.estimatedStudyTime}分钟`);
console.log(`\n实际应用 (${node.realWorldApplications.length}个):`);
node.realWorldApplications.forEach((app, i) => {
  console.log(`  ${i + 1}. ${app.title}`);
  console.log(`     行业: ${app.industry}`);
  console.log(`     描述: ${app.description}`);
});

if (node.advancedTopics && node.advancedTopics.length > 0) {
  console.log(`\n高级主题: ${node.advancedTopics.join(', ')}`);
}

console.log(`\n可视化配置:`);
console.log(JSON.stringify(node.visualizationConfig, null, 2));

console.log('\n\n=== 生成多个domain的节点 ===\n');

const domains = ['domain-1', 'domain-2', 'domain-3', 'domain-4', 'domain-5'];
domains.forEach(domainId => {
  const count = domainId === 'domain-5' ? 1 : 2;
  const domainNodes = generator.generateNodes(domainId, count, {});
  console.log(`${domainId}: 生成了 ${domainNodes.length} 个节点`);
  domainNodes.forEach(n => {
    console.log(`  - ${n.name} (${n.nameEn}) - 难度${n.difficulty} - ${n.estimatedStudyTime}分钟`);
  });
});

console.log(`\n总共生成: ${generator.generatedNodes.length} 个节点`);
