const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/skills-content-phase2.json', 'utf8'));
const batch5 = JSON.parse(fs.readFileSync('scripts/all-exercises-batch5.json', 'utf8'));

console.log('应用批次5（最后一批）练习题...\n');
let totalAdded = 0;

data.data.forEach(skill => {
  if (batch5[skill.skillId]) {
    const before = skill.advancedExercises.length;
    skill.advancedExercises.push(...batch5[skill.skillId]);
    const after = skill.advancedExercises.length;
    console.log(`✓ ${skill.skillId}: ${before} → ${after} (+${after-before})`);
    totalAdded += (after - before);
  }
});

console.log(`\n总共添加: ${totalAdded}道`);
fs.writeFileSync('data/skills-content-phase2.json', JSON.stringify(data, null, 2));
console.log('✓ 已保存');
console.log('\n🎉 所有技能练习题补充完成！');
