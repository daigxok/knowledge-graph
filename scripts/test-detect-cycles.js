/**
 * 测试循环依赖检测功能
 * 
 * 测试场景：
 * 1. 无循环依赖的图
 * 2. 简单循环（A -> B -> A）
 * 3. 多节点循环（A -> B -> C -> A）
 * 4. 多个独立循环
 * 5. 自循环（A -> A）
 * 6. 复杂图结构
 */

const DataValidator = require('./data-validator.js');

// 测试用例1: 无循环依赖
function testNoCycles() {
  console.log('\n=== 测试1: 无循环依赖 ===');
  
  const edges = [
    { id: 'e1', source: 'A', target: 'B', type: 'prerequisite' },
    { id: 'e2', source: 'B', target: 'C', type: 'prerequisite' },
    { id: 'e3', source: 'C', target: 'D', type: 'prerequisite' },
    { id: 'e4', source: 'A', target: 'D', type: 'prerequisite' }
  ];
  
  const validator = new DataValidator();
  const cycles = validator.detectCycles(edges);
  
  console.log('边关系: A->B, B->C, C->D, A->D');
  console.log('检测到的循环:', cycles);
  console.log('预期: 无循环');
  console.log('结果:', cycles.length === 0 ? '✓ 通过' : '✗ 失败');
  
  return cycles.length === 0;
}

// 测试用例2: 简单循环 (A -> B -> A)
function testSimpleCycle() {
  console.log('\n=== 测试2: 简单循环 (A -> B -> A) ===');
  
  const edges = [
    { id: 'e1', source: 'A', target: 'B', type: 'prerequisite' },
    { id: 'e2', source: 'B', target: 'A', type: 'prerequisite' }
  ];
  
  const validator = new DataValidator();
  const cycles = validator.detectCycles(edges);
  
  console.log('边关系: A->B, B->A');
  console.log('检测到的循环:', cycles);
  console.log('预期: 1个循环 [A, B, A]');
  console.log('结果:', cycles.length === 1 ? '✓ 通过' : '✗ 失败');
  
  return cycles.length === 1;
}

// 测试用例3: 多节点循环 (A -> B -> C -> A)
function testMultiNodeCycle() {
  console.log('\n=== 测试3: 多节点循环 (A -> B -> C -> A) ===');
  
  const edges = [
    { id: 'e1', source: 'A', target: 'B', type: 'prerequisite' },
    { id: 'e2', source: 'B', target: 'C', type: 'prerequisite' },
    { id: 'e3', source: 'C', target: 'A', type: 'prerequisite' }
  ];
  
  const validator = new DataValidator();
  const cycles = validator.detectCycles(edges);
  
  console.log('边关系: A->B, B->C, C->A');
  console.log('检测到的循环:', cycles);
  console.log('预期: 1个循环 [A, B, C, A]');
  console.log('结果:', cycles.length === 1 ? '✓ 通过' : '✗ 失败');
  
  return cycles.length === 1;
}

// 测试用例4: 多个独立循环
function testMultipleCycles() {
  console.log('\n=== 测试4: 多个独立循环 ===');
  
  const edges = [
    // 第一个循环: A -> B -> A
    { id: 'e1', source: 'A', target: 'B', type: 'prerequisite' },
    { id: 'e2', source: 'B', target: 'A', type: 'prerequisite' },
    // 第二个循环: C -> D -> E -> C
    { id: 'e3', source: 'C', target: 'D', type: 'prerequisite' },
    { id: 'e4', source: 'D', target: 'E', type: 'prerequisite' },
    { id: 'e5', source: 'E', target: 'C', type: 'prerequisite' }
  ];
  
  const validator = new DataValidator();
  const cycles = validator.detectCycles(edges);
  
  console.log('边关系: A->B->A, C->D->E->C');
  console.log('检测到的循环:', cycles);
  console.log('预期: 2个循环');
  console.log('结果:', cycles.length === 2 ? '✓ 通过' : '✗ 失败');
  
  return cycles.length === 2;
}

// 测试用例5: 自循环 (A -> A)
function testSelfLoop() {
  console.log('\n=== 测试5: 自循环 (A -> A) ===');
  
  const edges = [
    { id: 'e1', source: 'A', target: 'A', type: 'prerequisite' }
  ];
  
  const validator = new DataValidator();
  const cycles = validator.detectCycles(edges);
  
  console.log('边关系: A->A');
  console.log('检测到的循环:', cycles);
  console.log('预期: 1个循环 [A, A]');
  console.log('结果:', cycles.length === 1 ? '✓ 通过' : '✗ 失败');
  
  return cycles.length === 1;
}

// 测试用例6: 复杂图结构（有循环和无循环部分）
function testComplexGraph() {
  console.log('\n=== 测试6: 复杂图结构 ===');
  
  const edges = [
    // 无循环部分
    { id: 'e1', source: 'A', target: 'B', type: 'prerequisite' },
    { id: 'e2', source: 'B', target: 'C', type: 'prerequisite' },
    // 循环部分: D -> E -> F -> D
    { id: 'e3', source: 'D', target: 'E', type: 'prerequisite' },
    { id: 'e4', source: 'E', target: 'F', type: 'prerequisite' },
    { id: 'e5', source: 'F', target: 'D', type: 'prerequisite' },
    // 连接到循环
    { id: 'e6', source: 'C', target: 'D', type: 'prerequisite' }
  ];
  
  const validator = new DataValidator();
  const cycles = validator.detectCycles(edges);
  
  console.log('边关系: A->B->C->D->E->F->D (D-E-F形成循环)');
  console.log('检测到的循环:', cycles);
  console.log('预期: 1个循环 [D, E, F, D]');
  console.log('结果:', cycles.length === 1 ? '✓ 通过' : '✗ 失败');
  
  return cycles.length === 1;
}

// 测试用例7: 只检查prerequisite类型的边
function testOnlyPrerequisiteEdges() {
  console.log('\n=== 测试7: 只检查prerequisite类型的边 ===');
  
  const edges = [
    { id: 'e1', source: 'A', target: 'B', type: 'prerequisite' },
    { id: 'e2', source: 'B', target: 'A', type: 'cross-domain' }, // 非prerequisite
    { id: 'e3', source: 'C', target: 'D', type: 'application' }   // 非prerequisite
  ];
  
  const validator = new DataValidator();
  const cycles = validator.detectCycles(edges);
  
  console.log('边关系: A->B(prerequisite), B->A(cross-domain), C->D(application)');
  console.log('检测到的循环:', cycles);
  console.log('预期: 无循环（因为B->A不是prerequisite类型）');
  console.log('结果:', cycles.length === 0 ? '✓ 通过' : '✗ 失败');
  
  return cycles.length === 0;
}

// 测试用例8: 空边数组
function testEmptyEdges() {
  console.log('\n=== 测试8: 空边数组 ===');
  
  const edges = [];
  
  const validator = new DataValidator();
  const cycles = validator.detectCycles(edges);
  
  console.log('边关系: 无');
  console.log('检测到的循环:', cycles);
  console.log('预期: 无循环');
  console.log('结果:', cycles.length === 0 ? '✓ 通过' : '✗ 失败');
  
  return cycles.length === 0;
}

// 运行所有测试
function runAllTests() {
  console.log('========================================');
  console.log('循环依赖检测测试套件');
  console.log('========================================');
  
  const tests = [
    { name: '无循环依赖', fn: testNoCycles },
    { name: '简单循环', fn: testSimpleCycle },
    { name: '多节点循环', fn: testMultiNodeCycle },
    { name: '多个独立循环', fn: testMultipleCycles },
    { name: '自循环', fn: testSelfLoop },
    { name: '复杂图结构', fn: testComplexGraph },
    { name: '只检查prerequisite边', fn: testOnlyPrerequisiteEdges },
    { name: '空边数组', fn: testEmptyEdges }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      if (test.fn()) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`\n✗ 测试 "${test.name}" 抛出异常:`, error.message);
      failed++;
    }
  }
  
  console.log('\n========================================');
  console.log('测试总结');
  console.log('========================================');
  console.log(`总测试数: ${tests.length}`);
  console.log(`通过: ${passed}`);
  console.log(`失败: ${failed}`);
  console.log(`成功率: ${(passed / tests.length * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n✓ 所有测试通过！');
  } else {
    console.log(`\n✗ ${failed} 个测试失败`);
  }
  
  return failed === 0;
}

// 执行测试
if (require.main === module) {
  const success = runAllTests();
  process.exit(success ? 0 : 1);
}

module.exports = { runAllTests };
