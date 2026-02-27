/**
 * 为所有技能补充至少10道进阶练习题
 */

const fs = require('fs');

// 读取当前数据
const data = JSON.parse(fs.readFileSync('data/skills-content-phase2.json', 'utf8'));

console.log('开始为所有技能补充练习题...\n');

// 为每个技能检查并补充练习题
data.data.forEach((skill, index) => {
  const currentCount = skill.advancedExercises.length;
  const needed = Math.max(0, 10 - currentCount);
  
  console.log(`${index + 1}. ${skill.skillId}`);
  console.log(`   当前: ${currentCount}道, 需要补充: ${needed}道`);
  
  if (needed > 0) {
    console.log(`   ⚠️  需要补充练习题`);
  } else {
    console.log(`   ✓ 已满足要求`);
  }
});

console.log('\n准备生成补充练习题...');
