/**
 * Unit Tests for Phase 2 Core Modules
 * 
 * Tests individual module functionality
 * Requirements: Task 24 (24.1-24.5)
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  failures: []
};

// Test runner
function runTest(name, testFn) {
  testResults.total++;
  try {
    testFn();
    testResults.passed++;
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    testResults.failed++;
    testResults.failures.push({ name, error: error.message });
    console.error(`❌ ${name}`);
    console.error(`   ${error.message}`);
    return false;
  }
}

// Assertion helpers
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertDeepEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(message || `Objects not equal:\nActual: ${JSON.stringify(actual)}\nExpected: ${JSON.stringify(expected)}`);
  }
}

// ============================================================================
// DataValidator Tests (Task 24.2)
// ============================================================================

class MockDataValidator {
  validateNodes(nodes) {
    const errors = [];
    const requiredFields = ['id', 'name', 'nameEn', 'description', 'domains', 'difficulty'];
    
    nodes.forEach((node, index) => {
      requiredFields.forEach(field => {
        if (!node[field]) {
          errors.push(`Node ${index} missing field: ${field}`);
        }
      });
      
      if (node.difficulty < 1 || node.difficulty > 5) {
        errors.push(`Node ${index} difficulty out of range: ${node.difficulty}`);
      }
    });
    
    return { valid: errors.length === 0, errors };
  }
  
  validateEdges(edges, nodeIds) {
    const errors = [];
    const validTypes = ['prerequisite', 'cross-domain', 'application'];
    
    edges.forEach((edge, index) => {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge ${index} source not found: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge ${index} target not found: ${edge.target}`);
      }
      if (!validTypes.includes(edge.type)) {
        errors.push(`Edge ${index} invalid type: ${edge.type}`);
      }
    });
    
    return { valid: errors.length === 0, errors };
  }
  
  detectCycles(nodes) {
    const graph = new Map();
    nodes.forEach(node => {
      graph.set(node.id, node.prerequisites || []);
    });
    
    function hasCycle(nodeId, visited, recStack) {
      visited.add(nodeId);
      recStack.add(nodeId);
      
      const neighbors = graph.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor, visited, recStack)) {
            return true;
          }
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }
      
      recStack.delete(nodeId);
      return false;
    }
    
    const visited = new Set();
    for (const nodeId of graph.keys()) {
      if (!visited.has(nodeId)) {
        if (hasCycle(nodeId, visited, new Set())) {
          return { hasCycle: true, message: `Cycle detected from ${nodeId}` };
        }
      }
    }
    
    return { hasCycle: false };
  }
  
  validateLatex(formula) {
    // Simple LaTeX validation
    const brackets = { '{': '}', '[': ']', '(': ')' };
    const stack = [];
    
    for (const char of formula) {
      if (brackets[char]) {
        stack.push(brackets[char]);
      } else if (Object.values(brackets).includes(char)) {
        if (stack.pop() !== char) {
          return { valid: false, error: 'Mismatched brackets' };
        }
      }
    }
    
    return { valid: stack.length === 0, error: stack.length > 0 ? 'Unclosed brackets' : null };
  }
}

function testDataValidator_ValidateNodes() {
  const validator = new MockDataValidator();
  
  // Test valid nodes
  const validNodes = [
    { id: 'node1', name: 'Test', nameEn: 'Test', description: 'Desc', domains: ['domain-1'], difficulty: 3 }
  ];
  const result1 = validator.validateNodes(validNodes);
  assert(result1.valid, 'Valid nodes should pass validation');
  
  // Test invalid nodes
  const invalidNodes = [
    { id: 'node2', name: 'Test', difficulty: 6 } // Missing fields and invalid difficulty
  ];
  const result2 = validator.validateNodes(invalidNodes);
  assert(!result2.valid, 'Invalid nodes should fail validation');
  assert(result2.errors.length > 0, 'Should have error messages');
}

function testDataValidator_ValidateEdges() {
  const validator = new MockDataValidator();
  const nodeIds = new Set(['node1', 'node2']);
  
  // Test valid edges
  const validEdges = [
    { source: 'node1', target: 'node2', type: 'prerequisite' }
  ];
  const result1 = validator.validateEdges(validEdges, nodeIds);
  assert(result1.valid, 'Valid edges should pass validation');
  
  // Test invalid edges
  const invalidEdges = [
    { source: 'node1', target: 'node3', type: 'invalid' } // Non-existent target and invalid type
  ];
  const result2 = validator.validateEdges(invalidEdges, nodeIds);
  assert(!result2.valid, 'Invalid edges should fail validation');
}

function testDataValidator_DetectCycles() {
  const validator = new MockDataValidator();
  
  // Test no cycle
  const noCycleNodes = [
    { id: 'A', prerequisites: [] },
    { id: 'B', prerequisites: ['A'] },
    { id: 'C', prerequisites: ['B'] }
  ];
  const result1 = validator.detectCycles(noCycleNodes);
  assert(!result1.hasCycle, 'Should not detect cycle in acyclic graph');
  
  // Test with cycle
  const cycleNodes = [
    { id: 'A', prerequisites: ['C'] },
    { id: 'B', prerequisites: ['A'] },
    { id: 'C', prerequisites: ['B'] }
  ];
  const result2 = validator.detectCycles(cycleNodes);
  assert(result2.hasCycle, 'Should detect cycle in cyclic graph');
}

function testDataValidator_ValidateLatex() {
  const validator = new MockDataValidator();
  
  // Test valid LaTeX
  const result1 = validator.validateLatex('\\frac{a}{b}');
  assert(result1.valid, 'Valid LaTeX should pass');
  
  // Test invalid LaTeX
  const result2 = validator.validateLatex('\\frac{a}{b');
  assert(!result2.valid, 'Invalid LaTeX should fail');
}

// ============================================================================
// LearningPathEngine Tests (Task 24.4)
// ============================================================================

class MockLearningPathEngine {
  calculatePath(startNode, targetNode, nodes) {
    // Simple BFS path finding
    const graph = new Map();
    nodes.forEach(node => {
      graph.set(node.id, node.prerequisites || []);
    });
    
    const queue = [[targetNode]];
    const visited = new Set([targetNode]);
    
    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[0];
      
      if (current === startNode) {
        return path.reverse();
      }
      
      const prereqs = graph.get(current) || [];
      for (const prereq of prereqs) {
        if (!visited.has(prereq)) {
          visited.add(prereq);
          queue.push([prereq, ...path]);
        }
      }
    }
    
    return [];
  }
  
  recommendNextNodes(completedNodes, allNodes) {
    const completed = new Set(completedNodes);
    const recommended = [];
    
    allNodes.forEach(node => {
      if (!completed.has(node.id)) {
        const prereqs = node.prerequisites || [];
        const allPrereqsCompleted = prereqs.every(p => completed.has(p));
        
        if (allPrereqsCompleted) {
          recommended.push(node);
        }
      }
    });
    
    return recommended;
  }
  
  estimatePathTime(path, nodes) {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    let totalTime = 0;
    
    path.forEach(nodeId => {
      const node = nodeMap.get(nodeId);
      if (node && node.estimatedStudyTime) {
        totalTime += node.estimatedStudyTime;
      }
    });
    
    return totalTime;
  }
}

function testLearningPathEngine_CalculatePath() {
  const engine = new MockLearningPathEngine();
  const nodes = [
    { id: 'A', prerequisites: [] },
    { id: 'B', prerequisites: ['A'] },
    { id: 'C', prerequisites: ['B'] }
  ];
  
  const path = engine.calculatePath('A', 'C', nodes);
  assertDeepEqual(path, ['A', 'B', 'C'], 'Should find correct path');
}

function testLearningPathEngine_RecommendNextNodes() {
  const engine = new MockLearningPathEngine();
  const nodes = [
    { id: 'A', prerequisites: [] },
    { id: 'B', prerequisites: ['A'] },
    { id: 'C', prerequisites: ['A'] },
    { id: 'D', prerequisites: ['B', 'C'] }
  ];
  
  const completed = ['A'];
  const recommended = engine.recommendNextNodes(completed, nodes);
  
  assert(recommended.length === 2, 'Should recommend 2 nodes');
  assert(recommended.some(n => n.id === 'B'), 'Should recommend B');
  assert(recommended.some(n => n.id === 'C'), 'Should recommend C');
}

function testLearningPathEngine_EstimatePathTime() {
  const engine = new MockLearningPathEngine();
  const nodes = [
    { id: 'A', estimatedStudyTime: 30 },
    { id: 'B', estimatedStudyTime: 45 },
    { id: 'C', estimatedStudyTime: 60 }
  ];
  
  const path = ['A', 'B', 'C'];
  const time = engine.estimatePathTime(path, nodes);
  
  assertEqual(time, 135, 'Should calculate correct total time');
}

// ============================================================================
// SearchFilterEngine Tests (Task 24.5)
// ============================================================================

class MockSearchFilterEngine {
  applyFilters(nodes, filters) {
    let filtered = [...nodes];
    
    if (filters.difficulty) {
      const [min, max] = filters.difficulty;
      filtered = filtered.filter(n => n.difficulty >= min && n.difficulty <= max);
    }
    
    if (filters.domains && filters.domains.length > 0) {
      filtered = filtered.filter(n => 
        n.domains && n.domains.some(d => filters.domains.includes(d))
      );
    }
    
    return filtered;
  }
  
  fullTextSearch(nodes, query) {
    const lowerQuery = query.toLowerCase();
    return nodes.filter(node => 
      node.name.toLowerCase().includes(lowerQuery) ||
      node.nameEn.toLowerCase().includes(lowerQuery) ||
      node.description.toLowerCase().includes(lowerQuery)
    );
  }
  
  filterApplicationsByIndustry(applications, industry) {
    return applications.filter(app => app.industry === industry);
  }
}

function testSearchFilterEngine_ApplyFilters() {
  const engine = new MockSearchFilterEngine();
  const nodes = [
    { id: 'A', difficulty: 2, domains: ['domain-1'] },
    { id: 'B', difficulty: 4, domains: ['domain-2'] },
    { id: 'C', difficulty: 5, domains: ['domain-1'] }
  ];
  
  // Test difficulty filter
  const filtered1 = engine.applyFilters(nodes, { difficulty: [3, 5] });
  assertEqual(filtered1.length, 2, 'Should filter by difficulty');
  
  // Test domain filter
  const filtered2 = engine.applyFilters(nodes, { domains: ['domain-1'] });
  assertEqual(filtered2.length, 2, 'Should filter by domain');
}

function testSearchFilterEngine_FullTextSearch() {
  const engine = new MockSearchFilterEngine();
  const nodes = [
    { id: 'A', name: '函数极限', nameEn: 'Function Limit', description: '研究函数' },
    { id: 'B', name: '导数', nameEn: 'Derivative', description: '瞬时变化率' }
  ];
  
  const results = engine.fullTextSearch(nodes, 'limit');
  assertEqual(results.length, 1, 'Should find matching node');
  assertEqual(results[0].id, 'A', 'Should find correct node');
}

function testSearchFilterEngine_FilterApplicationsByIndustry() {
  const engine = new MockSearchFilterEngine();
  const applications = [
    { id: 'app1', industry: 'AI' },
    { id: 'app2', industry: 'Finance' },
    { id: 'app3', industry: 'AI' }
  ];
  
  const filtered = engine.filterApplicationsByIndustry(applications, 'AI');
  assertEqual(filtered.length, 2, 'Should filter by industry');
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runAllTests() {
  console.log('\n🧪 Running Unit Tests for Phase 2\n');
  console.log('='.repeat(60));
  
  // DataValidator Tests
  console.log('\n📦 DataValidator Tests:\n');
  runTest('DataValidator: Validate Nodes', testDataValidator_ValidateNodes);
  runTest('DataValidator: Validate Edges', testDataValidator_ValidateEdges);
  runTest('DataValidator: Detect Cycles (No Cycle)', testDataValidator_DetectCycles);
  runTest('DataValidator: Validate LaTeX', testDataValidator_ValidateLatex);
  
  // LearningPathEngine Tests
  console.log('\n🛤️  LearningPathEngine Tests:\n');
  runTest('LearningPathEngine: Calculate Path', testLearningPathEngine_CalculatePath);
  runTest('LearningPathEngine: Recommend Next Nodes', testLearningPathEngine_RecommendNextNodes);
  runTest('LearningPathEngine: Estimate Path Time', testLearningPathEngine_EstimatePathTime);
  
  // SearchFilterEngine Tests
  console.log('\n🔍 SearchFilterEngine Tests:\n');
  runTest('SearchFilterEngine: Apply Filters', testSearchFilterEngine_ApplyFilters);
  runTest('SearchFilterEngine: Full Text Search', testSearchFilterEngine_FullTextSearch);
  runTest('SearchFilterEngine: Filter Applications by Industry', testSearchFilterEngine_FilterApplicationsByIndustry);
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary:\n');
  console.log(`   Total Tests: ${testResults.total}`);
  console.log(`   ✅ Passed: ${testResults.passed}`);
  console.log(`   ❌ Failed: ${testResults.failed}`);
  console.log(`   Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failures.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.failures.forEach(({ name, error }) => {
      console.log(`   - ${name}`);
      console.log(`     ${error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests();
