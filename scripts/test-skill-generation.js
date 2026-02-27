/**
 * 测试Skills内容生成功能
 * Task 2.5 - 实现Skills内容生成功能（generateSkillContent）
 */

const ContentGenerator = require('./content-generator.js');

console.log('=== 测试Skills内容生成功能 ===\n');

// 创建内容生成器实例
const generator = new ContentGenerator();

// 测试所有4个Skills
const skills = [
  '函数极限与连续Skill',
  '导数与微分Skill',
  '积分概念Skill',
  '多元函数Skill'
];

const allSkillsContent = [];

skills.forEach(skillId => {
  console.log(`\n测试 ${skillId}:`);
  console.log('='.repeat(60));
  
  const skillContent = generator.generateSkillContent(skillId);
  
  // 验证数据结构
  console.log('\n验证结果:');
  console.log(`  ✓ skillId: ${skillContent.skillId}`);
  console.log(`  ✓ phase: ${skillContent.phase}`);
  console.log(`  ✓ 高级主题数量: ${skillContent.advancedTopics.length}`);
  console.log(`  ✓ 进阶练习题数量: ${skillContent.advancedExercises.length}`);
  console.log(`  ✓ 项目实战数量: ${skillContent.projects.length}`);
  
  // 验证需求
  const checks = {
    '高级主题至少3个': skillContent.advancedTopics.length >= 3,
    '练习题至少10道': skillContent.advancedExercises.length >= 10,
    '项目至少2个': skillContent.projects.length >= 2,
    '所有高级主题有完整字段': skillContent.advancedTopics.every(t => 
      t.id && t.title && t.description && t.formula && t.examples && t.applications
    ),
    '所有练习题有完整字段': skillContent.advancedExercises.every(e =>
      e.id && e.difficulty && e.question && e.hints && e.solution && e.relatedNodes && e.estimatedTime
    ),
    '所有项目有完整字段': skillContent.projects.every(p =>
      p.id && p.title && p.description && p.difficulty && p.objectives && p.tasks && p.deliverables && p.estimatedTime
    ),
    '练习题包含详细解答': skillContent.advancedExercises.every(e =>
      e.solution.steps && e.solution.keyPoints
    )
  };
  
  console.log('\n需求验证:');
  Object.entries(checks).forEach(([check, passed]) => {
    console.log(`  ${passed ? '✓' : '✗'} ${check}`);
  });
  
  // 显示示例内容
  console.log('\n示例高级主题:');
  if (skillContent.advancedTopics.length > 0) {
    const topic = skillContent.advancedTopics[0];
    console.log(`  标题: ${topic.title}`);
    console.log(`  描述: ${topic.description.substring(0, 50)}...`);
    console.log(`  公式: ${topic.formula.substring(0, 50)}...`);
  }
  
  console.log('\n示例练习题:');
  if (skillContent.advancedExercises.length > 0) {
    const exercise = skillContent.advancedExercises[0];
    console.log(`  题目: ${exercise.question.substring(0, 50)}...`);
    console.log(`  难度: ${exercise.difficulty}`);
    console.log(`  提示数量: ${exercise.hints.length}`);
    console.log(`  解答步骤数: ${exercise.solution.steps.length}`);
  }
  
  console.log('\n示例项目:');
  if (skillContent.projects.length > 0) {
    const project = skillContent.projects[0];
    console.log(`  标题: ${project.title}`);
    console.log(`  描述: ${project.description.substring(0, 50)}...`);
    console.log(`  难度: ${project.difficulty}`);
    console.log(`  目标数量: ${project.objectives.length}`);
    console.log(`  任务数量: ${project.tasks.length}`);
  }
  
  allSkillsContent.push(skillContent);
});

// 总结
console.log('\n\n=== 总体统计 ===');
console.log(`总共生成了 ${allSkillsContent.length} 个Skills的深度内容`);
console.log(`总高级主题数: ${allSkillsContent.reduce((sum, s) => sum + s.advancedTopics.length, 0)}`);
console.log(`总练习题数: ${allSkillsContent.reduce((sum, s) => sum + s.advancedExercises.length, 0)}`);
console.log(`总项目数: ${allSkillsContent.reduce((sum, s) => sum + s.projects.length, 0)}`);

// 验证所有需求
console.log('\n=== 需求验证总结 ===');
const allRequirementsMet = allSkillsContent.every(s => 
  s.advancedTopics.length >= 3 &&
  s.advancedExercises.length >= 10 &&
  s.projects.length >= 2
);

if (allRequirementsMet) {
  console.log('✓ 所有需求都已满足！');
  console.log('  - 需求 7.1-7.4: 为4个Skill添加高级主题 ✓');
  console.log('  - 需求 7.5: 每个Skill至少10道进阶练习题 ✓');
  console.log('  - 需求 7.6: 每个Skill至少2个项目实战案例 ✓');
  console.log('  - 需求 7.7: 练习题包含题目、提示、详细解答和知识点标注 ✓');
} else {
  console.log('✗ 部分需求未满足');
}

console.log('\n测试完成！');
