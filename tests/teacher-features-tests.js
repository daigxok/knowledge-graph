/**
 * Teacher Features Unit Tests
 * Tests for teacher lesson planning functionality
 */

import { auth } from '../js/modules/Auth.js';
import { nodeDataManager } from '../js/modules/NodeDataManager.js';
import { lessonPlanGenerator } from '../js/modules/LessonPlanGenerator.js';

// Test results
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

/**
 * Test helper functions
 */
function assert(condition, message) {
    if (condition) {
        testResults.passed++;
        testResults.tests.push({ name: message, status: 'PASS' });
        console.log('✅ PASS:', message);
    } else {
        testResults.failed++;
        testResults.tests.push({ name: message, status: 'FAIL' });
        console.error('❌ FAIL:', message);
    }
}

function assertEquals(actual, expected, message) {
    assert(actual === expected, `${message} (expected: ${expected}, got: ${actual})`);
}

function assertNotNull(value, message) {
    assert(value !== null && value !== undefined, message);
}

/**
 * Test Suite 1: Authentication and Role Management
 */
async function testAuthenticationAndRoles() {
    console.log('\n=== Test Suite 1: Authentication and Role Management ===\n');
    
    // Test 1.1: Register teacher user
    const registerResult = auth.register('test_teacher', 'password123', 'teacher@test.com', 'teacher');
    assert(registerResult.success, 'Should register teacher user successfully');
    assertEquals(registerResult.user.role, 'teacher', 'Registered user should have teacher role');
    
    // Test 1.2: Login teacher user
    const loginResult = auth.login('test_teacher', 'password123');
    assert(loginResult.success, 'Should login teacher user successfully');
    
    // Test 1.3: Check teacher role
    assert(auth.isTeacher(), 'Should identify user as teacher');
    assertEquals(auth.getUserRole(), 'teacher', 'Should return teacher role');
    
    // Test 1.4: Register student user
    const studentResult = auth.register('test_student', 'password123', 'student@test.com', 'student');
    assert(studentResult.success, 'Should register student user successfully');
    
    // Test 1.5: Invalid role
    const invalidResult = auth.register('test_invalid', 'password123', '', 'invalid_role');
    assert(!invalidResult.success, 'Should reject invalid role');
}

/**
 * Test Suite 2: Node Data Management
 */
async function testNodeDataManagement() {
    console.log('\n=== Test Suite 2: Node Data Management ===\n');
    
    // Load nodes
    await nodeDataManager.loadNodes();
    
    // Test 2.1: Create node with valid data
    const validNode = {
        name: '测试节点',
        nameEn: 'Test Node',
        description: '这是一个测试节点',
        domains: ['domain-1'],
        difficulty: 3,
        importance: 4
    };
    
    const createResult = nodeDataManager.createNode(validNode);
    assert(createResult.success, 'Should create node with valid data');
    assertNotNull(createResult.node, 'Created node should not be null');
    assertNotNull(createResult.node.id, 'Created node should have ID');
    
    // Test 2.2: Create node with missing required fields
    const invalidNode = {
        name: '不完整节点',
        domains: ['domain-1']
        // Missing nameEn and description
    };
    
    const invalidResult = nodeDataManager.createNode(invalidNode);
    assert(!invalidResult.success, 'Should reject node with missing required fields');
    
    // Test 2.3: Create node with empty domains
    const noDomainNode = {
        name: '无学域节点',
        nameEn: 'No Domain Node',
        description: '测试',
        domains: []
    };
    
    const noDomainResult = nodeDataManager.createNode(noDomainNode);
    assert(!noDomainResult.success, 'Should reject node with empty domains');
    
    // Test 2.4: Update existing node
    if (createResult.success) {
        const updateResult = nodeDataManager.updateNode(createResult.node.id, {
            description: '更新后的描述'
        });
        assert(updateResult.success, 'Should update existing node');
        assertEquals(updateResult.node.description, '更新后的描述', 'Description should be updated');
        assert(updateResult.node.version > createResult.node.version, 'Version should increment');
    }
    
    // Test 2.5: Update non-existent node
    const nonExistentUpdate = nodeDataManager.updateNode('non-existent-id', {
        description: '测试'
    });
    assert(!nonExistentUpdate.success, 'Should reject update of non-existent node');
    
    // Test 2.6: Node ID generation
    const id1 = nodeDataManager.generateNodeId('domain-1');
    const id2 = nodeDataManager.generateNodeId('domain-1');
    assert(id1 !== id2, 'Generated IDs should be unique');
    assert(id1.startsWith('node-d1-'), 'ID should have correct format');
}

/**
 * Test Suite 3: Circular Dependency Detection
 */
async function testCircularDependencyDetection() {
    console.log('\n=== Test Suite 3: Circular Dependency Detection ===\n');
    
    // Test 3.1: Create nodes for circular dependency test
    const nodeA = nodeDataManager.createNode({
        name: '节点A',
        nameEn: 'Node A',
        description: '测试节点A',
        domains: ['domain-1']
    });
    
    const nodeB = nodeDataManager.createNode({
        name: '节点B',
        nameEn: 'Node B',
        description: '测试节点B',
        domains: ['domain-1'],
        prerequisites: [nodeA.node.id]
    });
    
    assert(nodeA.success && nodeB.success, 'Should create test nodes');
    
    // Test 3.2: Detect direct circular dependency
    const circularResult = nodeDataManager.updateNode(nodeA.node.id, {
        prerequisites: [nodeB.node.id]
    });
    
    assert(!circularResult.success, 'Should detect direct circular dependency');
    assert(circularResult.message.includes('循环依赖'), 'Error message should mention circular dependency');
    
    // Test 3.3: Create chain for indirect circular dependency
    const nodeC = nodeDataManager.createNode({
        name: '节点C',
        nameEn: 'Node C',
        description: '测试节点C',
        domains: ['domain-1'],
        prerequisites: [nodeB.node.id]
    });
    
    if (nodeC.success) {
        const indirectCircular = nodeDataManager.updateNode(nodeA.node.id, {
            prerequisites: [nodeC.node.id]
        });
        
        assert(!indirectCircular.success, 'Should detect indirect circular dependency');
    }
}

/**
 * Test Suite 4: Backup and Restore
 */
async function testBackupAndRestore() {
    console.log('\n=== Test Suite 4: Backup and Restore ===\n');
    
    // Test 4.1: Create backup
    const backupResult = nodeDataManager.createBackup();
    assert(backupResult.success, 'Should create backup successfully');
    assertNotNull(backupResult.backupKey, 'Backup should have a key');
    
    // Test 4.2: List backups
    const backups = nodeDataManager.listBackups();
    assert(Array.isArray(backups), 'Should return array of backups');
    assert(backups.length > 0, 'Should have at least one backup');
    
    // Test 4.3: Restore from backup
    if (backups.length > 0) {
        const restoreResult = nodeDataManager.restoreFromBackup(backups[0].key);
        assert(restoreResult.success, 'Should restore from backup successfully');
    }
    
    // Test 4.4: Restore from non-existent backup
    const invalidRestore = nodeDataManager.restoreFromBackup('non-existent-backup');
    assert(!invalidRestore.success, 'Should reject restore from non-existent backup');
}

/**
 * Test Suite 5: Lesson Plan Generation
 */
async function testLessonPlanGeneration() {
    console.log('\n=== Test Suite 5: Lesson Plan Generation ===\n');
    
    // Test 5.1: Generate lesson plan for existing node
    const nodes = nodeDataManager.getAllNodes();
    if (nodes.length > 0) {
        const result = lessonPlanGenerator.generate(nodes[0].id);
        assert(result.success, 'Should generate lesson plan successfully');
        assertNotNull(result.lessonPlan, 'Lesson plan should not be null');
        assert(result.lessonPlan.sections.length === 9, 'Lesson plan should have 9 sections');
        assertEquals(result.lessonPlan.nodeId, nodes[0].id, 'Lesson plan should reference correct node');
    }
    
    // Test 5.2: Generate lesson plan for non-existent node
    const invalidResult = lessonPlanGenerator.generate('non-existent-node');
    assert(!invalidResult.success, 'Should reject generation for non-existent node');
    
    // Test 5.3: Batch generation
    if (nodes.length >= 3) {
        const nodeIds = nodes.slice(0, 3).map(n => n.id);
        const batchResult = lessonPlanGenerator.generateBatch(nodeIds);
        assert(batchResult.success, 'Should generate batch lesson plans successfully');
        assertEquals(batchResult.count, 3, 'Should generate 3 lesson plans');
        assert(Array.isArray(batchResult.lessonPlans), 'Should return array of lesson plans');
    }
    
    // Test 5.4: Template management
    const customTemplate = {
        sections: [
            { id: 'custom1', title: '自定义章节1', required: true },
            { id: 'custom2', title: '自定义章节2', required: false }
        ]
    };
    
    const saveResult = lessonPlanGenerator.saveTemplate(customTemplate);
    assert(saveResult.success, 'Should save custom template');
    
    const loadedTemplate = lessonPlanGenerator.loadTemplate();
    assertNotNull(loadedTemplate, 'Should load template');
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log('🧪 Starting Teacher Features Tests...\n');
    
    try {
        await testAuthenticationAndRoles();
        await testNodeDataManagement();
        await testCircularDependencyDetection();
        await testBackupAndRestore();
        await testLessonPlanGeneration();
        
        // Print summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 Test Summary');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);
        console.log(`Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
        console.log('='.repeat(50));
        
        // Return results
        return testResults;
        
    } catch (error) {
        console.error('❌ Test execution failed:', error);
        throw error;
    }
}

// Export for use in test runner
export { runAllTests, testResults };

// Auto-run if loaded directly
if (typeof window !== 'undefined') {
    window.runTeacherTests = runAllTests;
}
