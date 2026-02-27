/**
 * 测试节点生成功能
 * 
 * 验证Task 2.2的实现：
 * - generateNodes方法
 * - createNode方法
 * - selectPrerequisites方法
 * - selectRelatedSkills方法
 */

const ContentGenerator = require('./content-generator');

console.log('=== 测试节点生成功能 ===\n');

// 创建生成器实例
const generator = new ContentGenerator();

// 测试1: 生成domain-1的节点
console.log('测试1: 生成domain-1的5个节点');
try {
  const nodes1 = generator.generateNodes('domain-1', 5, {});
  console.log(`✓ 成功生成 ${nodes1.length} 个节点`);
  console.log(`  第一个节点: ${nodes1[0].name} (${nodes1[0].nameEn})`);
  console.log(`  难度: ${nodes1[0].difficulty}`);
  console.log(`  学习时长: ${nodes1[0].estimatedStudyTime}分钟`);
  console.log(`  关键词: ${nodes1[0].keywords.join(', ')}`);
  console.log(`  应用案例数: ${nodes1[0].realWorldApplications.length}`);
  console.log(`  相关Skills: ${nodes1[0].relatedSkills.join(', ')}`);
  console.log();
} catch (error) {
  console.error(`✗ 失败: ${error.message}\n`);
}

// 测试2: 生成domain-2的节点
console.log('测试2: 生成domain-2的3个节点');
try {
  const nodes2 = generator.generateNodes('domain-2', 3, {});
  console.log(`✓ 成功生成 ${nodes2.length} 个节点`);
  console.log(`  节点列表:`);
  nodes2.forEach((node, i) => {
    console.log(`    ${i + 1}. ${node.name} - 难度${node.difficulty} - ${node.estimatedStudyTime}分钟`);
  });
  console.log();
} catch (error) {
  console.error(`✗ 失败: ${error.message}\n`);
}

// 测试3: 验证高级节点的应用案例数量
console.log('测试3: 验证高级节点（difficulty≥4）至少有2个应用案例');
try {
  const nodes3 = generator.generateNodes('domain-1', 10, { difficulty: [4, 5] });
  const highDifficultyNodes = nodes3.filter(n => n.difficulty >= 4);
  const allHaveTwoApps = highDifficultyNodes.every(n => n.realWorldApplications.length >= 2);
  
  if (allHaveTwoApps) {
    console.log(`✓ 所有高难度节点都有至少2个应用案例`);
    console.log(`  高难度节点数: ${highDifficultyNodes.length}`);
  } else {
    console.log(`✗ 部分高难度节点应用案例不足2个`);
  }
  console.log();
} catch (error) {
  console.error(`✗ 失败: ${error.message}\n`);
}

// 测试4: 验证节点数据完整性
console.log('测试4: 验证节点包含所有必需字段');
try {
  const nodes4 = generator.generateNodes('domain-3', 2, {});
  const requiredFields = [
    'id', 'name', 'nameEn', 'description', 'domains', 
    'difficulty', 'prerequisites', 'relatedSkills', 
    'keywords', 'estimatedStudyTime', 'realWorldApplications'
  ];
  
  let allFieldsPresent = true;
  let missingFields = [];
  
  for (const node of nodes4) {
    for (const field of requiredFields) {
      if (!(field in node)) {
        allFieldsPresent = false;
        missingFields.push(`${node.id}: ${field}`);
      }
    }
  }
  
  if (allFieldsPresent) {
    console.log(`✓ 所有节点都包含必需字段`);
  } else {
    console.log(`✗ 缺少字段: ${missingFields.join(', ')}`);
  }
  console.log();
} catch (error) {
  console.error(`✗ 失败: ${error.message}\n`);
}

// 测试5: 验证难度值范围
console.log('测试5: 验证难度值在1-5范围内');
try {
  const nodes5 = generator.generateNodes('domain-4', 5, {});
  const allValidDifficulty = nodes5.every(n => n.difficulty >= 1 && n.difficulty <= 5);
  
  if (allValidDifficulty) {
    console.log(`✓ 所有节点难度值都在有效范围内`);
    const difficulties = nodes5.map(n => n.difficulty);
    console.log(`  难度分布: ${difficulties.join(', ')}`);
  } else {
    console.log(`✗ 部分节点难度值超出范围`);
  }
  console.log();
} catch (error) {
  console.error(`✗ 失败: ${error.message}\n`);
}

// 测试6: 验证学习时长范围
console.log('测试6: 验证学习时长在30-120分钟范围内');
try {
  const nodes6 = generator.generateNodes('domain-5', 3, {});
  const allValidStudyTime = nodes6.every(n => n.estimatedStudyTime >= 30 && n.estimatedStudyTime <= 120);
  
  if (allValidStudyTime) {
    console.log(`✓ 所有节点学习时长都在有效范围内`);
    const studyTimes = nodes6.map(n => n.estimatedStudyTime);
    console.log(`  学习时长: ${studyTimes.join(', ')}分钟`);
  } else {
    console.log(`✗ 部分节点学习时长超出范围`);
  }
  console.log();
} catch (error) {
  console.error(`✗ 失败: ${error.message}\n`);
}

// 测试7: 验证无效domain抛出错误
console.log('测试7: 验证无效domain ID抛出错误');
try {
  generator.generateNodes('invalid-domain', 1, {});
  console.log(`✗ 应该抛出错误但没有\n`);
} catch (error) {
  console.log(`✓ 正确抛出错误: ${error.message}\n`);
}

// 测试8: 验证节点ID唯一性
console.log('测试8: 验证生成的节点ID唯一');
try {
  const nodes8 = generator.generateNodes('domain-1', 10, {});
  const ids = nodes8.map(n => n.id);
  const uniqueIds = new Set(ids);
  
  if (ids.length === uniqueIds.size) {
    console.log(`✓ 所有节点ID都是唯一的`);
    console.log(`  生成了 ${ids.length} 个唯一ID`);
  } else {
    console.log(`✗ 存在重复的节点ID`);
  }
  console.log();
} catch (error) {
  console.error(`✗ 失败: ${error.message}\n`);
}

console.log('=== 测试完成 ===');
