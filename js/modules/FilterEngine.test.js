/**
 * Unit Tests for FilterEngine
 * Tests all filtering operations including domain, chapter, difficulty, and search
 */

import { FilterEngine } from './FilterEngine.js';
import { KnowledgeGraphEngine } from './KnowledgeGraphEngine.js';

// Test data - comprehensive set covering all filter scenarios
const testNodes = [
    {
        id: "node-1",
        name: "极限的定义",
        nameEn: "Definition of Limit",
        description: "函数极限的ε-δ定义",
        domains: ["domain-1"],
        traditionalChapter: "chapter-1",
        difficulty: 3,
        prerequisites: [],
        keywords: ["极限", "ε-δ", "逼近"]
    },
    {
        id: "node-2",
        name: "导数的定义",
        nameEn: "Definition of Derivative",
        description: "导数描述函数的瞬时变化率",
        domains: ["domain-1"],
        traditionalChapter: "chapter-2",
        difficulty: 3,
        prerequisites: ["node-1"],
        keywords: ["导数", "变化率", "切线"]
    },
    {
        id: "node-3",
        name: "定积分的定义",
        nameEn: "Definition of Definite Integral",
        description: "定积分通过黎曼和定义",
        domains: ["domain-2"],
        traditionalChapter: "chapter-5",
        difficulty: 3,
        prerequisites: ["node-1"],
        keywords: ["积分", "黎曼和", "累积"]
    },
    {
        id: "node-4",
        name: "梯度",
        nameEn: "Gradient",
        description: "梯度是多元函数变化最快的方向",
        domains: ["domain-3"],
        traditionalChapter: "chapter-7",
        difficulty: 4,
        prerequisites: ["node-2"],
        keywords: ["梯度", "方向导数", "优化"]
    },
    {
        id: "node-5",
        name: "泰勒级数",
        nameEn: "Taylor Series",
        description: "泰勒级数用多项式逼近任意函数",
        domains: ["domain-4"],
        traditionalChapter: "chapter-11",
        difficulty: 4,
        prerequisites: ["node-2"],
        keywords: ["泰勒级数", "幂级数", "逼近"]
    },
    {
        id: "node-6",
        name: "优化算法",
        nameEn: "Optimization Algorithms",
        description: "梯度下降等优化算法",
        domains: ["domain-3", "domain-5"],
        traditionalChapter: "chapter-7",
        difficulty: 5,
        prerequisites: ["node-4"],
        keywords: ["梯度下降", "优化", "机器学习"]
    },
    {
        id: "node-7",
        name: "函数的基本概念",
        nameEn: "Basic Concepts of Functions",
        description: "函数的定义、定义域、值域",
        domains: ["domain-1"],
        traditionalChapter: "chapter-1",
        difficulty: 1,
        prerequisites: [],
        keywords: ["函数", "定义域", "值域"]
    },
    {
        id: "node-8",
        name: "微分中值定理",
        nameEn: "Mean Value Theorem",
        description: "罗尔定理、拉格朗日中值定理",
        domains: ["domain-1"],
        traditionalChapter: "chapter-3",
        difficulty: 4,
        prerequisites: ["node-2"],
        keywords: ["中值定理", "罗尔定理"]
    },
    {
        id: "node-9",
        name: "数值计算方法",
        nameEn: "Numerical Methods",
        description: "数值积分、数值微分",
        domains: ["domain-4", "domain-5"],
        traditionalChapter: "chapter-11",
        difficulty: 3,
        prerequisites: ["node-5"],
        keywords: ["数值方法", "误差分析"]
    },
    {
        id: "node-10",
        name: "偏导数",
        nameEn: "Partial Derivative",
        description: "多元函数对各个变量的偏导数",
        domains: ["domain-3"],
        traditionalChapter: "chapter-7",
        difficulty: 3,
        prerequisites: ["node-2"],
        keywords: ["偏导数", "多元函数"]
    }
];

const testEdges = [
    {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        type: "prerequisite",
        strength: 1.0
    },
    {
        id: "edge-2",
        source: "node-1",
        target: "node-3",
        type: "prerequisite",
        strength: 0.8
    },
    {
        id: "edge-3",
        source: "node-2",
        target: "node-4",
        type: "prerequisite",
        strength: 0.9
    },
    {
        id: "edge-4",
        source: "node-4",
        target: "node-6",
        type: "prerequisite",
        strength: 0.7
    }
];

describe('FilterEngine', () => {
    let graphEngine;
    let filterEngine;

    beforeEach(() => {
        graphEngine = new KnowledgeGraphEngine(
            JSON.parse(JSON.stringify(testNodes)),
            JSON.parse(JSON.stringify(testEdges))
        );
        filterEngine = new FilterEngine(graphEngine);
    });

    describe('Constructor', () => {
        test('should initialize with graph engine reference', () => {
            expect(filterEngine.graphEngine).toBe(graphEngine);
        });

        test('should initialize with default active filters', () => {
            const filters = filterEngine.getActiveFilters();
            expect(filters.domains).toEqual([]);
            expect(filters.chapters).toEqual([]);
            expect(filters.difficultyRange).toEqual([1, 5]);
            expect(filters.searchKeyword).toBe('');
            expect(filters.showCrossDomainOnly).toBe(false);
        });
    });

    describe('filterByDomain', () => {
        test('should return all nodes when domain filter is empty', () => {
            const result = filterEngine.filterByDomain([]);
            expect(result).toHaveLength(10);
        });

        test('should return all nodes when domain filter is null', () => {
            const result = filterEngine.filterByDomain(null);
            expect(result).toHaveLength(10);
        });

        test('should filter nodes by single domain', () => {
            const result = filterEngine.filterByDomain(['domain-1']);
            expect(result).toHaveLength(4);
            const nodeIds = result.map(n => n.id);
            expect(nodeIds).toContain('node-1');
            expect(nodeIds).toContain('node-2');
            expect(nodeIds).toContain('node-7');
            expect(nodeIds).toContain('node-8');
        });

        test('should filter nodes by multiple domains', () => {
            const result = filterEngine.filterByDomain(['domain-1', 'domain-2']);
            expect(result).toHaveLength(5);
            const nodeIds = result.map(n => n.id);
            expect(nodeIds).toContain('node-1');
            expect(nodeIds).toContain('node-2');
            expect(nodeIds).toContain('node-3');
            expect(nodeIds).toContain('node-7');
            expect(nodeIds).toContain('node-8');
        });

        test('should include nodes that belong to multiple domains', () => {
            const result = filterEngine.filterByDomain(['domain-3']);
            expect(result).toHaveLength(3);
            const nodeIds = result.map(n => n.id);
            expect(nodeIds).toContain('node-4');
            expect(nodeIds).toContain('node-6'); // belongs to domain-3 and domain-5
            expect(nodeIds).toContain('node-10');
        });

        test('should return empty array for non-existent domain', () => {
            const result = filterEngine.filterByDomain(['domain-99']);
            expect(result).toEqual([]);
        });
    });

    describe('filterByChapter', () => {
        test('should return all nodes when chapter filter is empty', () => {
            const result = filterEngine.filterByChapter([]);
            expect(result).toHaveLength(10);
        });

        test('should return all nodes when chapter filter is null', () => {
            const result = filterEngine.filterByChapter(null);
            expect(result).toHaveLength(10);
        });

        test('should filter nodes by single chapter', () => {
            const result = filterEngine.filterByChapter(['chapter-1']);
            expect(result).toHaveLength(2);
            const nodeIds = result.map(n => n.id);
            expect(nodeIds).toContain('node-1');
            expect(nodeIds).toContain('node-7');
        });

        test('should filter nodes by multiple chapters', () => {
            const result = filterEngine.filterByChapter(['chapter-1', 'chapter-2']);
            expect(result).toHaveLength(3);
            const nodeIds = result.map(n => n.id);
            expect(nodeIds).toContain('node-1');
            expect(nodeIds).toContain('node-2');
            expect(nodeIds).toContain('node-7');
        });

        test('should return empty array for non-existent chapter', () => {
            const result = filterEngine.filterByChapter(['chapter-99']);
            expect(result).toEqual([]);
        });

        test('should handle chapter with multiple nodes', () => {
            const result = filterEngine.filterByChapter(['chapter-7']);
            expect(result).toHaveLength(3);
            const nodeIds = result.map(n => n.id);
            expect(nodeIds).toContain('node-4');
            expect(nodeIds).toContain('node-6');
            expect(nodeIds).toContain('node-10');
        });
    });

    describe('filterByDifficulty', () => {
        test('should filter nodes by difficulty range', () => {
            const result = filterEngine.filterByDifficulty(1, 3);
            expect(result).toHaveLength(6);
            result.forEach(node => {
                expect(node.difficulty).toBeGreaterThanOrEqual(1);
                expect(node.difficulty).toBeLessThanOrEqual(3);
            });
        });

        test('should include nodes at boundary values', () => {
            const result = filterEngine.filterByDifficulty(3, 4);
            expect(result).toHaveLength(7);
            const difficulties = result.map(n => n.difficulty);
            expect(difficulties).toContain(3);
            expect(difficulties).toContain(4);
        });

        test('should filter to single difficulty level', () => {
            const result = filterEngine.filterByDifficulty(1, 1);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('node-7');
            expect(result[0].difficulty).toBe(1);
        });

        test('should return all nodes for full range', () => {
            const result = filterEngine.filterByDifficulty(1, 5);
            expect(result).toHaveLength(10);
        });

        test('should return empty array for impossible range', () => {
            const result = filterEngine.filterByDifficulty(6, 10);
            expect(result).toEqual([]);
        });

        test('should handle high difficulty filter', () => {
            const result = filterEngine.filterByDifficulty(4, 5);
            expect(result).toHaveLength(4);
            const nodeIds = result.map(n => n.id);
            expect(nodeIds).toContain('node-4');
            expect(nodeIds).toContain('node-5');
            expect(nodeIds).toContain('node-6');
            expect(nodeIds).toContain('node-8');
        });
    });

    describe('filterByKeyword', () => {
        test('should return all nodes when keyword is empty', () => {
            const result = filterEngine.filterByKeyword('');
            expect(result).toHaveLength(10);
        });

        test('should return all nodes when keyword is whitespace', () => {
            const result = filterEngine.filterByKeyword('   ');
            expect(result).toHaveLength(10);
        });

        test('should return all nodes when keyword is null', () => {
            const result = filterEngine.filterByKeyword(null);
            expect(result).toHaveLength(10);
        });

        test('should search in node name (Chinese)', () => {
            const result = filterEngine.filterByKeyword('极限');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('node-1');
        });

        test('should search in node nameEn (English)', () => {
            const result = filterEngine.filterByKeyword('gradient');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('node-4');
        });

        test('should search in node description', () => {
            const result = filterEngine.filterByKeyword('黎曼和');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('node-3');
        });

        test('should search in keywords array', () => {
            const result = filterEngine.filterByKeyword('优化');
            expect(result).toHaveLength(2);
            const nodeIds = result.map(n => n.id);
            expect(nodeIds).toContain('node-4');
            expect(nodeIds).toContain('node-6');
        });

        test('should be case-insensitive', () => {
            const result1 = filterEngine.filterByKeyword('GRADIENT');
            const result2 = filterEngine.filterByKeyword('gradient');
            const result3 = filterEngine.filterByKeyword('Gradient');
            expect(result1).toEqual(result2);
            expect(result2).toEqual(result3);
        });

        test('should match partial keywords', () => {
            const result = filterEngine.filterByKeyword('导数');
            expect(result.length).toBeGreaterThanOrEqual(2);
            const nodeIds = result.map(n => n.id);
            expect(nodeIds).toContain('node-2');
            expect(nodeIds).toContain('node-10');
        });

        test('should return multiple matches', () => {
            const result = filterEngine.filterByKeyword('逼近');
            expect(result).toHaveLength(2);
            const nodeIds = result.map(n => n.id);
            expect(nodeIds).toContain('node-1');
            expect(nodeIds).toContain('node-5');
        });

        test('should return empty array for non-matching keyword', () => {
            const result = filterEngine.filterByKeyword('xyz123notfound');
            expect(result).toEqual([]);
        });

        test('should handle special characters in search', () => {
            const result = filterEngine.filterByKeyword('ε-δ');
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('node-1');
        });
    });

    describe('applyFilters - Combined Filtering', () => {
        test('should apply single domain filter', () => {
            const result = filterEngine.applyFilters({ domains: ['domain-1'] });
            expect(result).toHaveLength(4);
        });

        test('should apply single chapter filter', () => {
            const result = filterEngine.applyFilters({ chapters: ['chapter-7'] });
            expect(result).toHaveLength(3);
        });

        test('should apply single difficulty filter', () => {
            const result = filterEngine.applyFilters({ difficultyRange: [1, 2] });
            expect(result).toHaveLength(1);
        });

        test('should apply single keyword filter', () => {
            const result = filterEngine.applyFilters({ searchKeyword: '梯度' });
            expect(result).toHaveLength(2);
        });

        test('should combine domain and chapter filters (intersection)', () => {
            const result = filterEngine.applyFilters({
                domains: ['domain-1'],
                chapters: ['chapter-1']
            });
            expect(result).toHaveLength(2);
            const nodeIds = result.map(n => n.id);
            expect(nodeIds).toContain('node-1');
            expect(nodeIds).toContain('node-7');
        });

        test('should combine domain and difficulty filters (intersection)', () => {
            const result = filterEngine.applyFilters({
                domains: ['domain-1'],
                difficultyRange: [1, 2]
            });
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('node-7');
        });

        test('should combine all filters (intersection)', () => {
            const result = filterEngine.applyFilters({
                domains: ['domain-1'],
                chapters: ['chapter-2'],
                difficultyRange: [3, 3],
                searchKeyword: '导数'
            });
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('node-2');
        });

        test('should return empty array when filters have no intersection', () => {
            const result = filterEngine.applyFilters({
                domains: ['domain-1'],
                chapters: ['chapter-7'] // chapter-7 belongs to domain-3
            });
            expect(result).toEqual([]);
        });

        test('should handle cross-domain filter', () => {
            const result = filterEngine.applyFilters({
                showCrossDomainOnly: true
            });
            expect(result).toHaveLength(2);
            const nodeIds = result.map(n => n.id);
            expect(nodeIds).toContain('node-6');
            expect(nodeIds).toContain('node-9');
            result.forEach(node => {
                expect(node.domains.length).toBeGreaterThan(1);
            });
        });

        test('should combine cross-domain filter with other filters', () => {
            const result = filterEngine.applyFilters({
                showCrossDomainOnly: true,
                domains: ['domain-3']
            });
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('node-6');
        });

        test('should update active filters when applying', () => {
            filterEngine.applyFilters({
                domains: ['domain-1'],
                searchKeyword: 'test'
            });
            const activeFilters = filterEngine.getActiveFilters();
            expect(activeFilters.domains).toEqual(['domain-1']);
            expect(activeFilters.searchKeyword).toBe('test');
        });

        test('should preserve previous filters when applying partial update', () => {
            filterEngine.applyFilters({ domains: ['domain-1'] });
            filterEngine.applyFilters({ searchKeyword: 'test' });
            const activeFilters = filterEngine.getActiveFilters();
            expect(activeFilters.domains).toEqual(['domain-1']);
            expect(activeFilters.searchKeyword).toBe('test');
        });

        test('should handle empty filter object', () => {
            const result = filterEngine.applyFilters({});
            expect(result).toHaveLength(10);
        });

        test('should handle multiple domains with difficulty range', () => {
            const result = filterEngine.applyFilters({
                domains: ['domain-3', 'domain-4'],
                difficultyRange: [3, 4]
            });
            expect(result.length).toBeGreaterThan(0);
            result.forEach(node => {
                expect(node.difficulty).toBeGreaterThanOrEqual(3);
                expect(node.difficulty).toBeLessThanOrEqual(4);
                expect(
                    node.domains.includes('domain-3') || 
                    node.domains.includes('domain-4')
                ).toBe(true);
            });
        });
    });

    describe('clearFilters', () => {
        test('should reset all filters to default', () => {
            filterEngine.applyFilters({
                domains: ['domain-1'],
                chapters: ['chapter-1'],
                difficultyRange: [2, 4],
                searchKeyword: 'test',
                showCrossDomainOnly: true
            });

            filterEngine.clearFilters();

            const filters = filterEngine.getActiveFilters();
            expect(filters.domains).toEqual([]);
            expect(filters.chapters).toEqual([]);
            expect(filters.difficultyRange).toEqual([1, 5]);
            expect(filters.searchKeyword).toBe('');
            expect(filters.showCrossDomainOnly).toBe(false);
        });

        test('should allow filtering after clearing', () => {
            filterEngine.applyFilters({ domains: ['domain-1'] });
            filterEngine.clearFilters();
            const result = filterEngine.applyFilters({ domains: ['domain-2'] });
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('node-3');
        });
    });

    describe('getActiveFilters', () => {
        test('should return copy of active filters', () => {
            const filters1 = filterEngine.getActiveFilters();
            filters1.domains = ['domain-1'];
            const filters2 = filterEngine.getActiveFilters();
            expect(filters2.domains).toEqual([]);
        });

        test('should reflect applied filters', () => {
            filterEngine.applyFilters({
                domains: ['domain-1', 'domain-2'],
                searchKeyword: 'test'
            });
            const filters = filterEngine.getActiveFilters();
            expect(filters.domains).toEqual(['domain-1', 'domain-2']);
            expect(filters.searchKeyword).toBe('test');
        });
    });

    describe('setActiveFilters', () => {
        test('should set active filters', () => {
            filterEngine.setActiveFilters({
                domains: ['domain-1'],
                searchKeyword: 'test'
            });
            const filters = filterEngine.getActiveFilters();
            expect(filters.domains).toEqual(['domain-1']);
            expect(filters.searchKeyword).toBe('test');
        });

        test('should merge with existing filters', () => {
            filterEngine.setActiveFilters({ domains: ['domain-1'] });
            filterEngine.setActiveFilters({ searchKeyword: 'test' });
            const filters = filterEngine.getActiveFilters();
            expect(filters.domains).toEqual(['domain-1']);
            expect(filters.searchKeyword).toBe('test');
        });
    });

    describe('getFilteredEdges', () => {
        test('should return edges between visible nodes', () => {
            const visibleNodes = [
                testNodes[0], // node-1
                testNodes[1]  // node-2
            ];
            const edges = filterEngine.getFilteredEdges(visibleNodes);
            expect(edges).toHaveLength(1);
            expect(edges[0].id).toBe('edge-1');
        });

        test('should exclude edges with hidden nodes', () => {
            const visibleNodes = [
                testNodes[0], // node-1
                testNodes[2]  // node-3
            ];
            const edges = filterEngine.getFilteredEdges(visibleNodes);
            expect(edges).toHaveLength(1);
            expect(edges[0].id).toBe('edge-2');
        });

        test('should return empty array when no edges between visible nodes', () => {
            const visibleNodes = [
                testNodes[0], // node-1
                testNodes[3]  // node-4 (not directly connected to node-1)
            ];
            const edges = filterEngine.getFilteredEdges(visibleNodes);
            expect(edges).toEqual([]);
        });

        test('should handle empty visible nodes', () => {
            const edges = filterEngine.getFilteredEdges([]);
            expect(edges).toEqual([]);
        });

        test('should return all edges when all nodes are visible', () => {
            const edges = filterEngine.getFilteredEdges(testNodes);
            expect(edges).toHaveLength(4);
        });
    });

    describe('Edge Cases', () => {
        test('should handle nodes without domains field', () => {
            const nodeWithoutDomains = {
                id: "node-no-domain",
                name: "No Domain Node",
                traditionalChapter: "chapter-1",
                difficulty: 2,
                keywords: []
            };
            graphEngine.addNode(nodeWithoutDomains);
            
            const result = filterEngine.filterByDomain(['domain-1']);
            expect(result.some(n => n.id === 'node-no-domain')).toBe(false);
        });

        test('should handle nodes without keywords field', () => {
            const nodeWithoutKeywords = {
                id: "node-no-keywords",
                name: "Test Node",
                nameEn: "Test",
                description: "Test description",
                domains: ["domain-1"],
                traditionalChapter: "chapter-1",
                difficulty: 2
            };
            graphEngine.addNode(nodeWithoutKeywords);
            
            const result = filterEngine.filterByKeyword('test');
            expect(result.some(n => n.id === 'node-no-keywords')).toBe(true);
        });

        test('should handle nodes with empty domains array', () => {
            const nodeWithEmptyDomains = {
                id: "node-empty-domains",
                name: "Empty Domains",
                domains: [],
                traditionalChapter: "chapter-1",
                difficulty: 2,
                keywords: []
            };
            graphEngine.addNode(nodeWithEmptyDomains);
            
            const result = filterEngine.filterByDomain(['domain-1']);
            expect(result.some(n => n.id === 'node-empty-domains')).toBe(false);
        });

        test('should handle very long keyword search', () => {
            const longKeyword = 'a'.repeat(1000);
            const result = filterEngine.filterByKeyword(longKeyword);
            expect(result).toEqual([]);
        });

        test('should handle special characters in keyword search', () => {
            const result = filterEngine.filterByKeyword('$%^&*()');
            expect(result).toEqual([]);
        });
    });

    describe('Integration with Real Data Structure', () => {
        test('should handle real node data structure', () => {
            const realNode = {
                id: "node-real",
                name: "极限的定义",
                nameEn: "Definition of Limit",
                description: "函数极限的ε-δ定义，是微积分的基础概念",
                domains: ["domain-1"],
                traditionalChapter: "chapter-1",
                difficulty: 3,
                prerequisites: [],
                relatedSkills: ["函数极限与连续Skill", "概念可视化Skill"],
                formula: "\\lim_{x \\to a} f(x) = L",
                keywords: ["极限", "ε-δ", "逼近", "连续性"],
                importance: 5,
                estimatedStudyTime: 60
            };

            graphEngine.addNode(realNode);
            
            const result = filterEngine.filterByKeyword('极限');
            expect(result.some(n => n.id === 'node-real')).toBe(true);
        });

        test('should handle filtering with all real data fields', () => {
            const result = filterEngine.applyFilters({
                domains: ['domain-1'],
                chapters: ['chapter-1'],
                difficultyRange: [1, 3],
                searchKeyword: '函数'
            });
            
            expect(Array.isArray(result)).toBe(true);
            result.forEach(node => {
                expect(node.domains).toContain('domain-1');
                expect(node.traditionalChapter).toBe('chapter-1');
                expect(node.difficulty).toBeGreaterThanOrEqual(1);
                expect(node.difficulty).toBeLessThanOrEqual(3);
            });
        });
    });
});
