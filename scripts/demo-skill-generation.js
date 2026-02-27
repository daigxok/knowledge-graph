/**
 * 演示Skills内容生成功能
 * Task 2.5 - generateSkillContent方法使用示例
 */

const ContentGenerator = require('./content-generator.js');
const fs = require('fs');
const path = require('path');

console.log('=== Skills内容生成演示 ===\n');

// 创建内容生成器实例
const generator = new ContentGenerator();

// 定义要生成内容的Skills
const skills = [
  '函数极限与连续Skill',
  '导数与微分Skill',
  '积分概念Skill',
  '多元函数Skill'
];

// 生成所有Skills的深度内容
const skillsContentData = {
  metadata: {
    version: '2.0',
    phase: 'Phase 2 - 内容深度扩展',
    totalSkills: skills.length,
    createdDate: new Date().toISOString(),
    description: 'Phase 2 Skills深度内容，包含高级主题、进阶练习题和项目实战',
    author: 'ContentGenerator'
  },
  data: []
};

console.log('开始生成Skills深度内容...\n');

skills.forEach((skillId, index) => {
  console.log(`[${index + 1}/${skills.length}] 生成 ${skillId}...`);
  
  const skillContent = generator.generateSkillContent(skillId);
  skillsContentData.data.push(skillContent);
  
  console.log(`  ✓ 完成 - ${skillContent.advancedTopics.length} 个主题, ${skillContent.advancedExercises.length} 道练习, ${skillContent.projects.length} 个项目\n`);
});

// 保存到文件
const outputPath = path.join('data', 'skills-content-phase2.json');
fs.writeFileSync(
  outputPath,
  JSON.stringify(skillsContentData, null, 2),
  'utf-8'
);

console.log(`✓ Skills内容已保存到: ${outputPath}`);
console.log(`\n文件大小: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);

// 显示详细统计
console.log('\n=== 生成统计 ===');
console.log(`Skills总数: ${skillsContentData.data.length}`);
console.log(`高级主题总数: ${skillsContentData.data.reduce((sum, s) => sum + s.advancedTopics.length, 0)}`);
console.log(`练习题总数: ${skillsContentData.data.reduce((sum, s) => sum + s.advancedExercises.length, 0)}`);
console.log(`项目总数: ${skillsContentData.data.reduce((sum, s) => sum + s.projects.length, 0)}`);

// 显示每个Skill的详细内容
console.log('\n=== Skills详细内容 ===');
skillsContentData.data.forEach((skillContent, index) => {
  console.log(`\n${index + 1}. ${skillContent.skillId}`);
  console.log('   高级主题:');
  skillContent.advancedTopics.forEach((topic, i) => {
    console.log(`     ${i + 1}. ${topic.title}`);
  });
  console.log(`   练习题: ${skillContent.advancedExercises.length} 道 (难度 ${Math.min(...skillContent.advancedExercises.map(e => e.difficulty))}-${Math.max(...skillContent.advancedExercises.map(e => e.difficulty))})`);
  console.log(`   项目实战:`);
  skillContent.projects.forEach((project, i) => {
    console.log(`     ${i + 1}. ${project.title} (难度 ${project.difficulty}, 预计 ${project.estimatedTime} 分钟)`);
  });
});

console.log('\n演示完成！');
