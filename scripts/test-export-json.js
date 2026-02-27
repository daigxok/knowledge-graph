/**
 * 测试exportToJSON功能
 * 验证需求: 10.1, 10.2, 10.3, 10.4, 10.5, 15.6
 */

const ContentGenerator = require('./content-generator');
const fs = require('fs');
const path = require('path');

console.log('=== 测试 exportToJSON 功能 ===\n');

// 创建临时测试目录
const testOutputDir = path.join(__dirname, '../test-output');
if (!fs.existsSync(testOutputDir)) {
  fs.mkdirSync(testOutputDir, { recursive: true });
}

// 创建ContentGenerator实例
const generator = new ContentGenerator();

console.log('1. 生成测试数据...');

// 生成少量测试节点
const testNodes = generator.generateNodes('domain-1', 3, {});
console.log(`   生成了 ${testNodes.length} 个测试节点`);

// 生成测试边
generator.generatedEdges = generator.generateEdges(testNodes, generator.config.edges);
const testEdges = generator.generatedEdges;
console.log(`   生成了 ${testEdges.length} 条测试边`);

// 生成测试应用案例
generator.generatedApplications = generator.generateApplications(5, ['人工智能与机器学习', '金融科技'], testNodes);
const testApplications = generator.generatedApplications;
console.log(`   生成了 ${testApplications.length} 个测试应用案例`);

// 生成测试Skills内容
const testSkillContent = generator.generateSkillContent('函数极限与连续Skill', {});
generator.generatedSkillsContent.push(testSkillContent);
console.log(`   生成了测试Skills内容`);

console.log('\n2. 测试导出功能...');

// 执行导出
const results = generator.exportToJSON(testOutputDir);

console.log('\n3. 验证导出结果...');

let allTestsPassed = true;

// 测试1: 验证文件是否创建
console.log('\n测试1: 验证文件创建');
const expectedFiles = [
  'nodes-extended-phase2.json',
  'edges-extended-phase2.json',
  'applications-extended-phase2.json',
  'skills-content-phase2.json',
  'metadata-phase2.json'
];

for (const filename of expectedFiles) {
  const filepath = path.join(testOutputDir, filename);
  if (fs.existsSync(filepath)) {
    console.log(`  ✓ ${filename} 已创建`);
  } else {
    console.log(`  ✗ ${filename} 未创建`);
    allTestsPassed = false;
  }
}

// 测试2: 验证JSON格式和2空格缩进
console.log('\n测试2: 验证JSON格式和2空格缩进 (需求 15.6)');
for (const filename of expectedFiles) {
  const filepath = path.join(testOutputDir, filename);
  if (fs.existsSync(filepath)) {
    const content = fs.readFileSync(filepath, 'utf8');
    
    // 验证是否是有效的JSON
    try {
      JSON.parse(content);
      console.log(`  ✓ ${filename} 是有效的JSON`);
    } catch (error) {
      console.log(`  ✗ ${filename} JSON格式错误: ${error.message}`);
      allTestsPassed = false;
      continue;
    }
    
    // 验证2空格缩进
    const lines = content.split('\n');
    // 检查是否使用了2空格缩进
    // JSON.stringify(obj, null, 2) 会产生2空格缩进
    // 我们检查是否有以2个空格开头但不是4个空格的行
    let found2SpaceIndent = false;
    let found4SpaceIndent = false;
    
    for (const line of lines) {
      if (line.match(/^  [^\s]/)) {
        // 以2个空格+非空格字符开头
        found2SpaceIndent = true;
      }
      if (line.match(/^    [^\s]/)) {
        // 以4个空格+非空格字符开头
        found4SpaceIndent = true;
      }
    }
    
    // JSON.stringify(obj, null, 2) 实际上会产生嵌套的2空格缩进
    // 所以第一层是2空格，第二层是4空格，这是正确的
    // 我们只需要确认使用了2空格作为基本单位
    if (found2SpaceIndent) {
      console.log(`  ✓ ${filename} 使用2空格缩进`);
    } else {
      console.log(`  ✗ ${filename} 未使用2空格缩进`);
      allTestsPassed = false;
    }
  }
}

// 测试3: 验证metadata结构
console.log('\n测试3: 验证metadata结构 (需求 10.5)');
for (const filename of expectedFiles.slice(0, 4)) { // 不包括metadata-phase2.json
  const filepath = path.join(testOutputDir, filename);
  if (fs.existsSync(filepath)) {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    // 验证metadata字段
    const requiredMetadataFields = ['version', 'phase', 'totalItems', 'createdDate', 'description', 'author', 'dependencies'];
    let hasAllFields = true;
    
    for (const field of requiredMetadataFields) {
      if (!(field in data.metadata)) {
        console.log(`  ✗ ${filename} 缺少metadata字段: ${field}`);
        hasAllFields = false;
        allTestsPassed = false;
      }
    }
    
    if (hasAllFields) {
      console.log(`  ✓ ${filename} metadata包含所有必需字段`);
    }
    
    // 验证version
    if (data.metadata.version === "2.0") {
      console.log(`  ✓ ${filename} version正确 (2.0)`);
    } else {
      console.log(`  ✗ ${filename} version错误: ${data.metadata.version}`);
      allTestsPassed = false;
    }
    
    // 验证totalItems
    if (data.metadata.totalItems === data.data.length) {
      console.log(`  ✓ ${filename} totalItems与data数组长度一致`);
    } else {
      console.log(`  ✗ ${filename} totalItems (${data.metadata.totalItems}) 与data数组长度 (${data.data.length}) 不一致`);
      allTestsPassed = false;
    }
  }
}

// 测试4: 验证data数组
console.log('\n测试4: 验证data数组');
const dataFiles = [
  { file: 'nodes-extended-phase2.json', expectedCount: 3, name: '节点' },
  { file: 'edges-extended-phase2.json', expectedCount: testEdges.length, name: '边' },
  { file: 'applications-extended-phase2.json', expectedCount: 5, name: '应用案例' },
  { file: 'skills-content-phase2.json', expectedCount: 1, name: 'Skills内容' }
];

for (const { file, expectedCount, name } of dataFiles) {
  const filepath = path.join(testOutputDir, file);
  if (fs.existsSync(filepath)) {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    if (data.data && Array.isArray(data.data)) {
      console.log(`  ✓ ${file} 包含data数组`);
      
      if (data.data.length === expectedCount) {
        console.log(`  ✓ ${file} data数组长度正确 (${expectedCount})`);
      } else {
        console.log(`  ✗ ${file} data数组长度错误: 期望 ${expectedCount}, 实际 ${data.data.length}`);
        allTestsPassed = false;
      }
    } else {
      console.log(`  ✗ ${file} 缺少data数组或格式错误`);
      allTestsPassed = false;
    }
  }
}

// 测试5: 验证metadata-phase2.json
console.log('\n测试5: 验证metadata-phase2.json');
const metadataPath = path.join(testOutputDir, 'metadata-phase2.json');
if (fs.existsSync(metadataPath)) {
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  
  // 验证必需字段
  const requiredFields = ['version', 'phase', 'createdDate', 'description', 'status', 'files', 'statistics', 'lastUpdated'];
  let hasAllFields = true;
  
  for (const field of requiredFields) {
    if (!(field in metadata)) {
      console.log(`  ✗ metadata-phase2.json 缺少字段: ${field}`);
      hasAllFields = false;
      allTestsPassed = false;
    }
  }
  
  if (hasAllFields) {
    console.log(`  ✓ metadata-phase2.json 包含所有必需字段`);
  }
  
  // 验证statistics
  if (metadata.statistics) {
    if (metadata.statistics.totalNodes === 3) {
      console.log(`  ✓ statistics.totalNodes 正确 (3)`);
    } else {
      console.log(`  ✗ statistics.totalNodes 错误: ${metadata.statistics.totalNodes}`);
      allTestsPassed = false;
    }
    
    if (metadata.statistics.totalApplications === 5) {
      console.log(`  ✓ statistics.totalApplications 正确 (5)`);
    } else {
      console.log(`  ✗ statistics.totalApplications 错误: ${metadata.statistics.totalApplications}`);
      allTestsPassed = false;
    }
  }
}

// 清理测试文件
console.log('\n4. 清理测试文件...');
try {
  fs.rmSync(testOutputDir, { recursive: true, force: true });
  console.log('  ✓ 测试文件已清理');
} catch (error) {
  console.log(`  ⚠ 清理测试文件失败: ${error.message}`);
}

// 输出最终结果
console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
  console.log('✓ 所有测试通过！exportToJSON功能正常工作。');
  console.log('\n验证的需求:');
  console.log('  - 10.1: 创建nodes-extended-phase2.json文件 ✓');
  console.log('  - 10.2: 创建edges-extended-phase2.json文件 ✓');
  console.log('  - 10.3: 创建applications-extended-phase2.json文件 ✓');
  console.log('  - 10.4: 创建skills-content-phase2.json文件 ✓');
  console.log('  - 10.5: 在每个数据文件中包含metadata ✓');
  console.log('  - 15.6: 格式化输出JSON，使用2空格缩进 ✓');
  process.exit(0);
} else {
  console.log('✗ 部分测试失败，请检查上述错误。');
  process.exit(1);
}
