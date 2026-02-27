const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/skills-content-phase2.json', 'utf8'));
const batch2 = JSON.parse(fs.readFileSync('scripts/all-exercises-batch2.json', 'utf8'));

console.log('应用批次2练习题...\n');
let totalAdded = 0;

data.data.forEach(skill => {
  if (batch2[skill.skillId]) {
    const before = skill.advancedExercises.length;
    skill.advancedExercises.push(...batch2[skill.skillId]);
    const after = skill.advancedExercises.length;
    console.log(`✓ ${skill.skillId}: ${before} → ${after} (+${after-before})`);
    totalAdded += (after - before);
  }
});

console.log(`\n总共添加: ${totalAdded}道`);
fs.writeFileSync('data/skills-content-phase2.json', JSON.stringify(data, null, 2));
console.log('✓ 已保存');
