const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data/nodes-extended-phase2.json', 'utf8'));

console.log('Phase 2 节点验证\n');
console.log('='.repeat(60));
console.log(`总节点数: ${data.data.length}`);
console.log('='.repeat(60));

// 按domain统计
const byDomain = {};
data.data.forEach(node => {
  const domain = node.domains[0];
  byDomain[domain] = (byDomain[domain] || 0) + 1;
});

console.log('\n按Domain分布:');
Object.keys(byDomain).sort().forEach(domain => {
  console.log(`  ${domain}: ${byDomain[domain]}个`);
});

// 按难度统计
const byDifficulty = {};
data.data.forEach(node => {
  byDifficulty[node.difficulty] = (byDifficulty[node.difficulty] || 0) + 1;
});

console.log('\n按难度分布:');
Object.keys(byDifficulty).sort().forEach(diff => {
  console.log(`  难度${diff}: ${byDifficulty[diff]}个`);
});

// 检查必需字段
console.log('\n字段完整性检查:');
let missingFields = 0;
const requiredFields = ['id', 'name', 'nameEn', 'description', 'domains', 'difficulty', 'estimatedStudyTime'];

data.data.forEach((node, index) => {
  requiredFields.forEach(field => {
    if (!node[field]) {
      console.log(`  ⚠️  节点${index}: 缺少字段 ${field}`);
      missingFields++;
    }
  });
});

if (missingFields === 0) {
  console.log('  ✓ 所有节点包含必需字段');
}

// 检查应用案例
console.log('\n应用案例检查:');
let nodesWithApps = 0;
let totalApps = 0;
data.data.forEach(node => {
  if (node.realWorldApplications && node.realWorldApplications.length > 0) {
    nodesWithApps++;
    totalApps += node.realWorldApplications.length;
  }
});

console.log(`  有应用案例的节点: ${nodesWithApps}/${data.data.length}`);
console.log(`  总应用案例数: ${totalApps}`);

console.log('\n' + '='.repeat(60));
console.log('验证完成！');
console.log('='.repeat(60));
