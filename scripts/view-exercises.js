/**
 * 查看所有技能的进阶练习题概览
 */

const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data/skills-content-phase2.json', 'utf8'));

console.log('='.repeat(80));
console.log('进阶练习题概览');
console.log('='.repeat(80));

data.data.forEach((skill, index) => {
  console.log(`\n${index + 1}. ${skill.skillId}`);
  console.log('-'.repeat(80));
  
  console.log(`\n进阶主题 (${skill.advancedTopics.length}个):`);
  skill.advancedTopics.forEach((topic, i) => {
    console.log(`  ${i + 1}. ${topic.title}`);
  });
  
  console.log(`\n进阶练习题 (${skill.advancedExercises.length}道):`);
  skill.advancedExercises.forEach((ex, i) => {
    console.log(`  ${i + 1}. [难度${ex.difficulty}] ${ex.question.substring(0, 50)}...`);
    console.log(`     预计时间: ${ex.estimatedTime}分钟`);
  });
  
  console.log(`\n实践项目 (${skill.projects.length}个):`);
  skill.projects.forEach((proj, i) => {
    console.log(`  ${i + 1}. ${proj.title} [难度${proj.difficulty}]`);
    console.log(`     ${proj.description}`);
    console.log(`     预计时间: ${proj.estimatedTime}分钟`);
  });
});

console.log('\n' + '='.repeat(80));
console.log('统计信息:');
console.log(`- 总技能数: ${data.data.length}`);
console.log(`- 总练习题: ${data.data.reduce((sum, s) => sum + s.advancedExercises.length, 0)}道`);
console.log(`- 总项目数: ${data.data.reduce((sum, s) => sum + s.projects.length, 0)}个`);

const totalExerciseTime = data.data.reduce((sum, s) => 
  sum + s.advancedExercises.reduce((s2, e) => s2 + e.estimatedTime, 0), 0);
const totalProjectTime = data.data.reduce((sum, s) => 
  sum + s.projects.reduce((s2, p) => s2 + p.estimatedTime, 0), 0);

console.log(`- 练习题总时长: ${totalExerciseTime}分钟 (约${(totalExerciseTime/60).toFixed(1)}小时)`);
console.log(`- 项目总时长: ${totalProjectTime}分钟 (约${(totalProjectTime/60).toFixed(1)}小时)`);
console.log(`- 总学习时长: ${totalExerciseTime + totalProjectTime}分钟 (约${((totalExerciseTime + totalProjectTime)/60).toFixed(1)}小时)`);
console.log('='.repeat(80));
