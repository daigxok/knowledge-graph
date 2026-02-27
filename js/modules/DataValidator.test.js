/**
 * Unit Tests for DataValidator Module
 * Tests validation functions for domains, nodes, edges, and circular dependencies
 */

import {
  ValidationError,
  DataLoadError,
  validateDomainData,
  validateNodeData,
  detectCircularPrerequisites,
  validateNodeReferences,
  validateDomainReferences,
  validateEdgeData,
  validateGraphData
} from './DataValidator.js';

// Test counters
let passCount = 0;
let failCount = 0;
let testResults = [];

/**
 * Test assertion helper
 */
function assert(condition, testName) {
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passCount++;
    testResults.push({ name: testName, passed: true });
  } else {
    console.log(`✗ FAIL: ${testName}`);
    failCount++;
    testResults.push({ name: testName, passed: false });
  }
}

/**
 * Test that a function throws an error
 */
function assertThrows(fn, errorType, testName) {
  try {
    fn();
    console.log(`✗ FAIL: ${testName} (expected error but none was thrown)`);
    failCount++;
    testResults.push({ name: testName, passed: false });
  } catch (error) {
    if (errorType && !(error instanceof errorType)) {
      console.log(`✗ FAIL: ${testName} (wrong error type: ${error.constructor.name})`);
      failCount++;
      testResults.push({ name: testName, passed: false });
    } else {
      console.log(`✓ PASS: ${testName}`);
      passCount++;
      testResults.push({ name: testName, passed: true });
    }
  }
}

/**
 * Section header
 */
function section(title) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(title);
  console.log('='.repeat(70));
}

// Sample valid data for testing
const validDomain = {
  id: 'domain-1',
  name: '变化与逼近',
  nameEn: 'Change and Approximation',
  coreIdea: '用离散逼近连续，用局部刻画整体',
  description: '通过极限、导数和微分的概念，理解如何用离散的方法逼近连续的变化',
  integratedContent: ['极限论', '导数论', '微分学'],
  traditionalChapters: ['chapter-1', 'chapter-2', 'chapter-3'],
  typicalProblems: ['瞬时变化率', '最优化问题'],
  realWorldScenarios: [
    {
      title: '自动驾驶轨迹规划',
      description: '使用导数计算车辆的瞬时速度和加速度',
      concepts: ['导数', '微分', '曲率'],
      industry: '人工智能'
    }
  ],
  color: '#667eea',
  icon: '📈',
  keySkills: ['函数极限与连续Skill', '导数与微分Skill']
};

const validNode = {
  id: 'node-limit-def',
  name: '极限的定义',
  nameEn: 'Definition of Limit',
  description: '函数极限的ε-δ定义，是微积分的基础概念',
  domains: ['domain-1'],
  traditionalChapter: 'chapter-1',
  difficulty: 3,
  prerequisites: [],
  relatedSkills: ['函数极限与连续Skill'],
  formula: '\\lim_{x \\to a} f(x) = L',
  keywords: ['极限', 'ε-δ', '逼近'],
  importance: 5,
  estimatedStudyTime: 60
};

const validEdge = {
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  type: 'prerequisite',
  strength: 0.8,
  description: '导数定义基于极限概念'
};

// Run tests
console.log('🧪 DataValidator Test Suite\n');

// Test 1: ValidationError and DataLoadError classes
section('Test 1: Error Classes');
try {
  throw new ValidationError('Test validation error');
} catch (error) {
  assert(error instanceof ValidationError, 'ValidationError should be instance of ValidationError');
  assert(error.name === 'ValidationError', 'ValidationError should have correct name');
  assert(error.message === 'Test validation error', 'ValidationError should have correct message');
}

try {
  throw new DataLoadError('Test data load error');
} catch (error) {
  assert(error instanceof DataLoadError, 'DataLoadError should be instance of DataLoadError');
  assert(error.name === 'DataLoadError', 'DataLoadError should have correct name');
  assert(error.message === 'Test data load error', 'DataLoadError should have correct message');
}

// Test 2: validateDomainData - Valid domain
section('Test 2: validateDomainData - Valid Domain');
try {
  const result = validateDomainData(validDomain);
  assert(result === true, 'Valid domain should pass validation');
} catch (error) {
  assert(false, `Valid domain should not throw error: ${error.message}`);
}

// Test 3: validateDomainData - Missing required fields
section('Test 3: validateDomainData - Missing Required Fields');
const requiredDomainFields = [
  'id', 'name', 'nameEn', 'coreIdea', 'description',
  'integratedContent', 'traditionalChapters', 'typicalProblems',
  'realWorldScenarios', 'color', 'icon', 'keySkills'
];

requiredDomainFields.forEach(field => {
  const invalidDomain = { ...validDomain };
  delete invalidDomain[field];
  assertThrows(
    () => validateDomainData(invalidDomain),
    ValidationError,
    `Domain missing ${field} should throw ValidationError`
  );
});

// Test 4: validateDomainData - Invalid field types
section('Test 4: validateDomainData - Invalid Field Types');

assertThrows(
  () => validateDomainData({ ...validDomain, id: '' }),
  ValidationError,
  'Empty id should throw ValidationError'
);

assertThrows(
  () => validateDomainData({ ...validDomain, integratedContent: 'not-an-array' }),
  ValidationError,
  'Non-array integratedContent should throw ValidationError'
);

assertThrows(
  () => validateDomainData({ ...validDomain, integratedContent: [] }),
  ValidationError,
  'Empty integratedContent should throw ValidationError'
);

assertThrows(
  () => validateDomainData({ ...validDomain, color: 'invalid-color' }),
  ValidationError,
  'Invalid color format should throw ValidationError'
);

assertThrows(
  () => validateDomainData({ ...validDomain, color: '#12345' }),
  ValidationError,
  'Short hex color should throw ValidationError'
);

// Test 5: validateDomainData - Invalid scenario structure
section('Test 5: validateDomainData - Invalid Scenario Structure');

assertThrows(
  () => validateDomainData({
    ...validDomain,
    realWorldScenarios: [{ title: 'Test' }] // Missing required fields
  }),
  ValidationError,
  'Scenario missing description should throw ValidationError'
);

assertThrows(
  () => validateDomainData({
    ...validDomain,
    realWorldScenarios: [{
      title: 'Test',
      description: 'Test desc',
      concepts: 'not-an-array',
      industry: 'Test'
    }]
  }),
  ValidationError,
  'Scenario with non-array concepts should throw ValidationError'
);

// Test 6: validateNodeData - Valid node
section('Test 6: validateNodeData - Valid Node');
try {
  const result = validateNodeData(validNode);
  assert(result === true, 'Valid node should pass validation');
} catch (error) {
  assert(false, `Valid node should not throw error: ${error.message}`);
}

// Test 7: validateNodeData - Missing required fields
section('Test 7: validateNodeData - Missing Required Fields');
const requiredNodeFields = [
  'id', 'name', 'nameEn', 'description', 'domains',
  'traditionalChapter', 'difficulty', 'prerequisites',
  'relatedSkills', 'formula', 'keywords', 'importance', 'estimatedStudyTime'
];

requiredNodeFields.forEach(field => {
  const invalidNode = { ...validNode };
  delete invalidNode[field];
  assertThrows(
    () => validateNodeData(invalidNode),
    ValidationError,
    `Node missing ${field} should throw ValidationError`
  );
});

// Test 8: validateNodeData - Invalid field types and ranges
section('Test 8: validateNodeData - Invalid Field Types and Ranges');

assertThrows(
  () => validateNodeData({ ...validNode, domains: [] }),
  ValidationError,
  'Empty domains array should throw ValidationError'
);

assertThrows(
  () => validateNodeData({ ...validNode, difficulty: 0 }),
  ValidationError,
  'Difficulty below 1 should throw ValidationError'
);

assertThrows(
  () => validateNodeData({ ...validNode, difficulty: 6 }),
  ValidationError,
  'Difficulty above 5 should throw ValidationError'
);

assertThrows(
  () => validateNodeData({ ...validNode, importance: 0 }),
  ValidationError,
  'Importance below 1 should throw ValidationError'
);

assertThrows(
  () => validateNodeData({ ...validNode, importance: 6 }),
  ValidationError,
  'Importance above 5 should throw ValidationError'
);

assertThrows(
  () => validateNodeData({ ...validNode, estimatedStudyTime: 0 }),
  ValidationError,
  'Zero estimatedStudyTime should throw ValidationError'
);

assertThrows(
  () => validateNodeData({ ...validNode, estimatedStudyTime: -10 }),
  ValidationError,
  'Negative estimatedStudyTime should throw ValidationError'
);

assertThrows(
  () => validateNodeData({ ...validNode, keywords: [] }),
  ValidationError,
  'Empty keywords array should throw ValidationError'
);

// Test 9: detectCircularPrerequisites - No cycles
section('Test 9: detectCircularPrerequisites - No Cycles');

const validNodes = [
  { id: 'node-1', prerequisites: [] },
  { id: 'node-2', prerequisites: ['node-1'] },
  { id: 'node-3', prerequisites: ['node-1', 'node-2'] }
];

try {
  const result = detectCircularPrerequisites(validNodes);
  assert(result === true, 'Valid prerequisite chain should pass');
} catch (error) {
  assert(false, `Valid prerequisite chain should not throw error: ${error.message}`);
}

// Test 10: detectCircularPrerequisites - Direct cycle
section('Test 10: detectCircularPrerequisites - Direct Cycle');

const directCycleNodes = [
  { id: 'node-1', prerequisites: ['node-2'] },
  { id: 'node-2', prerequisites: ['node-1'] }
];

assertThrows(
  () => detectCircularPrerequisites(directCycleNodes),
  ValidationError,
  'Direct circular prerequisite should throw ValidationError'
);

// Test 11: detectCircularPrerequisites - Indirect cycle
section('Test 11: detectCircularPrerequisites - Indirect Cycle');

const indirectCycleNodes = [
  { id: 'node-1', prerequisites: ['node-2'] },
  { id: 'node-2', prerequisites: ['node-3'] },
  { id: 'node-3', prerequisites: ['node-1'] }
];

assertThrows(
  () => detectCircularPrerequisites(indirectCycleNodes),
  ValidationError,
  'Indirect circular prerequisite should throw ValidationError'
);

// Test 12: detectCircularPrerequisites - Self-reference
section('Test 12: detectCircularPrerequisites - Self-Reference');

const selfReferenceNodes = [
  { id: 'node-1', prerequisites: ['node-1'] }
];

assertThrows(
  () => detectCircularPrerequisites(selfReferenceNodes),
  ValidationError,
  'Self-referencing prerequisite should throw ValidationError'
);

// Test 13: detectCircularPrerequisites - Complex graph with no cycles
section('Test 13: detectCircularPrerequisites - Complex Graph');

const complexValidNodes = [
  { id: 'node-1', prerequisites: [] },
  { id: 'node-2', prerequisites: [] },
  { id: 'node-3', prerequisites: ['node-1'] },
  { id: 'node-4', prerequisites: ['node-1', 'node-2'] },
  { id: 'node-5', prerequisites: ['node-3', 'node-4'] }
];

try {
  const result = detectCircularPrerequisites(complexValidNodes);
  assert(result === true, 'Complex valid graph should pass');
} catch (error) {
  assert(false, `Complex valid graph should not throw error: ${error.message}`);
}

// Test 14: validateNodeReferences - Valid references
section('Test 14: validateNodeReferences - Valid References');

try {
  const result = validateNodeReferences(validNodes);
  assert(result === true, 'Valid node references should pass');
} catch (error) {
  assert(false, `Valid node references should not throw error: ${error.message}`);
}

// Test 15: validateNodeReferences - Invalid reference
section('Test 15: validateNodeReferences - Invalid Reference');

const invalidRefNodes = [
  { id: 'node-1', prerequisites: [] },
  { id: 'node-2', prerequisites: ['node-1', 'node-999'] } // node-999 doesn't exist
];

assertThrows(
  () => validateNodeReferences(invalidRefNodes),
  ValidationError,
  'Invalid node reference should throw ValidationError'
);

// Test 16: validateDomainReferences - Valid references
section('Test 16: validateDomainReferences - Valid References');

const testNodes = [
  { id: 'node-1', domains: ['domain-1'] },
  { id: 'node-2', domains: ['domain-1', 'domain-2'] }
];

const testDomains = [
  { id: 'domain-1' },
  { id: 'domain-2' }
];

try {
  const result = validateDomainReferences(testNodes, testDomains);
  assert(result === true, 'Valid domain references should pass');
} catch (error) {
  assert(false, `Valid domain references should not throw error: ${error.message}`);
}

// Test 17: validateDomainReferences - Invalid reference
section('Test 17: validateDomainReferences - Invalid Reference');

const invalidDomainRefNodes = [
  { id: 'node-1', domains: ['domain-1', 'domain-999'] } // domain-999 doesn't exist
];

assertThrows(
  () => validateDomainReferences(invalidDomainRefNodes, testDomains),
  ValidationError,
  'Invalid domain reference should throw ValidationError'
);

// Test 18: validateEdgeData - Valid edge
section('Test 18: validateEdgeData - Valid Edge');

try {
  const result = validateEdgeData(validEdge);
  assert(result === true, 'Valid edge should pass validation');
} catch (error) {
  assert(false, `Valid edge should not throw error: ${error.message}`);
}

// Test 19: validateEdgeData - Invalid edge types
section('Test 19: validateEdgeData - Invalid Edge Types');

assertThrows(
  () => validateEdgeData({ ...validEdge, type: 'invalid-type' }),
  ValidationError,
  'Invalid edge type should throw ValidationError'
);

assertThrows(
  () => validateEdgeData({ ...validEdge, strength: 1.5 }),
  ValidationError,
  'Strength above 1 should throw ValidationError'
);

assertThrows(
  () => validateEdgeData({ ...validEdge, strength: -0.1 }),
  ValidationError,
  'Negative strength should throw ValidationError'
);

// Test 20: validateGraphData - Complete valid graph
section('Test 20: validateGraphData - Complete Valid Graph');

const validGraphData = {
  domains: [validDomain],
  nodes: [validNode],
  edges: [validEdge]
};

const graphResult = validateGraphData(validGraphData);
assert(graphResult.success === true, 'Valid graph data should pass validation');
assert(graphResult.stats.domains === 1, 'Graph stats should show 1 domain');
assert(graphResult.stats.nodes === 1, 'Graph stats should show 1 node');
assert(graphResult.stats.edges === 1, 'Graph stats should show 1 edge');

// Test 21: validateGraphData - Invalid graph structure
section('Test 21: validateGraphData - Invalid Graph Structure');

const invalidGraphData = {
  domains: [{ ...validDomain, color: 'invalid' }], // Invalid color
  nodes: [{ ...validNode, difficulty: 10 }], // Invalid difficulty
  edges: [validEdge]
};

const invalidResult = validateGraphData(invalidGraphData);
assert(invalidResult.success === false, 'Invalid graph data should fail validation');
assert(invalidResult.errors.length > 0, 'Invalid graph should have error messages');

// Test 22: Edge cases
section('Test 22: Edge Cases');

// Null/undefined inputs
assertThrows(
  () => validateDomainData(null),
  ValidationError,
  'Null domain should throw ValidationError'
);

assertThrows(
  () => validateNodeData(undefined),
  ValidationError,
  'Undefined node should throw ValidationError'
);

assertThrows(
  () => detectCircularPrerequisites('not-an-array'),
  ValidationError,
  'Non-array input to detectCircularPrerequisites should throw'
);

// Empty arrays
try {
  const result = detectCircularPrerequisites([]);
  assert(result === true, 'Empty node array should pass circular detection');
} catch (error) {
  assert(false, `Empty node array should not throw error: ${error.message}`);
}

// Node with missing prerequisites field
const nodeWithoutPrereqs = [
  { id: 'node-1' } // No prerequisites field
];

try {
  const result = detectCircularPrerequisites(nodeWithoutPrereqs);
  assert(result === true, 'Node without prerequisites field should be handled gracefully');
} catch (error) {
  assert(false, `Node without prerequisites should not throw error: ${error.message}`);
}

// Test 23: Requirement 10.3 validation
section('Test 23: Requirement 10.3 - Data Validation Error Handling');

// Test that validation provides descriptive error messages
const domainMissingField = { ...validDomain };
delete domainMissingField.name;

try {
  validateDomainData(domainMissingField);
  assert(false, 'Should throw error for missing field');
} catch (error) {
  assert(
    error.message.includes('missing required field'),
    'Error message should be descriptive about missing field'
  );
}

// Test that circular dependency detection provides path information
const cycleNodes = [
  { id: 'A', prerequisites: ['B'] },
  { id: 'B', prerequisites: ['C'] },
  { id: 'C', prerequisites: ['A'] }
];

try {
  detectCircularPrerequisites(cycleNodes);
  assert(false, 'Should throw error for circular dependency');
} catch (error) {
  assert(
    error.message.includes('Circular prerequisite detected'),
    'Error message should indicate circular dependency'
  );
  assert(
    error.message.includes('→'),
    'Error message should show the cycle path'
  );
}

// Summary
section('Test Summary');
console.log(`\nTotal Tests: ${passCount + failCount}`);
console.log(`Passed: ${passCount} ✓`);
console.log(`Failed: ${failCount} ✗`);
console.log(`Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);

if (failCount === 0) {
  console.log('\n🎉 All tests passed! DataValidator is working correctly.');
  console.log('\n✅ Requirement 10.3 validated: Data validation with comprehensive error handling');
} else {
  console.log(`\n⚠️ ${failCount} test(s) failed. Please review the failures above.`);
}

// Export test results for external use
export { passCount, failCount, testResults };
