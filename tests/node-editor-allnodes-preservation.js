/**
 * Preservation Property Tests for NodeEditor AllNodes Filter Fix
 * 
 * **Property 2: Preservation** - Valid Array Behavior
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 * 
 * IMPORTANT: These tests verify that when this.allNodes is a valid array,
 * all existing functionality works correctly and is preserved after the fix.
 * 
 * Test Goal: Ensure no regressions in normal operation
 * - When this.allNodes is a valid array with node data
 * - Node list display, filtering, and selection should work correctly
 * - All existing UI interactions should remain unchanged
 * 
 * EXPECTED OUTCOME: All tests PASS on both unfixed and fixed code
 * (This confirms the fix doesn't break existing functionality)
 */

import { NodeEditor } from '../js/modules/NodeEditor.js';
import { nodeDataManager } from '../js/modules/NodeDataManager.js';

/**
 * Test Suite: Preservation - Valid Array Behavior
 * Tests that existing functionality works correctly with valid array inputs
 */
describe('Preservation: Valid Array Behavior', () => {
    let editor;
    let originalGetAllNodes;
    let sampleNodes;
    
    beforeEach(() => {
        // Create sample node data
        sampleNodes = [
            { id: 'node-1', name: '微积分基础', nameEn: 'Calculus Basics', prerequisites: [] },
            { id: 'node-2', name: '线性代数', nameEn: 'Linear Algebra', prerequisites: [] },
            { id: 'node-3', name: '概率论', nameEn: 'Probability Theory', prerequisites: ['node-1'] },
            { id: 'node-4', name: '统计学', nameEn: 'Statistics', prerequisites: ['node-3'] },
            { id: 'node-5', name: '机器学习', nameEn: 'Machine Learning', prerequisites: ['node-2', 'node-3'] }
        ];
        
        // Create a fresh NodeEditor instance
        editor = new NodeEditor();
        
        // Save original getAllNodes method
        originalGetAllNodes = nodeDataManager.getAllNodes;
        
        // Create minimal DOM structure needed for tests
        if (!document.getElementById('prerequisitesList')) {
            const listDiv = document.createElement('div');
            listDiv.id = 'prerequisitesList';
            document.body.appendChild(listDiv);
        }
        
        if (!document.getElementById('selectedPrerequisites')) {
            const selectedDiv = document.createElement('div');
            selectedDiv.id = 'selectedPrerequisites';
            document.body.appendChild(selectedDiv);
        }
        
        if (!document.getElementById('prerequisitesSearch')) {
            const searchInput = document.createElement('input');
            searchInput.id = 'prerequisitesSearch';
            searchInput.type = 'text';
            document.body.appendChild(searchInput);
        }
    });
    
    afterEach(() => {
        // Restore original method
        nodeDataManager.getAllNodes = originalGetAllNodes;
        
        // Clean up DOM
        const listDiv = document.getElementById('prerequisitesList');
        const selectedDiv = document.getElementById('selectedPrerequisites');
        const searchInput = document.getElementById('prerequisitesSearch');
        if (listDiv) listDiv.remove();
        if (selectedDiv) selectedDiv.remove();
        if (searchInput) searchInput.remove();
    });
    
    /**
     * Test Case 1: Valid array displays node list correctly
     * Requirement 3.1: Node list display with valid array
     */
    test('PRESERVATION: Valid array displays node list correctly', () => {
        // Set up valid array
        editor.allNodes = [...sampleNodes];
        
        // Render the list
        editor.renderPrerequisitesList();
        
        // Verify nodes are displayed
        const listDiv = document.getElementById('prerequisitesList');
        expect(listDiv.innerHTML).not.toContain('暂无可用节点');
        
        // Verify all nodes are rendered (up to 20 limit)
        const items = listDiv.querySelectorAll('.prerequisite-item');
        expect(items.length).toBe(sampleNodes.length);
        
        // Verify node data is correct
        items.forEach((item, index) => {
            const nodeId = item.getAttribute('data-node-id');
            expect(nodeId).toBe(sampleNodes[index].id);
            expect(item.textContent).toContain(sampleNodes[index].name);
        });
    });
    
    /**
     * Test Case 2: Filter logic excludes current node
     * Requirement 3.3: Filter logic (excluding current node)
     */
    test('PRESERVATION: Filter excludes current node correctly', () => {
        // Set up valid array and current node
        editor.allNodes = [...sampleNodes];
        editor.currentNode = sampleNodes[0]; // node-1
        
        // Render the list
        editor.renderPrerequisitesList();
        
        // Verify current node is excluded
        const listDiv = document.getElementById('prerequisitesList');
        const items = listDiv.querySelectorAll('.prerequisite-item');
        
        // Should have 4 nodes (5 total - 1 current)
        expect(items.length).toBe(sampleNodes.length - 1);
        
        // Verify node-1 is not in the list
        const nodeIds = Array.from(items).map(item => item.getAttribute('data-node-id'));
        expect(nodeIds).not.toContain('node-1');
        expect(nodeIds).toContain('node-2');
        expect(nodeIds).toContain('node-3');
    });
    
    /**
     * Test Case 3: Filter logic excludes selected prerequisites
     * Requirement 3.3: Filter logic (excluding selected nodes)
     */
    test('PRESERVATION: Filter excludes selected prerequisites', () => {
        // Set up valid array and selected prerequisites
        editor.allNodes = [...sampleNodes];
        editor.selectedPrerequisites = ['node-2', 'node-3'];
        
        // Render the list
        editor.renderPrerequisitesList();
        
        // Verify selected nodes are excluded
        const listDiv = document.getElementById('prerequisitesList');
        const items = listDiv.querySelectorAll('.prerequisite-item');
        
        // Should have 3 nodes (5 total - 2 selected)
        expect(items.length).toBe(sampleNodes.length - 2);
        
        // Verify node-2 and node-3 are not in the list
        const nodeIds = Array.from(items).map(item => item.getAttribute('data-node-id'));
        expect(nodeIds).not.toContain('node-2');
        expect(nodeIds).not.toContain('node-3');
        expect(nodeIds).toContain('node-1');
        expect(nodeIds).toContain('node-4');
    });
    
    /**
     * Test Case 4: Search filtering works correctly
     * Requirement 3.3: Search filtering
     */
    test('PRESERVATION: Search filtering works correctly', () => {
        // Set up valid array
        editor.allNodes = [...sampleNodes];
        
        // Test Chinese name search
        editor.renderPrerequisitesList('微积分');
        let listDiv = document.getElementById('prerequisitesList');
        let items = listDiv.querySelectorAll('.prerequisite-item');
        expect(items.length).toBe(1);
        expect(items[0].textContent).toContain('微积分基础');
        
        // Test English name search
        editor.renderPrerequisitesList('linear');
        items = listDiv.querySelectorAll('.prerequisite-item');
        expect(items.length).toBe(1);
        expect(items[0].textContent).toContain('线性代数');
        
        // Test ID search
        editor.renderPrerequisitesList('node-3');
        items = listDiv.querySelectorAll('.prerequisite-item');
        expect(items.length).toBe(1);
        expect(items[0].getAttribute('data-node-id')).toBe('node-3');
        
        // Test partial match
        editor.renderPrerequisitesList('学');
        items = listDiv.querySelectorAll('.prerequisite-item');
        expect(items.length).toBeGreaterThan(1); // Should match multiple nodes
    });
    
    /**
     * Test Case 5: Node selection works correctly
     * Requirement 3.3: Node selection functionality
     */
    test('PRESERVATION: Node selection works correctly', () => {
        // Set up valid array
        editor.allNodes = [...sampleNodes];
        editor.selectedPrerequisites = [];
        
        // Add a prerequisite
        editor.addPrerequisite('node-1');
        
        // Verify it was added
        expect(editor.selectedPrerequisites).toContain('node-1');
        expect(editor.selectedPrerequisites.length).toBe(1);
        
        // Add another
        editor.addPrerequisite('node-2');
        expect(editor.selectedPrerequisites).toContain('node-2');
        expect(editor.selectedPrerequisites.length).toBe(2);
        
        // Try to add duplicate (should not add)
        editor.addPrerequisite('node-1');
        expect(editor.selectedPrerequisites.length).toBe(2);
    });
    
    /**
     * Test Case 6: Selected prerequisites rendering
     * Requirement 3.1: Display selected prerequisites correctly
     */
    test('PRESERVATION: Selected prerequisites render correctly', () => {
        // Set up valid array and selected prerequisites
        editor.allNodes = [...sampleNodes];
        editor.selectedPrerequisites = ['node-1', 'node-3'];
        
        // Render selected prerequisites
        editor.renderSelectedPrerequisites();
        
        // Verify they are displayed
        const container = document.getElementById('selectedPrerequisites');
        const tags = container.querySelectorAll('.selected-prerequisite-tag');
        
        expect(tags.length).toBe(2);
        expect(container.textContent).toContain('微积分基础');
        expect(container.textContent).toContain('概率论');
    });
    
    /**
     * Test Case 7: Remove prerequisite works correctly
     * Requirement 3.3: Node deselection functionality
     */
    test('PRESERVATION: Remove prerequisite works correctly', () => {
        // Set up valid array and selected prerequisites
        editor.allNodes = [...sampleNodes];
        editor.selectedPrerequisites = ['node-1', 'node-2', 'node-3'];
        
        // Remove a prerequisite
        editor.removePrerequisite('node-2');
        
        // Verify it was removed
        expect(editor.selectedPrerequisites).not.toContain('node-2');
        expect(editor.selectedPrerequisites.length).toBe(2);
        expect(editor.selectedPrerequisites).toContain('node-1');
        expect(editor.selectedPrerequisites).toContain('node-3');
    });
    
    /**
     * Test Case 8: Empty array shows appropriate message
     * Requirement 3.1: Handle empty array gracefully
     */
    test('PRESERVATION: Empty array shows "暂无可用节点"', () => {
        // Set up empty array
        editor.allNodes = [];
        
        // Render the list
        editor.renderPrerequisitesList();
        
        // Verify message is displayed
        const listDiv = document.getElementById('prerequisitesList');
        expect(listDiv.innerHTML).toContain('暂无可用节点');
    });
    
    /**
     * Test Case 9: No search results shows appropriate message
     * Requirement 3.3: Handle no search results
     */
    test('PRESERVATION: No search results shows "没有找到节点"', () => {
        // Set up valid array
        editor.allNodes = [...sampleNodes];
        
        // Search for non-existent term
        editor.renderPrerequisitesList('不存在的节点');
        
        // Verify message is displayed
        const listDiv = document.getElementById('prerequisitesList');
        expect(listDiv.innerHTML).toContain('没有找到节点');
    });
    
    /**
     * Test Case 10: Load prerequisites list with valid data
     * Requirement 3.2: Node data loading works correctly
     */
    test('PRESERVATION: loadPrerequisitesList with valid data', async () => {
        // Mock getAllNodes to return valid array
        nodeDataManager.getAllNodes = () => [...sampleNodes];
        
        // Load prerequisites list
        await editor.loadPrerequisitesList();
        
        // Verify allNodes is set correctly
        expect(Array.isArray(editor.allNodes)).toBe(true);
        expect(editor.allNodes.length).toBe(sampleNodes.length);
        expect(editor.allNodes[0].id).toBe('node-1');
    });
});

/**
 * Property-Based Test Suite: Preservation Properties
 * Tests universal properties that should hold for all valid array inputs
 */
describe('Property-Based Test: Preservation Properties', () => {
    let editor;
    
    beforeEach(() => {
        editor = new NodeEditor();
        
        // Create minimal DOM structure
        if (!document.getElementById('prerequisitesList')) {
            const listDiv = document.createElement('div');
            listDiv.id = 'prerequisitesList';
            document.body.appendChild(listDiv);
        }
        
        if (!document.getElementById('selectedPrerequisites')) {
            const selectedDiv = document.createElement('div');
            selectedDiv.id = 'selectedPrerequisites';
            document.body.appendChild(selectedDiv);
        }
    });
    
    afterEach(() => {
        const listDiv = document.getElementById('prerequisitesList');
        const selectedDiv = document.getElementById('selectedPrerequisites');
        if (listDiv) listDiv.remove();
        if (selectedDiv) selectedDiv.remove();
    });
    
    /**
     * Property 1: For any valid array, renderPrerequisitesList should not throw
     */
    test('PROPERTY: renderPrerequisitesList never throws with valid array', () => {
        // Generate various valid array test cases
        const validArrays = [
            [],
            [{ id: 'n1', name: 'Node 1', nameEn: 'Node 1', prerequisites: [] }],
            Array(5).fill(null).map((_, i) => ({
                id: `node-${i}`,
                name: `节点${i}`,
                nameEn: `Node ${i}`,
                prerequisites: []
            })),
            Array(20).fill(null).map((_, i) => ({
                id: `node-${i}`,
                name: `节点${i}`,
                nameEn: `Node ${i}`,
                prerequisites: []
            })),
            Array(100).fill(null).map((_, i) => ({
                id: `node-${i}`,
                name: `节点${i}`,
                nameEn: `Node ${i}`,
                prerequisites: []
            }))
        ];
        
        validArrays.forEach((array) => {
            editor.allNodes = array;
            
            // Property: Should never throw
            expect(() => {
                editor.renderPrerequisitesList();
            }).not.toThrow();
            
            // Property: allNodes should remain an array
            expect(Array.isArray(editor.allNodes)).toBe(true);
        });
    });
    
    /**
     * Property 2: For any valid array, filter operations preserve array type
     */
    test('PROPERTY: Filter operations always return arrays', () => {
        const testNodes = Array(10).fill(null).map((_, i) => ({
            id: `node-${i}`,
            name: `节点${i}`,
            nameEn: `Node ${i}`,
            prerequisites: []
        }));
        
        editor.allNodes = testNodes;
        
        // Test various filter scenarios
        const searchTerms = ['', 'node', '节点', 'nonexistent', '0', '5'];
        
        searchTerms.forEach(term => {
            editor.renderPrerequisitesList(term);
            
            // Property: allNodes should still be an array
            expect(Array.isArray(editor.allNodes)).toBe(true);
            
            // Property: Original array should not be mutated
            expect(editor.allNodes.length).toBe(testNodes.length);
        });
    });
    
    /**
     * Property 3: For any valid array, current node is always excluded
     */
    test('PROPERTY: Current node is always excluded from list', () => {
        const testNodes = Array(10).fill(null).map((_, i) => ({
            id: `node-${i}`,
            name: `节点${i}`,
            nameEn: `Node ${i}`,
            prerequisites: []
        }));
        
        editor.allNodes = testNodes;
        
        // Test with different current nodes
        testNodes.forEach((node) => {
            editor.currentNode = node;
            editor.renderPrerequisitesList();
            
            const listDiv = document.getElementById('prerequisitesList');
            const items = listDiv.querySelectorAll('.prerequisite-item');
            const nodeIds = Array.from(items).map(item => item.getAttribute('data-node-id'));
            
            // Property: Current node should never appear in the list
            expect(nodeIds).not.toContain(node.id);
        });
    });
    
    /**
     * Property 4: For any valid array, selected prerequisites are always excluded
     */
    test('PROPERTY: Selected prerequisites are always excluded from list', () => {
        const testNodes = Array(10).fill(null).map((_, i) => ({
            id: `node-${i}`,
            name: `节点${i}`,
            nameEn: `Node ${i}`,
            prerequisites: []
        }));
        
        editor.allNodes = testNodes;
        
        // Test with different selections
        const selections = [
            ['node-0'],
            ['node-0', 'node-1'],
            ['node-0', 'node-1', 'node-2'],
            testNodes.slice(0, 5).map(n => n.id)
        ];
        
        selections.forEach((selected) => {
            editor.selectedPrerequisites = selected;
            editor.renderPrerequisitesList();
            
            const listDiv = document.getElementById('prerequisitesList');
            const items = listDiv.querySelectorAll('.prerequisite-item');
            const nodeIds = Array.from(items).map(item => item.getAttribute('data-node-id'));
            
            // Property: Selected nodes should never appear in the list
            selected.forEach(id => {
                expect(nodeIds).not.toContain(id);
            });
        });
    });
    
    /**
     * Property 5: For any valid array, adding/removing prerequisites maintains array integrity
     */
    test('PROPERTY: Add/remove operations maintain array integrity', () => {
        const testNodes = Array(10).fill(null).map((_, i) => ({
            id: `node-${i}`,
            name: `节点${i}`,
            nameEn: `Node ${i}`,
            prerequisites: []
        }));
        
        editor.allNodes = testNodes;
        editor.selectedPrerequisites = [];
        
        // Add multiple prerequisites
        testNodes.slice(0, 5).forEach(node => {
            editor.addPrerequisite(node.id);
            
            // Property: allNodes should remain unchanged
            expect(Array.isArray(editor.allNodes)).toBe(true);
            expect(editor.allNodes.length).toBe(testNodes.length);
            
            // Property: selectedPrerequisites should be an array
            expect(Array.isArray(editor.selectedPrerequisites)).toBe(true);
        });
        
        // Remove prerequisites
        testNodes.slice(0, 3).forEach(node => {
            editor.removePrerequisite(node.id);
            
            // Property: allNodes should remain unchanged
            expect(Array.isArray(editor.allNodes)).toBe(true);
            expect(editor.allNodes.length).toBe(testNodes.length);
        });
    });
    
    /**
     * Property 6: For any valid array, list length never exceeds 20 (limit)
     */
    test('PROPERTY: Rendered list respects 20-item limit', () => {
        // Create array with more than 20 items
        const testNodes = Array(50).fill(null).map((_, i) => ({
            id: `node-${i}`,
            name: `节点${i}`,
            nameEn: `Node ${i}`,
            prerequisites: []
        }));
        
        editor.allNodes = testNodes;
        editor.renderPrerequisitesList();
        
        const listDiv = document.getElementById('prerequisitesList');
        const items = listDiv.querySelectorAll('.prerequisite-item');
        
        // Property: Should never display more than 20 items
        expect(items.length).toBeLessThanOrEqual(20);
    });
});

console.log('Preservation Property Tests Loaded');
console.log('Run these tests to verify existing functionality is preserved');
