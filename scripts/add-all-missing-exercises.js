/**
 * 为所有缺少练习题的技能补充完整内容
 */

const fs = require('fs');

// 读取当前数据
const data = JSON.parse(fs.readFileSync('data/skills-content-phase2.json', 'utf8'));

// 导入所有补充练习题数据
const allSupplementaryExercises = require('./exercises-data.js');

console.log('开始为所有技能补充练习题...\n');

// 统计信息
let totalAdded = 0;
let skillsUpdated = 0;

// 为每个技能补充练习题
data.data.forEach(skill => {
  const currentCount = skill.advancedExercises.length;
  const needed = 10 - currentCount;
  
  if (needed > 0 && allSupplementaryExercises[skill.skillId]) {
    const toAdd = allSupplementaryExercises[skill.skillId].slice(0, needed);
    skill.advancedExercises.push(...toAdd);
    const added = toAdd.length;
    
    console.log(`✓ ${skill.skillId}: ${currentCount}道 → ${currentCount + added}道 (+${added})`);
    totalAdded += added;
    skillsUpdated++;
  } else if (currentCount >= 10) {
    console.log(`  ${skill.skillId}: ${currentCount}道 ✓ 已满足`);
  }
});

console.log(`\n总结:`);
console.log(`- 更新技能数: ${skillsUpdated}`);
console.log(`- 新增练习题: ${totalAdded}道`);

// 更新metadata
data.metadata.lastUpdated = new Date().toISOString();

// 保存文件
fs.writeFileSync('data/skills-content-phase2.json', JSON.stringify(data, null, 2));

console.log('\n✓ 完成！文件已更新。');
console.log('运行验证: node scripts/validate-exercises.js');
