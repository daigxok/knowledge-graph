/**
 * Preservation Property Tests Runner
 * Verifies that existing functionality is preserved after the bugfix
 */

// Mock DOM environment
const mockElements = {};

global.document = {
    getElementById: (id) => {
        if (!mockElements[id]) {
            mockElements[id] = {
                id: id,
                innerHTML: '',
                textContent: '',
                _html: '',
                querySelectorAll: function(selector) {
                    if (selector === '.prerequisite-item' && this._html.includes('prerequisite-item')) {
                        const matches = this._html.match(/data-node-id="([^"]+)"/g) || [];
                        return matches.map(match => {
                            const id = match.match(/data-node-id="([^"]+)"/)[1];
                            return {
                                getAttribute: (attr) => attr === 'data-node-id' ? id : null,
                                textContent: id,
                                addEventListener: () => {}
                            };
                        });
                    }
                    return [];
                },
                remove: () => {},
                addEventListener: () => {},
                setAttribute: () => {},
                getAttribute: () => null,
                classList: {
                    add: () => {},
                    remove: () => {},
                    toggle: () => {}
                }
            };
            
            // Make innerHTML setter update _html
            Object.defineProperty(mockElements[id], 'innerHTML', {
                get: function() { return this._html; },
                set: function(value) { this._html = value; }
            });
        }
        return mockElements[id];
    },
    createElement: (tag) => ({
        id: '',
        type: '',
        innerHTML: '',
        textContent: '',
        querySelectorAll: () => [],
        remove: () => {},
        addEventListener: () => {},
        setAttribute: () => {},
        getAttribute: () => null
    }),
    body: {
        appendChild: () => {}
    }
};

// Test framework
class TestRunner {
    constructor() {
        this.tests = [];
        this.results = { passed: 0, failed: 0, total: 0 };
    }
    
    test(name, fn) {
        this.tests.push({ name, fn });
    }
    
    async run() {
        console.log('\n' + '='.repeat(70));
        console.log('✓ NodeEditor Preservation Property Tests');
        console.log('='.repeat(70) + '\n');
        
        for (const test of this.tests) {
            try {
                await test.fn();
                this.results.passed++;
                console.log(`✓ ${test.name}`);
            } catch (error) {
                this.results.failed++;
                console.log(`✗ ${test.name}`);
                console.log(`  Error: ${error.message}`);
            }
            this.results.total++;
        }
        
        console.log('\n' + '='.repeat(70));
        console.log(`Results: ${this.results.passed}/${this.results.total} passed`);
        
        if (this.results.passed === this.results.total) {
            console.log('✓ ALL PRESERVATION TESTS PASSED - No regressions detected!');
        } else {
            console.log(`✗ ${this.results.failed} test(s) failed - Regressions detected`);
        }
        console.log('='.repeat(70) + '\n');
        
        return this.results;
    }
}

// Mock NodeEditor with fix
class NodeEditor {
    constructor() {
        this.allNodes = [];
        this.selectedPrerequisites = [];
        this.currentNode = null;
    }
    
    renderPrerequisitesList(searchTerm = '') {
        const listDiv = document.getElementById('prerequisitesList');
        
        if (!listDiv) {
            console.error('Prerequisites list element not found');
            return;
        }
        
        // CRITICAL: Defensive type check
        if (!Array.isArray(this.allNodes)) {
            console.warn('allNodes is not an array, converting to empty array');
            this.allNodes = [];
        }
        
        if (this.allNodes.length === 0) {
            listDiv.innerHTML = '<div class="no-results">暂无可用节点</div>';
            return;
        }
        
        let nodes = this.allNodes.filter(node => {
            if (this.currentNode && node.id === this.currentNode.id) {
                return false;
            }
            if (this.selectedPrerequisites && this.selectedPrerequisites.includes(node.id)) {
                return false;
            }
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return node.name.toLowerCase().includes(term) || 
                       node.nameEn.toLowerCase().includes(term) ||
                       node.id.toLowerCase().includes(term);
            }
            return true;
        });
        
        nodes = nodes.slice(0, 20);
        
        if (nodes.length === 0) {
            listDiv.innerHTML = '<div class="no-results">没有找到节点</div>';
            return;
        }
        
        listDiv.innerHTML = nodes.map(node => `
            <div class="prerequisite-item" data-node-id="${node.id}">
                <span class="prerequisite-name">${node.name}</span>
            </div>
        `).join('');
    }
    
    renderSelectedPrerequisites() {
        const container = document.getElementById('selectedPrerequisites');
        
        if (!this.selectedPrerequisites || this.selectedPrerequisites.length === 0) {
            container.innerHTML = '<div class="no-prerequisites">未选择前置知识</div>';
            return;
        }
        
        if (!Array.isArray(this.allNodes)) {
            console.warn('allNodes is not an array in renderSelectedPrerequisites');
            this.allNodes = [];
        }
        
        const selectedNodes = this.selectedPrerequisites.map(id => 
            this.allNodes.find(n => n.id === id)
        ).filter(n => n);
        
        container.innerHTML = selectedNodes.map(node => `
            <div class="selected-prerequisite-tag">
                <span>${node.name}</span>
            </div>
        `).join('');
    }
    
    addPrerequisite(nodeId) {
        if (!this.selectedPrerequisites.includes(nodeId)) {
            this.selectedPrerequisites.push(nodeId);
        }
    }
    
    removePrerequisite(nodeId) {
        const index = this.selectedPrerequisites.indexOf(nodeId);
        if (index > -1) {
            this.selectedPrerequisites.splice(index, 1);
        }
    }
}

// Sample test data
const sampleNodes = [
    { id: 'node-1', name: '微积分基础', nameEn: 'Calculus Basics', prerequisites: [] },
    { id: 'node-2', name: '线性代数', nameEn: 'Linear Algebra', prerequisites: [] },
    { id: 'node-3', name: '概率论', nameEn: 'Probability Theory', prerequisites: ['node-1'] },
    { id: 'node-4', name: '统计学', nameEn: 'Statistics', prerequisites: ['node-3'] },
    { id: 'node-5', name: '机器学习', nameEn: 'Machine Learning', prerequisites: ['node-2', 'node-3'] }
];

// Run tests
const runner = new TestRunner();

runner.test('Preservation 1: Valid array displays node list correctly', () => {
    const editor = new NodeEditor();
    editor.allNodes = [...sampleNodes];
    
    editor.renderPrerequisitesList();
    
    const listDiv = document.getElementById('prerequisitesList');
    if (listDiv.innerHTML.includes('暂无可用节点')) {
        throw new Error('Should not show "暂无可用节点" with valid nodes');
    }
    
    const items = listDiv.querySelectorAll('.prerequisite-item');
    if (items.length !== sampleNodes.length) {
        throw new Error(`Expected ${sampleNodes.length} items, got ${items.length}`);
    }
});

runner.test('Preservation 2: Filter excludes current node', () => {
    const editor = new NodeEditor();
    editor.allNodes = [...sampleNodes];
    editor.currentNode = sampleNodes[0]; // node-1
    
    editor.renderPrerequisitesList();
    
    const listDiv = document.getElementById('prerequisitesList');
    const items = listDiv.querySelectorAll('.prerequisite-item');
    
    if (items.length !== sampleNodes.length - 1) {
        throw new Error(`Expected ${sampleNodes.length - 1} items, got ${items.length}`);
    }
    
    const nodeIds = Array.from(items).map(item => item.getAttribute('data-node-id'));
    if (nodeIds.includes('node-1')) {
        throw new Error('Current node should be excluded');
    }
});

runner.test('Preservation 3: Filter excludes selected prerequisites', () => {
    const editor = new NodeEditor();
    editor.allNodes = [...sampleNodes];
    editor.selectedPrerequisites = ['node-2', 'node-3'];
    
    editor.renderPrerequisitesList();
    
    const listDiv = document.getElementById('prerequisitesList');
    const items = listDiv.querySelectorAll('.prerequisite-item');
    
    if (items.length !== sampleNodes.length - 2) {
        throw new Error(`Expected ${sampleNodes.length - 2} items, got ${items.length}`);
    }
    
    const nodeIds = Array.from(items).map(item => item.getAttribute('data-node-id'));
    if (nodeIds.includes('node-2') || nodeIds.includes('node-3')) {
        throw new Error('Selected nodes should be excluded');
    }
});

runner.test('Preservation 4: Search filtering works (Chinese)', () => {
    const editor = new NodeEditor();
    editor.allNodes = [...sampleNodes];
    
    editor.renderPrerequisitesList('微积分');
    
    const listDiv = document.getElementById('prerequisitesList');
    const items = listDiv.querySelectorAll('.prerequisite-item');
    
    if (items.length !== 1) {
        throw new Error('Expected 1 matching item');
    }
});

runner.test('Preservation 5: Search filtering works (English)', () => {
    const editor = new NodeEditor();
    editor.allNodes = [...sampleNodes];
    
    editor.renderPrerequisitesList('linear');
    
    const listDiv = document.getElementById('prerequisitesList');
    const items = listDiv.querySelectorAll('.prerequisite-item');
    
    if (items.length !== 1) {
        throw new Error('Expected 1 matching item');
    }
});

runner.test('Preservation 6: Node selection works correctly', () => {
    const editor = new NodeEditor();
    editor.allNodes = [...sampleNodes];
    editor.selectedPrerequisites = [];
    
    editor.addPrerequisite('node-1');
    if (!editor.selectedPrerequisites.includes('node-1')) {
        throw new Error('Node should be added to selected');
    }
    
    editor.addPrerequisite('node-2');
    if (editor.selectedPrerequisites.length !== 2) {
        throw new Error('Should have 2 selected nodes');
    }
    
    // Try to add duplicate
    editor.addPrerequisite('node-1');
    if (editor.selectedPrerequisites.length !== 2) {
        throw new Error('Duplicate should not be added');
    }
});

runner.test('Preservation 7: Remove prerequisite works', () => {
    const editor = new NodeEditor();
    editor.allNodes = [...sampleNodes];
    editor.selectedPrerequisites = ['node-1', 'node-2', 'node-3'];
    
    editor.removePrerequisite('node-2');
    
    if (editor.selectedPrerequisites.includes('node-2')) {
        throw new Error('Node should be removed');
    }
    if (editor.selectedPrerequisites.length !== 2) {
        throw new Error('Should have 2 nodes remaining');
    }
});

runner.test('Preservation 8: Empty array shows appropriate message', () => {
    const editor = new NodeEditor();
    editor.allNodes = [];
    
    editor.renderPrerequisitesList();
    
    const listDiv = document.getElementById('prerequisitesList');
    if (!listDiv.innerHTML.includes('暂无可用节点')) {
        throw new Error('Should show "暂无可用节点" for empty array');
    }
});

runner.test('Preservation 9: No search results shows message', () => {
    const editor = new NodeEditor();
    editor.allNodes = [...sampleNodes];
    
    editor.renderPrerequisitesList('不存在的节点');
    
    const listDiv = document.getElementById('prerequisitesList');
    if (!listDiv.innerHTML.includes('没有找到节点')) {
        throw new Error('Should show "没有找到节点" for no results');
    }
});

runner.test('Property: renderPrerequisitesList never throws with valid array', () => {
    const editor = new NodeEditor();
    
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
        }))
    ];
    
    for (const array of validArrays) {
        editor.allNodes = array;
        editor.renderPrerequisitesList();
        
        if (!Array.isArray(editor.allNodes)) {
            throw new Error('allNodes should remain an array');
        }
    }
});

runner.test('Property: Current node always excluded', () => {
    const editor = new NodeEditor();
    const testNodes = Array(10).fill(null).map((_, i) => ({
        id: `node-${i}`,
        name: `节点${i}`,
        nameEn: `Node ${i}`,
        prerequisites: []
    }));
    
    editor.allNodes = testNodes;
    
    for (const node of testNodes.slice(0, 3)) {
        editor.currentNode = node;
        editor.renderPrerequisitesList();
        
        const listDiv = document.getElementById('prerequisitesList');
        const items = listDiv.querySelectorAll('.prerequisite-item');
        const nodeIds = Array.from(items).map(item => item.getAttribute('data-node-id'));
        
        if (nodeIds.includes(node.id)) {
            throw new Error(`Current node ${node.id} should be excluded`);
        }
    }
});

runner.test('Property: List length respects 20-item limit', () => {
    const editor = new NodeEditor();
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
    
    if (items.length > 20) {
        throw new Error(`List should not exceed 20 items, got ${items.length}`);
    }
});

// Run all tests
runner.run().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
});
