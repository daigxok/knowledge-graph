/**
 * Bug Condition Exploration Test for NodeEditor AllNodes Filter Fix
 * 
 * **Property 1: Fault Condition** - AllNodes Type Safety
 * **Validates: Requirements 1.1, 1.2, 1.3**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * NOTE: This test encodes the expected behavior - it will validate the fix when it passes
 * 
 * Test Goal: Surface counterexamples that demonstrate the bug exists
 * - When this.allNodes is not an array (undefined, null, or object)
 * - Calling .filter() should throw TypeError in unfixed code
 * - In fixed code, system should convert non-array to empty array and prevent TypeError
 */

import { NodeEditor } from '../js/modules/NodeEditor.js';
import { nodeDataManager } from '../js/modules/NodeDataManager.js';

/**
 * Test Suite: Bug Condition Exploration
 * Tests the fault condition where this.allNodes is not an array
 */
describe('Bug Condition Exploration: AllNodes Type Safety', () => {
    let editor;
    let originalGetAllNodes;
    
    beforeEach(() => {
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
    });
    
    afterEach(() => {
        // Restore original method
        nodeDataManager.getAllNodes = originalGetAllNodes;
        
        // Clean up DOM
        const listDiv = document.getElementById('prerequisitesList');
        const selectedDiv = document.getElementById('selectedPrerequisites');
        if (listDiv) listDiv.remove();
        if (selectedDiv) selectedDiv.remove();
    });
    
    /**
     * Test Case 1: this.allNodes = undefined
     * Expected Behavior: System converts undefined to empty array, no TypeError
     */
    test('FAULT CONDITION: this.allNodes = undefined should not throw TypeError', () => {
        // Force this.allNodes to be undefined (simulating the bug condition)
        editor.allNodes = undefined;
        
        // Expected Behavior: System should handle this gracefully
        // In unfixed code: This would throw "TypeError: this.allNodes.filter is not a function"
        // In fixed code: System converts to empty array and displays "暂无可用节点"
        expect(() => {
            editor.renderPrerequisitesList();
        }).not.toThrow();
        
        // Verify the system converted undefined to empty array
        expect(Array.isArray(editor.allNodes)).toBe(true);
        expect(editor.allNodes.length).toBe(0);
        
        // Verify UI shows appropriate message
        const listDiv = document.getElementById('prerequisitesList');
        expect(listDiv.innerHTML).toContain('暂无可用节点');
    });
    
    /**
     * Test Case 2: this.allNodes = null
     * Expected Behavior: System converts null to empty array, no TypeError
     */
    test('FAULT CONDITION: this.allNodes = null should not throw TypeError', () => {
        // Force this.allNodes to be null (simulating the bug condition)
        editor.allNodes = null;
        
        // Expected Behavior: System should handle this gracefully
        expect(() => {
            editor.renderPrerequisitesList();
        }).not.toThrow();
        
        // Verify the system converted null to empty array
        expect(Array.isArray(editor.allNodes)).toBe(true);
        expect(editor.allNodes.length).toBe(0);
        
        // Verify UI shows appropriate message
        const listDiv = document.getElementById('prerequisitesList');
        expect(listDiv.innerHTML).toContain('暂无可用节点');
    });
    
    /**
     * Test Case 3: this.allNodes = {} (object)
     * Expected Behavior: System converts object to empty array, no TypeError
     */
    test('FAULT CONDITION: this.allNodes = {} (object) should not throw TypeError', () => {
        // Force this.allNodes to be an object (simulating the bug condition)
        editor.allNodes = { someKey: 'someValue' };
        
        // Expected Behavior: System should handle this gracefully
        expect(() => {
            editor.renderPrerequisitesList();
        }).not.toThrow();
        
        // Verify the system converted object to empty array
        expect(Array.isArray(editor.allNodes)).toBe(true);
        expect(editor.allNodes.length).toBe(0);
        
        // Verify UI shows appropriate message
        const listDiv = document.getElementById('prerequisitesList');
        expect(listDiv.innerHTML).toContain('暂无可用节点');
    });
    
    /**
     * Test Case 4: renderSelectedPrerequisites with non-array allNodes
     * Expected Behavior: System converts to empty array before using .find()
     */
    test('FAULT CONDITION: renderSelectedPrerequisites with non-array allNodes should not throw', () => {
        // Set up scenario
        editor.allNodes = undefined;
        editor.selectedPrerequisites = ['node-1', 'node-2'];
        
        // Expected Behavior: Should handle gracefully
        expect(() => {
            editor.renderSelectedPrerequisites();
        }).not.toThrow();
        
        // Verify allNodes was converted to array
        expect(Array.isArray(editor.allNodes)).toBe(true);
    });
    
    /**
     * Test Case 5: loadPrerequisitesList when getAllNodes returns non-array
     * Expected Behavior: System converts to empty array
     */
    test('FAULT CONDITION: loadPrerequisitesList when getAllNodes returns undefined', async () => {
        // Mock getAllNodes to return undefined (simulating data loading failure)
        nodeDataManager.getAllNodes = () => undefined;
        
        // Mock loadNodes to return undefined as well
        nodeDataManager.loadNodes = async () => undefined;
        
        // Expected Behavior: Should handle gracefully
        await expect(editor.loadPrerequisitesList()).resolves.not.toThrow();
        
        // Verify allNodes is an array
        expect(Array.isArray(editor.allNodes)).toBe(true);
        expect(editor.allNodes.length).toBe(0);
    });
    
    /**
     * Test Case 6: loadPrerequisitesList when getAllNodes returns object
     * Expected Behavior: System converts to empty array
     */
    test('FAULT CONDITION: loadPrerequisitesList when getAllNodes returns object', async () => {
        // Mock getAllNodes to return an object (simulating incorrect data structure)
        nodeDataManager.getAllNodes = () => ({ nodes: [] });
        
        // Mock loadNodes to return object as well
        nodeDataManager.loadNodes = async () => ({ nodes: [] });
        
        // Expected Behavior: Should handle gracefully
        await expect(editor.loadPrerequisitesList()).resolves.not.toThrow();
        
        // Verify allNodes is an array
        expect(Array.isArray(editor.allNodes)).toBe(true);
    });
    
    /**
     * Test Case 7: Calling filter on non-array directly (simulating the original bug)
     * This test demonstrates what would happen in unfixed code
     */
    test('DEMONSTRATION: Direct .filter() call on non-array throws TypeError', () => {
        // This demonstrates the original bug behavior
        const notAnArray = undefined;
        
        // This WOULD throw in unfixed code without defensive checks
        expect(() => {
            notAnArray.filter(x => x);
        }).toThrow(TypeError);
        
        // The error message should mention "filter is not a function"
        try {
            notAnArray.filter(x => x);
        } catch (error) {
            expect(error.message).toMatch(/filter is not a function/);
        }
    });
});

/**
 * Property-Based Test: AllNodes Type Safety Property
 * 
 * Property: For ANY value that is not an array assigned to this.allNodes,
 * the system SHALL convert it to an empty array before any array operations,
 * preventing TypeError and allowing operations to complete successfully.
 */
describe('Property-Based Test: AllNodes Type Safety', () => {
    let editor;
    
    beforeEach(() => {
        editor = new NodeEditor();
        
        // Create minimal DOM structure
        if (!document.getElementById('prerequisitesList')) {
            const listDiv = document.createElement('div');
            listDiv.id = 'prerequisitesList';
            document.body.appendChild(listDiv);
        }
    });
    
    afterEach(() => {
        const listDiv = document.getElementById('prerequisitesList');
        if (listDiv) listDiv.remove();
    });
    
    /**
     * Property Test: Type Safety for Various Non-Array Values
     * Tests multiple non-array values to ensure robust type handling
     */
    test('PROPERTY: System handles ANY non-array value safely', () => {
        // Generate various non-array test cases
        const nonArrayValues = [
            undefined,
            null,
            {},
            { nodes: [] },
            'string',
            123,
            true,
            false,
            Symbol('test'),
            () => {}
        ];
        
        nonArrayValues.forEach((value, index) => {
            // Reset editor state
            editor.allNodes = value;
            
            // Property: Should not throw TypeError
            expect(() => {
                editor.renderPrerequisitesList();
            }).not.toThrow();
            
            // Property: allNodes should be converted to array
            expect(Array.isArray(editor.allNodes)).toBe(true);
            
            // Property: Should display appropriate UI message
            const listDiv = document.getElementById('prerequisitesList');
            expect(listDiv.innerHTML).toContain('暂无可用节点');
        });
    });
});

console.log('Bug Condition Exploration Tests Loaded');
console.log('Run these tests to verify the bug condition and expected behavior');
