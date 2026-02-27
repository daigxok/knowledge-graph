/**
 * 演示exportToJSON功能的使用
 * 展示如何生成数据并导出到JSON文件
 */

const ContentGenerator = require('./content-generator');
const path = require('path');

console.log('=== exportToJSON 功能演示 ===\n');

// 创建ContentGenerator实例
const generator = new ContentGenerator();

console.log('步骤1: 生成节点数据');
console.log('----------------------------------------');

// 生成domain-1的5个节点
const domain1Nodes = generator.generateNodes('domain-1', 5, {});
console.log(`✓ 生成了 ${domain1Nodes.length} 个domain-1节点`);

// 生成domain-2的3个节点
const domain2Nodes = generator.generateNodes('domain-2', 3, {});
console.log(`✓ 生成了 ${domain2Nodes.length} 个domain-2节点`);

console.log(`\n总共生成了 ${generator.generatedNodes.length} 个节点\n`);

console.log('步骤2: 生成边关系');
console.log('----------------------------------------');

// 生成边关系
generator.generatedEdges = generator.generateEdges(
  generator.generatedNodes,
  generator.config.edges
);
console.log(`✓ 生成了 ${generator.generatedEdges.length} 条边关系\n`);

console.log('步骤3: 生成应用案例');
console.log('----------------------------------------');

// 生成10个应用案例
const industries = ['人工智能与机器学习', '金融科技', '医疗健康'];
generator.generatedApplications = generator.generateApplications(
  10,
  industries,
  generator.generatedNodes
);
console.log(`✓ 生成了 ${generator.generatedApplications.length} 个应用案例\n`);

console.log('步骤4: 生成Skills内容');
console.log('----------------------------------------');

// 生成Skills内容
const skillContent = generator.generateSkillContent('函数极限与连续Skill', {});
generator.generatedSkillsContent.push(skillContent);
console.log(`✓ 生成了 ${generator.generatedSkillsContent.length} 个Skills内容\n`);

console.log('步骤5: 导出所有数据到JSON文件');
console.log('----------------------------------------');

// 导出到data目录
const outputDir = path.join(__dirname, '../data');
const results = generator.exportToJSON(outputDir);

console.log('\n导出完成！');
console.log('----------------------------------------');
console.log('生成的文件:');
if (results.nodesFile) {
  console.log(`  ✓ 节点文件: ${path.basename(results.nodesFile)}`);
}
if (results.edgesFile) {
  console.log(`  ✓ 边关系文件: ${path.basename(results.edgesFile)}`);
}
if (results.applicationsFile) {
  console.log(`  ✓ 应用案例文件: ${path.basename(results.applicationsFile)}`);
}
if (results.skillsFile) {
  console.log(`  ✓ Skills内容文件: ${path.basename(results.skillsFile)}`);
}
console.log(`  ✓ 元数据文件: metadata-phase2.json`);

console.log('\n数据统计:');
console.log(`  节点总数: ${generator.generatedNodes.length}`);
console.log(`  边关系总数: ${generator.generatedEdges.length}`);
console.log(`  应用案例总数: ${generator.generatedApplications.length}`);
console.log(`  Skills内容总数: ${generator.generatedSkillsContent.length}`);

console.log('\n文件特性:');
console.log('  ✓ 所有文件使用2空格缩进 (符合需求 15.6)');
console.log('  ✓ 每个文件包含完整的metadata (符合需求 10.5)');
console.log('  ✓ metadata包含版本、日期、描述等信息');
console.log('  ✓ 自动更新metadata-phase2.json统计信息');

console.log('\n使用提示:');
console.log('  1. 生成的JSON文件可以直接被前端加载');
console.log('  2. metadata提供了数据的版本和依赖信息');
console.log('  3. 可以使用data-validator.js验证生成的数据');
console.log('  4. 支持增量生成，多次调用会覆盖之前的数据');

console.log('\n=== 演示完成 ===');
