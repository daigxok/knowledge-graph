/**
 * Simple Node.js test runner for KnowledgeGraphEngine
 * Run with: node test-knowledge-graph-engine.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { KnowledgeGraphEngine } from './js/modules/KnowledgeGraphEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test data
const nodesData = JSON.parse(readFileSync(join(__dirname, 'data/nodes.json'), 'utf-8'));
const edgesData = JSON.parse(readFileSync(join(__dirname, 'data/edges.json'), 'utf-8'));

// Test counters
let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`✓ PASS: ${testName}`);
        passCount++;
    } else {
        console.log(`✗ FAIL: ${testName}`);
        failCount++;
    }
}

function section(title) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(title);
    console.log('='.repeat(60));
}

// Run tests
console.log('🧪 KnowledgeGraphEngine Test Suite\n');

try {
    // Create engine instance
    const engine = new KnowledgeGraphEngine(nodesData.nodes, edgesData.edges);
    console.log('✓ KnowledgeGraphEngine instance created\n');

    // Test 1: Constructor and Initialization
    section('Test 1: Constructor and Initialization');
    assert(engine !== null, 'Engine instance should be created');
    assert(engine.nodes.length === 25, 'Should load 25 nodes');
    assert(engine.edges.length === 39, 'Should load 39 edges');
    assert(engine.nodeMap.size === 25, 'Node map should contain 25 entries');
    assert(engine.adjacencyList.size === 25, 'Adjacency list should contain 25 entries');

    // Test empty initialization
    const emptyEngine = new KnowledgeGraphEngine();
    assert(emptyEngine.nodes.length === 0, 'Empty engine should have 0 nodes');
    assert(emptyEngine.edges.length === 0, 'Empty engine should have 0 edges');

    // Test 2: getNode() Method
    section('Test 2: getNode() Method');
    const limitNode = engine.getNode('node-limit-def');
    assert(limitNode !== null, 'getNode should return node-limit-def');
    assert(limitNode.name === '极限的定义', 'Node name should match');
    assert(limitNode.nameEn === 'Definition of Limit', 'Node English name should match');
    assert(limitNode.difficulty === 3, 'Node difficulty should be 3');
    assert(Array.isArray(limitNode.domains), 'Node domains should be an array');
    assert(limitNode.domains.includes('domain-1'), 'Node should belong to domain-1');

    // Test invalid node ID
    const invalidNode = engine.getNode('invalid-node');
    assert(invalidNode === null, 'getNode should return null for invalid ID');

    // Test 3: getNeighbors() Method
    section('Test 3: getNeighbors() Method');
    const limitNeighbors = engine.getNeighbors('node-limit-def');
    assert(Array.isArray(limitNeighbors), 'getNeighbors should return an array');
    assert(limitNeighbors.length > 0, 'node-limit-def should have neighbors');
    
    // Check that neighbors are actual node objects
    limitNeighbors.forEach(neighbor => {
        assert(neighbor !== null && typeof neighbor === 'object', 'Neighbor should be a node object');
        assert('id' in neighbor, 'Neighbor should have an id');
    });

    // Test node with no neighbors
    const leafNode = engine.getNeighbors('node-optimization-algorithms');
    assert(Array.isArray(leafNode), 'getNeighbors should return array for leaf node');

    // Test invalid node
    const invalidNeighbors = engine.getNeighbors('invalid-node');
    assert(invalidNeighbors.length === 0, 'Invalid node should return empty array');

    // Test 4: addNode() Method
    section('Test 4: addNode() Method');
    const initialNodeCount = engine.nodes.length;
    const newNode = {
        id: "node-test-new",
        name: "Test New Node",
        domains: ["domain-1"],
        prerequisites: [],
        difficulty: 2
    };
    
    engine.addNode(newNode);
    assert(engine.nodes.length === initialNodeCount + 1, 'Node count should increase by 1');
    assert(engine.getNode('node-test-new') !== null, 'New node should be retrievable');
    assert(engine.nodeMap.has('node-test-new'), 'Node map should contain new node');
    assert(engine.adjacencyList.has('node-test-new'), 'Adjacency list should contain new node');

    // Test adding duplicate node
    engine.addNode(newNode);
    assert(engine.nodes.length === initialNodeCount + 1, 'Duplicate node should not be added');

    // Test 5: removeNode() Method
    section('Test 5: removeNode() Method');
    const beforeRemove = engine.nodes.length;
    engine.removeNode('node-test-new');
    assert(engine.nodes.length === beforeRemove - 1, 'Node count should decrease by 1');
    assert(engine.getNode('node-test-new') === null, 'Removed node should not be retrievable');
    assert(!engine.nodeMap.has('node-test-new'), 'Node map should not contain removed node');
    assert(!engine.adjacencyList.has('node-test-new'), 'Adjacency list should not contain removed node');

    // Test removing non-existent node
    const beforeInvalid = engine.nodes.length;
    engine.removeNode('invalid-node');
    assert(engine.nodes.length === beforeInvalid, 'Removing invalid node should not change count');

    // Test 6: addEdge() Method
    section('Test 6: addEdge() Method');
    const initialEdgeCount = engine.edges.length;
    const newEdge = {
        id: "edge-test-new",
        source: "node-function-basic",
        target: "node-continuity",
        type: "related",
        strength: 0.5,
        description: "Test edge"
    };
    
    engine.addEdge(newEdge);
    assert(engine.edges.length === initialEdgeCount + 1, 'Edge count should increase by 1');
    
    // Verify adjacency list is updated
    const sourceNeighbors = engine.adjacencyList.get('node-function-basic');
    const hasNewEdge = sourceNeighbors.some(n => n.target === 'node-continuity');
    assert(hasNewEdge, 'Adjacency list should contain new edge');

    // Test 7: removeEdge() Method
    section('Test 7: removeEdge() Method');
    const beforeEdgeRemove = engine.edges.length;
    engine.removeEdge('edge-test-new');
    assert(engine.edges.length === beforeEdgeRemove - 1, 'Edge count should decrease by 1');
    
    const edgeExists = engine.edges.some(e => e.id === 'edge-test-new');
    assert(!edgeExists, 'Removed edge should not exist');

    // Test removing non-existent edge
    const beforeInvalidEdge = engine.edges.length;
    engine.removeEdge('invalid-edge');
    assert(engine.edges.length === beforeInvalidEdge, 'Removing invalid edge should not change count');

    // Test 8: getCrossDomainLinks() Method
    section('Test 8: getCrossDomainLinks() Method');
    const crossDomainLinks = engine.getCrossDomainLinks();
    assert(Array.isArray(crossDomainLinks), 'getCrossDomainLinks should return an array');
    assert(crossDomainLinks.length > 0, 'Should have cross-domain links');
    
    // Verify all returned edges are cross-domain type
    crossDomainLinks.forEach(edge => {
        assert(edge.type === 'cross-domain', 'All returned edges should be cross-domain type');
    });

    // Test 9: getNodesByMultipleDomains() Method
    section('Test 9: getNodesByMultipleDomains() Method');
    const multiDomainNodes = engine.getNodesByMultipleDomains();
    assert(Array.isArray(multiDomainNodes), 'getNodesByMultipleDomains should return an array');
    
    // Verify all returned nodes have multiple domains
    multiDomainNodes.forEach(node => {
        assert(node.domains.length > 1, `Node ${node.id} should have multiple domains`);
    });

    // Test 10: getEdgesBetween() Method
    section('Test 10: getEdgesBetween() Method');
    const edgesBetween = engine.getEdgesBetween('node-limit-def', 'node-derivative-def');
    assert(Array.isArray(edgesBetween), 'getEdgesBetween should return an array');
    
    if (edgesBetween.length > 0) {
        const edge = edgesBetween[0];
        const validConnection = (edge.source === 'node-limit-def' && edge.target === 'node-derivative-def') ||
                               (edge.source === 'node-derivative-def' && edge.target === 'node-limit-def');
        assert(validConnection, 'Edge should connect the two specified nodes');
    }

    // Test bidirectional search
    const edgesReverse = engine.getEdgesBetween('node-derivative-def', 'node-limit-def');
    assert(edgesBetween.length === edgesReverse.length, 'getEdgesBetween should work bidirectionally');

    // Test 11: getPrerequisites() Method
    section('Test 11: getPrerequisites() Method');
    const derivativeNode = engine.getNode('node-derivative-def');
    const prereqs = engine.getPrerequisites('node-derivative-def');
    assert(Array.isArray(prereqs), 'getPrerequisites should return an array');
    
    if (derivativeNode.prerequisites.length > 0) {
        assert(prereqs.length === derivativeNode.prerequisites.length, 
               'Should return all prerequisites');
        prereqs.forEach(prereq => {
            assert(prereq !== null, 'Prerequisite should be a valid node');
        });
    }

    // Test node with no prerequisites
    const basicNode = engine.getPrerequisites('node-function-basic');
    assert(basicNode.length === 0, 'Node with no prerequisites should return empty array');

    // Test 12: getDependents() Method
    section('Test 12: getDependents() Method');
    const dependents = engine.getDependents('node-limit-def');
    assert(Array.isArray(dependents), 'getDependents should return an array');
    assert(dependents.length > 0, 'node-limit-def should have dependents');
    
    // Verify all dependents have node-limit-def as prerequisite
    dependents.forEach(dependent => {
        assert(dependent.prerequisites.includes('node-limit-def'),
               `${dependent.id} should have node-limit-def as prerequisite`);
    });

    // Test 13: hasPath() Method
    section('Test 13: hasPath() Method');
    
    // Test same node
    assert(engine.hasPath('node-limit-def', 'node-limit-def'), 
           'hasPath should return true for same node');
    
    // Test direct connection
    assert(engine.hasPath('node-limit-def', 'node-derivative-def'),
           'hasPath should return true for direct connection');
    
    // Test indirect connection
    assert(engine.hasPath('node-function-basic', 'node-gradient'),
           'hasPath should return true for indirect connection');

    // Test 14: getAllNodes() and getAllEdges() Methods
    section('Test 14: getAllNodes() and getAllEdges() Methods');
    const allNodes = engine.getAllNodes();
    const allEdges = engine.getAllEdges();
    
    assert(Array.isArray(allNodes), 'getAllNodes should return an array');
    assert(Array.isArray(allEdges), 'getAllEdges should return an array');
    assert(allNodes.length === engine.nodes.length, 'getAllNodes should return all nodes');
    assert(allEdges.length === engine.edges.length, 'getAllEdges should return all edges');

    // Test 15: Requirements Validation
    section('Test 15: Requirements Validation');
    
    // Requirement 2.1: Node-domain mapping
    allNodes.forEach(node => {
        assert(Array.isArray(node.domains) && node.domains.length > 0,
               `Requirement 2.1: ${node.id} should be mapped to at least one domain`);
    });
    
    // Requirement 2.2: Multiple domain relationships
    const multiDomainCount = multiDomainNodes.length;
    assert(multiDomainCount > 0, 
           'Requirement 2.2: System should support nodes with multiple domains');
    
    // Requirement 7.1: Cross-domain links
    const crossDomainCount = crossDomainLinks.length;
    assert(crossDomainCount > 0,
           'Requirement 7.1: System should identify cross-domain links');

    // Test 16: Data Integrity Checks
    section('Test 16: Data Integrity Checks');
    
    // Check all nodes have required fields
    const requiredNodeFields = ['id', 'name', 'domains', 'difficulty', 'prerequisites'];
    allNodes.forEach(node => {
        requiredNodeFields.forEach(field => {
            assert(field in node, `Node ${node.id} should have field: ${field}`);
        });
    });
    
    // Check all edges have required fields
    const requiredEdgeFields = ['id', 'source', 'target', 'type', 'strength'];
    allEdges.forEach(edge => {
        requiredEdgeFields.forEach(field => {
            assert(field in edge, `Edge ${edge.id} should have field: ${field}`);
        });
    });
    
    // Check edge references valid nodes
    allEdges.forEach(edge => {
        assert(engine.getNode(edge.source) !== null,
               `Edge ${edge.id} source should reference valid node`);
        assert(engine.getNode(edge.target) !== null,
               `Edge ${edge.id} target should reference valid node`);
    });
    
    // Check prerequisite references valid nodes
    allNodes.forEach(node => {
        if (node.prerequisites && node.prerequisites.length > 0) {
            node.prerequisites.forEach(prereqId => {
                assert(engine.getNode(prereqId) !== null,
                       `Node ${node.id} prerequisite ${prereqId} should reference valid node`);
            });
        }
    });

    // Test 17: Edge Cases
    section('Test 17: Edge Cases');
    
    // Test with null/undefined inputs
    const nullNode = engine.getNode(null);
    assert(nullNode === null, 'getNode should handle null input');
    
    const undefinedNode = engine.getNode(undefined);
    assert(undefinedNode === null, 'getNode should handle undefined input');
    
    // Test empty string
    const emptyNode = engine.getNode('');
    assert(emptyNode === null, 'getNode should handle empty string');

    // Summary
    section('Test Summary');
    console.log(`Total Tests: ${passCount + failCount}`);
    console.log(`Passed: ${passCount} ✓`);
    console.log(`Failed: ${failCount} ✗`);
    console.log(`Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);

    if (failCount === 0) {
        console.log('\n🎉 All tests passed! KnowledgeGraphEngine is working correctly.');
        console.log('\n✅ Task 3.1 Complete: KnowledgeGraphEngine class with graph data structures');
        console.log('   - Constructor accepts nodes and edges ✓');
        console.log('   - addNode, removeNode, addEdge, removeEdge methods ✓');
        console.log('   - getNode(nodeId) and getNeighbors(nodeId) methods ✓');
        console.log('   - getCrossDomainLinks() method ✓');
        console.log('   - Validates Requirements: 2.1, 2.2, 7.1 ✓');
        process.exit(0);
    } else {
        console.log(`\n⚠️ ${failCount} test(s) failed. Please review the failures above.`);
        process.exit(1);
    }

} catch (error) {
    console.error(`\n❌ Error during testing: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
}
