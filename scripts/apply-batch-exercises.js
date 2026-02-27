const fs = require('fs');

// 读取主数据文件
const data = JSON.parse(fs.readFileSync('data/skills-content-phase2.json', 'utf8'));

// 读取批次练习题
const batch1 = JSON.parse(fs.readFileSync('scripts/batch1-exercises.json', 'utf8'));

console.log('应用批次1练习题...\n');

let totalAdded = 0;

// 应用练习题
data.data.forEach(skill => {
  if (batch1[skill.skillId]) {
    const before = skill.advancedExercises.length;
    const toAdd = batch1[skill.skillId];
    skill.advancedExercises.push(...toAdd);
    const after = skill.advancedExercises.length;
    console.log(`✓ ${skill.skillId}: ${before} → ${after} (+${after-before})`);
    totalAdded += (after - before);
  }
});

console.log(`\n总共添加: ${totalAdded}道练习题`);

// 保存
fs.writeFileSync('data/skills-content-phase2.json', JSON.stringify(data, null, 2));
console.log('✓ 已保存');
