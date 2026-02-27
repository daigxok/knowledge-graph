/**
 * Unit Tests for KnowledgeGraphEngine
 * Tests the core graph data structure and operations
 */

import { KnowledgeGraphEngine } from './KnowledgeGraphEngine.js';

// Test data
const testNodes = [
    {
        id: "node-1",
        name: "Test Node 1",
        domains: ["domain-1"],
        prerequisites: [],
        difficulty: 2
    },
    {
        id: "node-2",
        name: "Test Node 2",
        domains: ["domain-1"],
        prerequisites: ["node-1"],
        difficulty: 3
    },
    {
        id: "node-3",
        name: "Test Node 3",
        domains: ["domain-2"],
        prerequisites: ["node-1"],
        difficulty: 2
    },
    {
        id: "node-4",
        name: "Test Node 4",
        domains: ["domain-1", "domain-2"],
        prerequisites: ["node-2", "node-3"],
        difficulty: 4
    }
];

const testEdges = [
    {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        type: "prerequisite",
        strength: 1.0,
        description: "Node 2 requires Node 1"
    },
    {
        id: "edge-2",
        source: "node-1",
        target: "node-3",
        type: "prerequisite",
        strength: 0.8,
        description: "Node 3 requires Node 1"
    },
    {
        id: "edge-3",
        source: "node-2",
        target: "node-4",
        type: "prerequisite",
        strength: 0.9,
        description: "Node 4 requires Node 2"
    },
    {
        id: "edge-4",
        source: "node-3",
        target: "node-4",
        type: "cross-domain",
        strength: 0.7,
        description: "Cross-domain link"
    }
];

describe('KnowledgeGraphEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new KnowledgeGraphEngine(
            JSON.parse(JSON.stringify(testNodes)),
            JSON.parse(JSON.stringify(testEdges))
        );
    });

    describe('Constructor', () => {
        test('should initialize with nodes and edges', () => {
            expect(engine.nodes).toHaveLength(4);
            expect(engine.edges).toHaveLength(4);
        });

        test('should build node map correctly', () => {
            expect(engine.nodeMap.size).toBe(4);
            expect(engine.nodeMap.has('node-1')).toBe(true);
        });

        test('should build adjacency list correctly', () => {
            expect(engine.adjacencyList.size).toBe(4);
            const node1Neighbors = engine.adjacencyList.get('node-1');
            expect(node1Neighbors).toHaveLength(2);
        });

        test('should handle empty initialization', () => {
            const emptyEngine = new KnowledgeGraphEngine();
            expect(emptyEngine.nodes).toEqual([]);
            expect(emptyEngine.edges).toEqual([]);
        });
    });

    describe('getNode', () => {
        test('should return node by valid ID', () => {
            const node = engine.getNode('node-1');
            expect(node).toBeDefined();
            expect(node.id).toBe('node-1');
            expect(node.name).toBe('Test Node 1');
        });

        test('should return null for invalid ID', () => {
            const node = engine.getNode('non-existent');
            expect(node).toBeNull();
        });

        test('should return correct node data', () => {
            const node = engine.getNode('node-4');
            expect(node.domains).toEqual(['domain-1', 'domain-2']);
            expect(node.difficulty).toBe(4);
        });
    });

    describe('getNeighbors', () => {
        test('should return neighbors of a node', () => {
            const neighbors = engine.getNeighbors('node-1');
            expect(neighbors).toHaveLength(2);
            const neighborIds = neighbors.map(n => n.id);
            expect(neighborIds).toContain('node-2');
            expect(neighborIds).toContain('node-3');
        });

        test('should return empty array for node with no neighbors', () => {
            const neighbors = engine.getNeighbors('node-4');
            expect(neighbors).toEqual([]);
        });

        test('should return empty array for non-existent node', () => {
            const neighbors = engine.getNeighbors('non-existent');
            expect(neighbors).toEqual([]);
        });
    });

    describe('addNode', () => {
        test('should add a new node', () => {
            const newNode = {
                id: "node-5",
                name: "Test Node 5",
                domains: ["domain-3"],
                prerequisites: [],
                difficulty: 1
            };
            
            engine.addNode(newNode);
            expect(engine.nodes).toHaveLength(5);
            expect(engine.getNode('node-5')).toBeDefined();
        });

        test('should not add duplicate node', () => {
            const duplicateNode = {
                id: "node-1",
                name: "Duplicate",
                domains: ["domain-1"],
                prerequisites: [],
                difficulty: 1
            };
            
            engine.addNode(duplicateNode);
            expect(engine.nodes).toHaveLength(4);
            expect(engine.getNode('node-1').name).toBe('Test Node 1');
        });

        test('should initialize adjacency list for new node', () => {
            const newNode = {
                id: "node-5",
                name: "Test Node 5",
                domains: ["domain-3"],
                prerequisites: [],
                difficulty: 1
            };
            
            engine.addNode(newNode);
            expect(engine.adjacencyList.has('node-5')).toBe(true);
            expect(engine.adjacencyList.get('node-5')).toEqual([]);
        });
    });

    describe('removeNode', () => {
        test('should remove an existing node', () => {
            engine.removeNode('node-2');
            expect(engine.nodes).toHaveLength(3);
            expect(engine.getNode('node-2')).toBeNull();
        });

        test('should remove node from maps', () => {
            engine.removeNode('node-2');
            expect(engine.nodeMap.has('node-2')).toBe(false);
            expect(engine.adjacencyList.has('node-2')).toBe(false);
        });

        test('should remove edges connected to the node', () => {
            const initialEdgeCount = engine.edges.length;
            engine.removeNode('node-1');
            expect(engine.edges.length).toBeLessThan(initialEdgeCount);
            
            // Check that edges with node-1 are removed
            const hasNode1Edge = engine.edges.some(e => 
                e.source === 'node-1' || e.target === 'node-1'
            );
            expect(hasNode1Edge).toBe(false);
        });

        test('should handle removing non-existent node', () => {
            const initialLength = engine.nodes.length;
            engine.removeNode('non-existent');
            expect(engine.nodes).toHaveLength(initialLength);
        });
    });

    describe('addEdge', () => {
        test('should add a new edge', () => {
            const newEdge = {
                id: "edge-5",
                source: "node-2",
                target: "node-3",
                type: "related",
                strength: 0.5,
                description: "Related concepts"
            };
            
            engine.addEdge(newEdge);
            expect(engine.edges).toHaveLength(5);
        });

        test('should update adjacency list when adding edge', () => {
            const newEdge = {
                id: "edge-5",
                source: "node-2",
                target: "node-3",
                type: "related",
                strength: 0.5,
                description: "Related concepts"
            };
            
            const beforeLength = engine.adjacencyList.get('node-2').length;
            engine.addEdge(newEdge);
            const afterLength = engine.adjacencyList.get('node-2').length;
            expect(afterLength).toBe(beforeLength + 1);
        });
    });

    describe('removeEdge', () => {
        test('should remove an existing edge', () => {
            engine.removeEdge('edge-1');
            expect(engine.edges).toHaveLength(3);
            const edge = engine.edges.find(e => e.id === 'edge-1');
            expect(edge).toBeUndefined();
        });

        test('should rebuild adjacency list after removing edge', () => {
            engine.removeEdge('edge-1');
            // Verify adjacency list is updated
            const node1Neighbors = engine.adjacencyList.get('node-1');
            expect(node1Neighbors.length).toBeLessThan(2);
        });

        test('should handle removing non-existent edge', () => {
            const initialLength = engine.edges.length;
            engine.removeEdge('non-existent');
            expect(engine.edges).toHaveLength(initialLength);
        });
    });

    describe('getCrossDomainLinks', () => {
        test('should return only cross-domain edges', () => {
            const crossDomainLinks = engine.getCrossDomainLinks();
            expect(crossDomainLinks).toHaveLength(1);
            expect(crossDomainLinks[0].id).toBe('edge-4');
            expect(crossDomainLinks[0].type).toBe('cross-domain');
        });

        test('should return empty array if no cross-domain links', () => {
            const noCrossEngine = new KnowledgeGraphEngine(
                testNodes,
                testEdges.filter(e => e.type !== 'cross-domain')
            );
            const crossDomainLinks = noCrossEngine.getCrossDomainLinks();
            expect(crossDomainLinks).toEqual([]);
        });
    });

    describe('getNodesByMultipleDomains', () => {
        test('should return nodes belonging to multiple domains', () => {
            const multiDomainNodes = engine.getNodesByMultipleDomains();
            expect(multiDomainNodes).toHaveLength(1);
            expect(multiDomainNodes[0].id).toBe('node-4');
            expect(multiDomainNodes[0].domains).toHaveLength(2);
        });

        test('should return empty array if no multi-domain nodes', () => {
            const singleDomainNodes = testNodes.filter(n => n.domains.length === 1);
            const singleEngine = new KnowledgeGraphEngine(singleDomainNodes, []);
            const multiDomainNodes = singleEngine.getNodesByMultipleDomains();
            expect(multiDomainNodes).toEqual([]);
        });
    });

    describe('getEdgesBetween', () => {
        test('should return edges between two nodes', () => {
            const edges = engine.getEdgesBetween('node-1', 'node-2');
            expect(edges).toHaveLength(1);
            expect(edges[0].id).toBe('edge-1');
        });

        test('should work in both directions', () => {
            const edges1 = engine.getEdgesBetween('node-1', 'node-2');
            const edges2 = engine.getEdgesBetween('node-2', 'node-1');
            expect(edges1).toEqual(edges2);
        });

        test('should return empty array if no edges between nodes', () => {
            const edges = engine.getEdgesBetween('node-2', 'node-3');
            expect(edges).toEqual([]);
        });
    });

    describe('getPrerequisites', () => {
        test('should return prerequisite nodes', () => {
            const prereqs = engine.getPrerequisites('node-4');
            expect(prereqs).toHaveLength(2);
            const prereqIds = prereqs.map(n => n.id);
            expect(prereqIds).toContain('node-2');
            expect(prereqIds).toContain('node-3');
        });

        test('should return empty array for node with no prerequisites', () => {
            const prereqs = engine.getPrerequisites('node-1');
            expect(prereqs).toEqual([]);
        });

        test('should return empty array for non-existent node', () => {
            const prereqs = engine.getPrerequisites('non-existent');
            expect(prereqs).toEqual([]);
        });
    });

    describe('getDependents', () => {
        test('should return nodes that depend on given node', () => {
            const dependents = engine.getDependents('node-1');
            expect(dependents).toHaveLength(2);
            const dependentIds = dependents.map(n => n.id);
            expect(dependentIds).toContain('node-2');
            expect(dependentIds).toContain('node-3');
        });

        test('should return empty array for node with no dependents', () => {
            const dependents = engine.getDependents('node-4');
            expect(dependents).toEqual([]);
        });
    });

    describe('hasPath', () => {
        test('should return true for same node', () => {
            expect(engine.hasPath('node-1', 'node-1')).toBe(true);
        });

        test('should return true for direct connection', () => {
            expect(engine.hasPath('node-1', 'node-2')).toBe(true);
        });

        test('should return true for indirect connection', () => {
            expect(engine.hasPath('node-1', 'node-4')).toBe(true);
        });

        test('should return false for no connection', () => {
            // Add isolated node
            engine.addNode({
                id: "node-isolated",
                name: "Isolated",
                domains: ["domain-1"],
                prerequisites: [],
                difficulty: 1
            });
            expect(engine.hasPath('node-1', 'node-isolated')).toBe(false);
        });
    });

    describe('getAllNodes and getAllEdges', () => {
        test('should return all nodes', () => {
            const nodes = engine.getAllNodes();
            expect(nodes).toHaveLength(4);
            expect(Array.isArray(nodes)).toBe(true);
        });

        test('should return all edges', () => {
            const edges = engine.getAllEdges();
            expect(edges).toHaveLength(4);
            expect(Array.isArray(edges)).toBe(true);
        });
    });

    describe('Integration with real data', () => {
        test('should handle real node data structure', () => {
            const realNode = {
                id: "node-limit-def",
                name: "极限的定义",
                nameEn: "Definition of Limit",
                description: "函数极限的ε-δ定义",
                domains: ["domain-1"],
                traditionalChapter: "chapter-1",
                difficulty: 3,
                prerequisites: ["node-function-basic"],
                relatedSkills: ["函数极限与连续Skill"],
                formula: "\\lim_{x \\to a} f(x) = L",
                keywords: ["极限", "ε-δ", "逼近"],
                importance: 5,
                estimatedStudyTime: 60
            };

            engine.addNode(realNode);
            const retrieved = engine.getNode('node-limit-def');
            expect(retrieved).toBeDefined();
            expect(retrieved.nameEn).toBe('Definition of Limit');
            expect(retrieved.keywords).toContain('极限');
        });

        test('should handle real edge data structure', () => {
            const realEdge = {
                id: "edge-real",
                source: "node-1",
                target: "node-2",
                type: "prerequisite",
                strength: 1.0,
                description: "导数定义基于极限概念"
            };

            engine.addEdge(realEdge);
            const edges = engine.getEdgesBetween('node-1', 'node-2');
            expect(edges.length).toBeGreaterThan(0);
            const realEdgeFound = edges.find(e => e.id === 'edge-real');
            expect(realEdgeFound).toBeDefined();
        });
    });
});
