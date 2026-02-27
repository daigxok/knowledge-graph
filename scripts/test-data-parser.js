/**
 * 单元测试 - DataParser
 * 
 * 测试DataParser类的所有功能
 */

const DataParser = require('./data-parser.js');

// 测试辅助函数
function assert(condition, message) {
  if (!condition) {
    throw new Error(`断言失败: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`断言失败: ${message}\n期望: ${JSON.stringify(expected)}\n实际: ${JSON.stringify(actual)}`);
  }
}

function assertContains(str, substring, message) {
  if (!str.includes(substring)) {
    throw new Error(`断言失败: ${message}\n字符串不包含: ${substring}`);
  }
}

// 测试数据
const validNode = {
  id: 'node-test-1',
  name: '测试节点',
  nameEn: 'Test Node',
  description: '这是一个测试节点',
  domains: ['domain-1'],
  difficulty: 3,
  prerequisites: ['node-prerequisite-1'],
  relatedSkills: ['skill-1'],
  keywords: ['测试', '节点', '示例'],
  estimatedStudyTime: 60
};

const validEdge = {
  id: 'edge-test-1',
  source: 'node-source',
  target: 'node-target',
  type: 'prerequisite',
  strength: 0.8
};

const validApplication = {
  id: 'app-test-1',
  title: '测试应用案例',
  industry: '人工智能',
  difficulty: 4,
  relatedNodes: ['node-test-1'],
  description: '这是一个测试应用案例'
};

// 测试套件
const tests = {
  // ========== parseNodes 测试 ==========
  
  'parseNodes - 应该成功解析有效的节点数组': () => {
    const parser = new DataParser();
    const result = parser.parseNodes([validNode]);
    
    assert(result.success, '解析应该成功');
    assert(result.data !== null, '数据不应为null');
    assertEqual(result.data.length, 1, '应该有1个节点');
    assertEqual(result.data[0].id, 'node-test-1', '节点ID应该匹配');
    assert(result.error === null, '错误应该为null');
  },

  'parseNodes - 应该成功解析包含metadata的对象': () => {
    const parser = new DataParser();
    const input = {
      metadata: { version: '2.0', phase: 'phase2' },
      data: [validNode]
    };
    const result = parser.parseNodes(input);
    
    assert(result.success, '解析应该成功');
    assertEqual(result.data.length, 1, '应该有1个节点');
    assert(result.metadata !== null, 'metadata不应为null');
    assertEqual(result.metadata.version, '2.0', 'metadata版本应该匹配');
  },

  'parseNodes - 应该成功解析JSON字符串': () => {
    const parser = new DataParser();
    const jsonString = JSON.stringify([validNode]);
    const result = parser.parseNodes(jsonString);
    
    assert(result.success, '解析应该成功');
    assertEqual(result.data.length, 1, '应该有1个节点');
  },

  'parseNodes - 应该拒绝缺少id字段的节点': () => {
    const parser = new DataParser();
    const invalidNode = { ...validNode };
    delete invalidNode.id;
    const result = parser.parseNodes([invalidNode]);
    
    assert(!result.success, '解析应该失败');
    assert(result.data === null, '数据应该为null');
    assert(result.error !== null, '错误不应为null');
    assertEqual(result.error.type, 'INVALID_NODE', '错误类型应该是INVALID_NODE');
    assertContains(result.error.message, 'id', '错误消息应该提到id字段');
  },

  'parseNodes - 应该拒绝缺少name字段的节点': () => {
    const parser = new DataParser();
    const invalidNode = { ...validNode };
    delete invalidNode.name;
    const result = parser.parseNodes([invalidNode]);
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_NODE', '错误类型应该是INVALID_NODE');
    assertContains(result.error.message, 'name', '错误消息应该提到name字段');
  },

  'parseNodes - 应该拒绝id格式不正确的节点': () => {
    const parser = new DataParser();
    const invalidNode = { ...validNode, id: 'invalid-id' };
    const result = parser.parseNodes([invalidNode]);
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_NODE', '错误类型应该是INVALID_NODE');
    assertContains(result.error.message, 'node-', '错误消息应该提到node-前缀');
  },

  'parseNodes - 应该拒绝difficulty超出范围的节点': () => {
    const parser = new DataParser();
    const invalidNode = { ...validNode, difficulty: 6 };
    const result = parser.parseNodes([invalidNode]);
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_NODE', '错误类型应该是INVALID_NODE');
    assertContains(result.error.message, 'difficulty', '错误消息应该提到difficulty');
  },

  'parseNodes - 应该拒绝domains不是数组的节点': () => {
    const parser = new DataParser();
    const invalidNode = { ...validNode, domains: 'domain-1' };
    const result = parser.parseNodes([invalidNode]);
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_NODE', '错误类型应该是INVALID_NODE');
    assertContains(result.error.message, 'domains', '错误消息应该提到domains');
  },

  'parseNodes - 应该拒绝无效的JSON格式': () => {
    const parser = new DataParser();
    const result = parser.parseNodes('invalid json');
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'JSON_SYNTAX_ERROR', '错误类型应该是JSON_SYNTAX_ERROR');
  },

  'parseNodes - 应该拒绝非对象非数组的输入': () => {
    const parser = new DataParser();
    const result = parser.parseNodes(null);
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_FORMAT', '错误类型应该是INVALID_FORMAT');
  },

  'parseNodes - 应该拒绝没有data或nodes字段的对象': () => {
    const parser = new DataParser();
    const result = parser.parseNodes({ metadata: {} });
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_STRUCTURE', '错误类型应该是INVALID_STRUCTURE');
  },

  'parseNodes - 应该成功解析空数组': () => {
    const parser = new DataParser();
    const result = parser.parseNodes([]);
    
    assert(result.success, '解析应该成功');
    assertEqual(result.data.length, 0, '应该有0个节点');
    assertEqual(result.count, 0, 'count应该为0');
  },

  'parseNodes - 应该成功解析多个节点': () => {
    const parser = new DataParser();
    const node2 = { ...validNode, id: 'node-test-2', name: '测试节点2' };
    const node3 = { ...validNode, id: 'node-test-3', name: '测试节点3' };
    const result = parser.parseNodes([validNode, node2, node3]);
    
    assert(result.success, '解析应该成功');
    assertEqual(result.data.length, 3, '应该有3个节点');
    assertEqual(result.count, 3, 'count应该为3');
  },

  // ========== parseEdges 测试 ==========

  'parseEdges - 应该成功解析有效的边数组': () => {
    const parser = new DataParser();
    const result = parser.parseEdges([validEdge]);
    
    assert(result.success, '解析应该成功');
    assert(result.data !== null, '数据不应为null');
    assertEqual(result.data.length, 1, '应该有1条边');
    assertEqual(result.data[0].id, 'edge-test-1', '边ID应该匹配');
  },

  'parseEdges - 应该成功解析包含metadata的对象': () => {
    const parser = new DataParser();
    const input = {
      metadata: { version: '2.0' },
      data: [validEdge]
    };
    const result = parser.parseEdges(input);
    
    assert(result.success, '解析应该成功');
    assertEqual(result.data.length, 1, '应该有1条边');
    assert(result.metadata !== null, 'metadata不应为null');
  },

  'parseEdges - 应该拒绝缺少id字段的边': () => {
    const parser = new DataParser();
    const invalidEdge = { ...validEdge };
    delete invalidEdge.id;
    const result = parser.parseEdges([invalidEdge]);
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_EDGE', '错误类型应该是INVALID_EDGE');
    assertContains(result.error.message, 'id', '错误消息应该提到id字段');
  },

  'parseEdges - 应该拒绝缺少source字段的边': () => {
    const parser = new DataParser();
    const invalidEdge = { ...validEdge };
    delete invalidEdge.source;
    const result = parser.parseEdges([invalidEdge]);
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_EDGE', '错误类型应该是INVALID_EDGE');
    assertContains(result.error.message, 'source', '错误消息应该提到source字段');
  },

  'parseEdges - 应该拒绝缺少target字段的边': () => {
    const parser = new DataParser();
    const invalidEdge = { ...validEdge };
    delete invalidEdge.target;
    const result = parser.parseEdges([invalidEdge]);
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_EDGE', '错误类型应该是INVALID_EDGE');
    assertContains(result.error.message, 'target', '错误消息应该提到target字段');
  },

  'parseEdges - 应该拒绝id格式不正确的边': () => {
    const parser = new DataParser();
    const invalidEdge = { ...validEdge, id: 'invalid-id' };
    const result = parser.parseEdges([invalidEdge]);
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_EDGE', '错误类型应该是INVALID_EDGE');
    assertContains(result.error.message, 'edge-', '错误消息应该提到edge-前缀');
  },

  'parseEdges - 应该拒绝source格式不正确的边': () => {
    const parser = new DataParser();
    const invalidEdge = { ...validEdge, source: 'invalid-source' };
    const result = parser.parseEdges([invalidEdge]);
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_EDGE', '错误类型应该是INVALID_EDGE');
    assertContains(result.error.message, 'source', '错误消息应该提到source');
  },

  'parseEdges - 应该拒绝target格式不正确的边': () => {
    const parser = new DataParser();
    const invalidEdge = { ...validEdge, target: 'invalid-target' };
    const result = parser.parseEdges([invalidEdge]);
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_EDGE', '错误类型应该是INVALID_EDGE');
    assertContains(result.error.message, 'target', '错误消息应该提到target');
  },

  'parseEdges - 应该拒绝type无效的边': () => {
    const parser = new DataParser();
    const invalidEdge = { ...validEdge, type: 'invalid-type' };
    const result = parser.parseEdges([invalidEdge]);
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_EDGE', '错误类型应该是INVALID_EDGE');
    assertContains(result.error.message, 'type', '错误消息应该提到type');
  },

  'parseEdges - 应该拒绝strength超出范围的边': () => {
    const parser = new DataParser();
    const invalidEdge = { ...validEdge, strength: 1.5 };
    const result = parser.parseEdges([invalidEdge]);
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_EDGE', '错误类型应该是INVALID_EDGE');
    assertContains(result.error.message, 'strength', '错误消息应该提到strength');
  },

  'parseEdges - 应该成功解析空数组': () => {
    const parser = new DataParser();
    const result = parser.parseEdges([]);
    
    assert(result.success, '解析应该成功');
    assertEqual(result.data.length, 0, '应该有0条边');
  },

  // ========== parseApplications 测试 ==========

  'parseApplications - 应该成功解析有效的应用案例数组': () => {
    const parser = new DataParser();
    const result = parser.parseApplications([validApplication]);
    
    assert(result.success, '解析应该成功');
    assert(result.data !== null, '数据不应为null');
    assertEqual(result.data.length, 1, '应该有1个应用案例');
    assertEqual(result.data[0].id, 'app-test-1', '应用案例ID应该匹配');
  },

  'parseApplications - 应该成功解析包含metadata的对象': () => {
    const parser = new DataParser();
    const input = {
      metadata: { version: '2.0' },
      data: [validApplication]
    };
    const result = parser.parseApplications(input);
    
    assert(result.success, '解析应该成功');
    assertEqual(result.data.length, 1, '应该有1个应用案例');
    assert(result.metadata !== null, 'metadata不应为null');
  },

  'parseApplications - 应该拒绝缺少id字段的应用案例': () => {
    const parser = new DataParser();
    const invalidApp = { ...validApplication };
    delete invalidApp.id;
    const result = parser.parseApplications([invalidApp]);
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_APPLICATION', '错误类型应该是INVALID_APPLICATION');
    assertContains(result.error.message, 'id', '错误消息应该提到id字段');
  },

  'parseApplications - 应该拒绝缺少title字段的应用案例': () => {
    const parser = new DataParser();
    const invalidApp = { ...validApplication };
    delete invalidApp.title;
    const result = parser.parseApplications([invalidApp]);
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_APPLICATION', '错误类型应该是INVALID_APPLICATION');
    assertContains(result.error.message, 'title', '错误消息应该提到title字段');
  },

  'parseApplications - 应该拒绝id格式不正确的应用案例': () => {
    const parser = new DataParser();
    const invalidApp = { ...validApplication, id: 'invalid-id' };
    const result = parser.parseApplications([invalidApp]);
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_APPLICATION', '错误类型应该是INVALID_APPLICATION');
    assertContains(result.error.message, 'app-', '错误消息应该提到app-前缀');
  },

  'parseApplications - 应该拒绝relatedNodes不是数组的应用案例': () => {
    const parser = new DataParser();
    const invalidApp = { ...validApplication, relatedNodes: 'node-1' };
    const result = parser.parseApplications([invalidApp]);
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_APPLICATION', '错误类型应该是INVALID_APPLICATION');
    assertContains(result.error.message, 'relatedNodes', '错误消息应该提到relatedNodes');
  },

  'parseApplications - 应该拒绝difficulty超出范围的应用案例': () => {
    const parser = new DataParser();
    const invalidApp = { ...validApplication, difficulty: 0 };
    const result = parser.parseApplications([invalidApp]);
    
    assert(!result.success, '解析应该失败');
    assertEqual(result.error.type, 'INVALID_APPLICATION', '错误类型应该是INVALID_APPLICATION');
    assertContains(result.error.message, 'difficulty', '错误消息应该提到difficulty');
  },

  'parseApplications - 应该成功解析空数组': () => {
    const parser = new DataParser();
    const result = parser.parseApplications([]);
    
    assert(result.success, '解析应该成功');
    assertEqual(result.data.length, 0, '应该有0个应用案例');
  },

  // ========== 边界情况测试 ==========

  'parseNodes - 应该处理空字符串字段': () => {
    const parser = new DataParser();
    const invalidNode = { ...validNode, name: '' };
    const result = parser.parseNodes([invalidNode]);
    
    assert(!result.success, '解析应该失败');
    assertContains(result.error.message, '非空', '错误消息应该提到非空');
  },

  'parseNodes - 应该处理只有空格的字段': () => {
    const parser = new DataParser();
    const invalidNode = { ...validNode, name: '   ' };
    const result = parser.parseNodes([invalidNode]);
    
    assert(!result.success, '解析应该失败');
    assertContains(result.error.message, '非空', '错误消息应该提到非空');
  },

  'parseNodes - 应该处理difficulty为边界值1': () => {
    const parser = new DataParser();
    const node = { ...validNode, difficulty: 1 };
    const result = parser.parseNodes([node]);
    
    assert(result.success, '解析应该成功');
    assertEqual(result.data[0].difficulty, 1, 'difficulty应该为1');
  },

  'parseNodes - 应该处理difficulty为边界值5': () => {
    const parser = new DataParser();
    const node = { ...validNode, difficulty: 5 };
    const result = parser.parseNodes([node]);
    
    assert(result.success, '解析应该成功');
    assertEqual(result.data[0].difficulty, 5, 'difficulty应该为5');
  },

  'parseEdges - 应该处理strength为边界值0': () => {
    const parser = new DataParser();
    const edge = { ...validEdge, strength: 0 };
    const result = parser.parseEdges([edge]);
    
    assert(result.success, '解析应该成功');
    assertEqual(result.data[0].strength, 0, 'strength应该为0');
  },

  'parseEdges - 应该处理strength为边界值1': () => {
    const parser = new DataParser();
    const edge = { ...validEdge, strength: 1 };
    const result = parser.parseEdges([edge]);
    
    assert(result.success, '解析应该成功');
    assertEqual(result.data[0].strength, 1, 'strength应该为1');
  },

  'parseEdges - 应该接受所有有效的type值': () => {
    const parser = new DataParser();
    const types = ['prerequisite', 'cross-domain', 'application'];
    
    for (const type of types) {
      const edge = { ...validEdge, type };
      const result = parser.parseEdges([edge]);
      assert(result.success, `解析type=${type}应该成功`);
    }
  },
};

// 运行测试
function runTests() {
  console.log('开始运行DataParser单元测试...\n');
  
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const [testName, testFn] of Object.entries(tests)) {
    try {
      testFn();
      console.log(`✓ ${testName}`);
      passed++;
    } catch (error) {
      console.log(`✗ ${testName}`);
      console.log(`  ${error.message}\n`);
      failed++;
      failures.push({ testName, error: error.message });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`测试完成: ${passed + failed} 个测试`);
  console.log(`通过: ${passed}`);
  console.log(`失败: ${failed}`);
  console.log('='.repeat(60));

  if (failed > 0) {
    console.log('\n失败的测试:');
    failures.forEach(({ testName, error }) => {
      console.log(`\n${testName}:`);
      console.log(`  ${error}`);
    });
    process.exit(1);
  } else {
    console.log('\n所有测试通过! ✓');
    process.exit(0);
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  runTests();
}

module.exports = { tests, runTests };
