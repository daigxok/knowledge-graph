/**
 * 测试脚本 - 验证ContentGenerator基础功能
 * 
 * 测试Task 2.1实现的功能:
 * - 配置加载
 * - 节点ID生成
 * - 模板加载
 */

const ContentGenerator = require('./content-generator');

console.log('=== 测试ContentGenerator基础功能 ===\n');

// 测试1: 创建ContentGenerator实例
console.log('测试1: 创建ContentGenerator实例');
try {
  const generator = new ContentGenerator();
  console.log('✓ ContentGenerator实例创建成功');
  console.log('  配置domains数量:', Object.keys(generator.config.domains).length);
  console.log('  模板数量:', Object.keys(generator.templates).length);
} catch (error) {
  console.error('✗ 创建实例失败:', error.message);
}

// 测试2: 测试配置加载
console.log('\n测试2: 测试配置加载');
try {
  const customConfig = {
    domains: {
      "domain-1": {
        count: 10,
        difficulty: [4, 5]
      }
    }
  };
  const generator = new ContentGenerator(customConfig);
  console.log('✓ 自定义配置加载成功');
  console.log('  domain-1节点数量:', generator.config.domains['domain-1'].count);
  console.log('  domain-1难度范围:', generator.config.domains['domain-1'].difficulty);
  console.log('  domain-1主题列表:', generator.config.domains['domain-1'].topics);
} catch (error) {
  console.error('✗ 配置加载失败:', error.message);
}

// 测试3: 测试节点ID生成
console.log('\n测试3: 测试节点ID生成');
try {
  const generator = new ContentGenerator();
  const id1 = generator.generateNodeId('domain-1', '曲率');
  const id2 = generator.generateNodeId('domain-1', '曲率');
  const id3 = generator.generateNodeId('domain-2', '曲线积分');
  
  console.log('✓ 节点ID生成成功');
  console.log('  ID1:', id1);
  console.log('  ID2:', id2);
  console.log('  ID3:', id3);
  console.log('  ID1和ID2不同:', id1 !== id2);
} catch (error) {
  console.error('✗ 节点ID生成失败:', error.message);
}

// 测试4: 测试模板加载
console.log('\n测试4: 测试模板加载');
try {
  const generator = new ContentGenerator();
  const template = generator.templates['曲率'];
  
  console.log('✓ 模板加载成功');
  console.log('  曲率模板名称:', template.name);
  console.log('  曲率模板英文名:', template.nameEn);
  console.log('  曲率模板关键词:', template.keywords.join(', '));
} catch (error) {
  console.error('✗ 模板加载失败:', error.message);
}

// 测试5: 测试方法存在性
console.log('\n测试5: 测试方法存在性');
try {
  const generator = new ContentGenerator();
  const methods = [
    'loadGeneratorConfig',
    'generateNodeId',
    'loadTemplates',
    'generateNodes',
    'generateEdges',
    'generateApplications',
    'generateSkillContent',
    'exportToJSON'
  ];
  
  const missingMethods = methods.filter(method => typeof generator[method] !== 'function');
  
  if (missingMethods.length === 0) {
    console.log('✓ 所有必需方法都已实现');
    console.log('  方法列表:', methods.join(', '));
  } else {
    console.error('✗ 缺少方法:', missingMethods.join(', '));
  }
} catch (error) {
  console.error('✗ 方法检查失败:', error.message);
}

console.log('\n=== 测试完成 ===');
