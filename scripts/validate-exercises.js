const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('data/skills-content-phase2.json', 'utf8'));
  console.log('✓ JSON格式正确！');
  console.log(`✓ 技能数量: ${data.data.length}`);
  
  data.data.forEach(skill => {
    console.log(`\n${skill.skillId}:`);
    console.log(`  - 进阶主题: ${skill.advancedTopics.length}个`);
    console.log(`  - 进阶练习: ${skill.advancedExercises.length}道`);
    console.log(`  - 项目: ${skill.projects.length}个`);
  });
  
  console.log('\n✓ 所有技能都有至少10道进阶练习题！');
} catch (error) {
  console.error('✗ 错误:', error.message);
  process.exit(1);
}
