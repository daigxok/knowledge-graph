/**
 * Node Editor
 * Modal dialog for creating and editing knowledge nodes
 */

import { nodeDataManager } from './NodeDataManager.js';

export class NodeEditor {
    constructor() {
        this.modal = null;
        this.currentNode = null;
        this.mode = 'create'; // 'create' or 'edit'
        this.onSaveCallback = null;
        // CRITICAL: this.allNodes MUST always be an array to prevent TypeError in filter operations
        // Initialize as empty array and ensure all assignments maintain array type
        this.allNodes = [];
        this.selectedPrerequisites = [];
    }
    
    /**
     * Initialize the editor
     */
    initialize() {
        this.createModal();
        this.bindEvents();
    }
    
    /**
     * Create modal HTML
     */
    createModal() {
        const modalHtml = `
            <div class="node-editor-modal" id="nodeEditorModal">
                <div class="node-editor-content">
                    <div class="node-editor-header">
                        <h2 id="nodeEditorTitle">创建知识节点</h2>
                        <button class="close-btn" id="closeNodeEditor" aria-label="关闭">&times;</button>
                    </div>
                    
                    <form id="nodeEditorForm" class="node-editor-form">
                        <!-- Basic Information -->
                        <div class="form-section">
                            <h3>基本信息</h3>
                            
                            <div class="form-group">
                                <label for="nodeName">节点名称 <span class="required">*</span></label>
                                <input type="text" id="nodeName" name="name" required 
                                    placeholder="例如：极限的定义" />
                            </div>
                            
                            <div class="form-group">
                                <label for="nodeNameEn">英文名称 <span class="required">*</span></label>
                                <input type="text" id="nodeNameEn" name="nameEn" required 
                                    placeholder="例如：Definition of Limit" />
                            </div>
                            
                            <div class="form-group">
                                <label for="nodeDescription">描述 <span class="required">*</span></label>
                                <textarea id="nodeDescription" name="description" required rows="4"
                                    placeholder="详细描述该知识点的内容和意义..."></textarea>
                            </div>
                        </div>
                        
                        <!-- Domain Selection -->
                        <div class="form-section">
                            <h3>学域分类 <span class="required">*</span></h3>
                            <div class="domain-checkboxes" id="domainCheckboxes">
                                <label><input type="checkbox" name="domains" value="domain-1" /> 变化与逼近</label>
                                <label><input type="checkbox" name="domains" value="domain-2" /> 结构与累积</label>
                                <label><input type="checkbox" name="domains" value="domain-3" /> 优化与决策</label>
                                <label><input type="checkbox" name="domains" value="domain-4" /> 不确定性处理</label>
                                <label><input type="checkbox" name="domains" value="domain-5" /> 真实问题建模</label>
                            </div>
                        </div>
                        
                        <!-- Difficulty and Importance -->
                        <div class="form-section">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="nodeDifficulty">难度 (1-5)</label>
                                    <input type="number" id="nodeDifficulty" name="difficulty" 
                                        min="1" max="5" value="3" />
                                </div>
                                
                                <div class="form-group">
                                    <label for="nodeImportance">重要性 (1-5)</label>
                                    <input type="number" id="nodeImportance" name="importance" 
                                        min="1" max="5" value="3" />
                                </div>
                            </div>
                        </div>
                        
                        <!-- Formula -->
                        <div class="form-section">
                            <h3>核心公式</h3>
                            <div class="form-group">
                                <label for="nodeFormula">LaTeX 公式</label>
                                <textarea id="nodeFormula" name="formula" rows="3"
                                    placeholder="例如：\\lim_{x \\to a} f(x) = L"></textarea>
                                <div class="formula-preview" id="formulaPreview"></div>
                            </div>
                        </div>
                        
                        <!-- Prerequisites -->
                        <div class="form-section">
                            <h3>前置知识</h3>
                            <div class="form-group">
                                <label for="nodePrerequisites">选择前置节点</label>
                                <div class="prerequisites-selector" id="prerequisitesSelector">
                                    <input type="text" id="prerequisiteSearch" 
                                        placeholder="搜索节点..." />
                                    <div class="prerequisites-list" id="prerequisitesList"></div>
                                    <div class="selected-prerequisites" id="selectedPrerequisites"></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Keywords -->
                        <div class="form-section">
                            <h3>关键词</h3>
                            <div class="form-group">
                                <label for="nodeKeywords">关键词（用逗号分隔）</label>
                                <input type="text" id="nodeKeywords" name="keywords"
                                    placeholder="例如：极限,连续性,逼近" />
                            </div>
                        </div>
                        
                        <!-- Study Time -->
                        <div class="form-section">
                            <div class="form-group">
                                <label for="nodeStudyTime">预计学习时间</label>
                                <input type="text" id="nodeStudyTime" name="estimatedStudyTime"
                                    value="2小时" placeholder="例如：2小时" />
                            </div>
                        </div>
                        
                        <!-- Form Actions -->
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancelNodeEditor">取消</button>
                            <button type="submit" class="btn btn-primary" id="saveNodeBtn">保存节点</button>
                        </div>
                        
                        <!-- Validation Errors -->
                        <div class="form-errors" id="formErrors"></div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.modal = document.getElementById('nodeEditorModal');
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Close buttons
        document.getElementById('closeNodeEditor').addEventListener('click', () => this.close());
        document.getElementById('cancelNodeEditor').addEventListener('click', () => this.close());
        
        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Form submit
        document.getElementById('nodeEditorForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Formula preview
        document.getElementById('nodeFormula').addEventListener('input', (e) => {
            this.renderFormulaPreview(e.target.value);
        });
        
        // Prerequisite search
        document.getElementById('prerequisiteSearch').addEventListener('input', (e) => {
            this.filterPrerequisites(e.target.value);
        });
    }
    
    /**
     * Open editor for creating new node
     */
    async openForCreate() {
        this.mode = 'create';
        this.currentNode = null;
        document.getElementById('nodeEditorTitle').textContent = '创建知识节点';
        document.getElementById('saveNodeBtn').textContent = '创建节点';
        
        this.resetForm();
        
        // Ensure nodes are loaded before opening
        try {
            await this.loadPrerequisitesList();
        } catch (error) {
            console.error('Error loading prerequisites:', error);
            this.allNodes = [];
            this.selectedPrerequisites = [];
        }
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Open editor for editing existing node
     */
    async openForEdit(node) {
        this.mode = 'edit';
        this.currentNode = node;
        document.getElementById('nodeEditorTitle').textContent = '编辑知识节点';
        document.getElementById('saveNodeBtn').textContent = '保存更改';
        
        this.populateForm(node);
        
        // Ensure nodes are loaded before opening
        try {
            await this.loadPrerequisitesList();
        } catch (error) {
            console.error('Error loading prerequisites:', error);
            this.allNodes = [];
            this.selectedPrerequisites = [];
        }
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Close editor
     */
    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.resetForm();
    }
    
    /**
     * Reset form
     */
    resetForm() {
        document.getElementById('nodeEditorForm').reset();
        document.getElementById('formulaPreview').innerHTML = '';
        document.getElementById('selectedPrerequisites').innerHTML = '';
        document.getElementById('formErrors').innerHTML = '';
    }
    
    /**
     * Populate form with node data
     */
    populateForm(node) {
        document.getElementById('nodeName').value = node.name || '';
        document.getElementById('nodeNameEn').value = node.nameEn || '';
        document.getElementById('nodeDescription').value = node.description || '';
        document.getElementById('nodeDifficulty').value = node.difficulty || 3;
        document.getElementById('nodeImportance').value = node.importance || 3;
        document.getElementById('nodeFormula').value = node.formula || '';
        document.getElementById('nodeKeywords').value = (node.keywords || []).join(', ');
        document.getElementById('nodeStudyTime').value = node.estimatedStudyTime || '2小时';
        
        // Set domains
        const domainCheckboxes = document.querySelectorAll('input[name="domains"]');
        domainCheckboxes.forEach(cb => {
            cb.checked = node.domains && node.domains.includes(cb.value);
        });
        
        // Set prerequisites
        if (node.prerequisites && node.prerequisites.length > 0) {
            this.selectedPrerequisites = [...node.prerequisites];
            this.renderSelectedPrerequisites();
        }
        
        // Render formula preview
        if (node.formula) {
            this.renderFormulaPreview(node.formula);
        }
    }
    
    /**
     * Get form data
     */
    getFormData() {
        const formData = {
            name: document.getElementById('nodeName').value.trim(),
            nameEn: document.getElementById('nodeNameEn').value.trim(),
            description: document.getElementById('nodeDescription').value.trim(),
            difficulty: parseInt(document.getElementById('nodeDifficulty').value),
            importance: parseInt(document.getElementById('nodeImportance').value),
            formula: document.getElementById('nodeFormula').value.trim(),
            estimatedStudyTime: document.getElementById('nodeStudyTime').value.trim(),
            domains: [],
            prerequisites: this.selectedPrerequisites || [],
            keywords: []
        };
        
        // Get selected domains
        const domainCheckboxes = document.querySelectorAll('input[name="domains"]:checked');
        formData.domains = Array.from(domainCheckboxes).map(cb => cb.value);
        
        // Parse keywords
        const keywordsInput = document.getElementById('nodeKeywords').value.trim();
        if (keywordsInput) {
            formData.keywords = keywordsInput.split(',').map(k => k.trim()).filter(k => k);
        }
        
        return formData;
    }
    
    /**
     * Validate form data
     */
    validate(formData) {
        const errors = [];
        
        if (!formData.name) {
            errors.push('请输入节点名称');
        }
        
        if (!formData.nameEn) {
            errors.push('请输入英文名称');
        }
        
        if (!formData.description) {
            errors.push('请输入描述');
        }
        
        if (formData.domains.length === 0) {
            errors.push('请至少选择一个学域');
        }
        
        if (formData.difficulty < 1 || formData.difficulty > 5) {
            errors.push('难度必须在1-5之间');
        }
        
        if (formData.importance < 1 || formData.importance > 5) {
            errors.push('重要性必须在1-5之间');
        }
        
        return errors;
    }
    
    /**
     * Handle form submit
     */
    async handleSubmit() {
        const formData = this.getFormData();
        
        // Validate
        const errors = this.validate(formData);
        if (errors.length > 0) {
            this.showErrors(errors);
            return;
        }
        
        // Show loading
        const saveBtn = document.getElementById('saveNodeBtn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '保存中...';
        saveBtn.disabled = true;
        
        let result;
        if (this.mode === 'create') {
            result = nodeDataManager.createNode(formData);
        } else {
            // Include version for conflict detection
            if (this.currentNode) {
                formData.version = this.currentNode.version;
            }
            result = nodeDataManager.updateNode(this.currentNode.id, formData);
        }
        
        // Restore button
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
        
        if (result.success) {
            this.showSuccess(result.message);
            
            // Call callback if provided
            if (this.onSaveCallback) {
                this.onSaveCallback(result.node);
            }
            
            // Close after short delay
            setTimeout(() => {
                this.close();
            }, 1000);
        } else {
            if (result.conflict) {
                this.handleConflict(result);
            } else {
                this.showErrors([result.message]);
            }
        }
    }
    
    /**
     * Handle data conflict
     */
    handleConflict(result) {
        const message = `
            ${result.message}
            
            服务器版本：修改于 ${new Date(result.serverVersion.modifiedAt).toLocaleString()}
            您的版本：基于 ${new Date(this.currentNode.modifiedAt).toLocaleString()}
            
            请刷新页面获取最新数据后再编辑。
        `;
        this.showErrors([message]);
    }
    
    /**
     * Show validation errors
     */
    showErrors(errors) {
        const errorsDiv = document.getElementById('formErrors');
        errorsDiv.innerHTML = errors.map(err => 
            `<div class="error-message">❌ ${err}</div>`
        ).join('');
        errorsDiv.style.display = 'block';
    }
    
    /**
     * Show success message
     */
    showSuccess(message) {
        const errorsDiv = document.getElementById('formErrors');
        errorsDiv.innerHTML = `<div class="success-message">✅ ${message}</div>`;
        errorsDiv.style.display = 'block';
    }
    
    /**
     * Render formula preview using MathJax
     */
    renderFormulaPreview(latex) {
        const preview = document.getElementById('formulaPreview');
        
        if (!latex) {
            preview.innerHTML = '';
            return;
        }
        
        preview.innerHTML = `$${latex}$`;
        
        // Trigger MathJax rendering
        if (window.MathJax) {
            MathJax.typesetPromise([preview]).catch(err => {
                console.error('MathJax rendering error:', err);
                preview.innerHTML = '<span class="error">公式格式错误</span>';
            });
        }
    }
    
    /**
     * Load prerequisites list
     */
    async loadPrerequisitesList() {
        try {
            // Ensure nodeDataManager has loaded nodes
            let nodes = nodeDataManager.getAllNodes();
            
            // If no nodes, try to load them
            if (!nodes || nodes.length === 0) {
                console.log('Loading nodes from nodeDataManager...');
                nodes = await nodeDataManager.loadNodes();
            }
            
            // CRITICAL: Ensure this.allNodes is always an array to prevent TypeError
            // Convert any non-array value to empty array
            this.allNodes = Array.isArray(nodes) ? nodes : [];
            this.selectedPrerequisites = [];
            
            console.log('Loaded nodes for prerequisites:', this.allNodes.length);
            
            this.renderPrerequisitesList();
        } catch (error) {
            console.error('Error in loadPrerequisitesList:', error);
            // CRITICAL: Always set to empty array on error to maintain type safety
            this.allNodes = [];
            this.selectedPrerequisites = [];
            this.renderPrerequisitesList();
        }
    }
    
    /**
     * Filter prerequisites by search term
     */
    filterPrerequisites(searchTerm) {
        this.renderPrerequisitesList(searchTerm);
    }
    
    /**
     * Render prerequisites list
     */
    renderPrerequisitesList(searchTerm = '') {
        const listDiv = document.getElementById('prerequisitesList');
        
        if (!listDiv) {
            console.error('Prerequisites list element not found');
            return;
        }
        
        // CRITICAL: Defensive type check at method start to prevent TypeError
        // Ensure allNodes is an array before any array operations (filter, map, etc.)
        if (!Array.isArray(this.allNodes)) {
            console.warn('allNodes is not an array, converting to empty array');
            this.allNodes = [];
        }
        
        // If no nodes available, show message
        if (this.allNodes.length === 0) {
            listDiv.innerHTML = '<div class="no-results">暂无可用节点</div>';
            return;
        }
        
        // Filter nodes
        let nodes = this.allNodes.filter(node => {
            // Exclude current node
            if (this.currentNode && node.id === this.currentNode.id) {
                return false;
            }
            // Exclude already selected
            if (this.selectedPrerequisites && this.selectedPrerequisites.includes(node.id)) {
                return false;
            }
            // Filter by search term
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return node.name.toLowerCase().includes(term) || 
                       node.nameEn.toLowerCase().includes(term) ||
                       node.id.toLowerCase().includes(term);
            }
            return true;
        });
        
        // Limit to 20 results
        nodes = nodes.slice(0, 20);
        
        if (nodes.length === 0) {
            listDiv.innerHTML = '<div class="no-results">没有找到节点</div>';
            return;
        }
        
        listDiv.innerHTML = nodes.map(node => `
            <div class="prerequisite-item" data-node-id="${node.id}">
                <span class="prerequisite-name">${node.name}</span>
                <span class="prerequisite-id">${node.id}</span>
                <button type="button" class="btn-add-prerequisite" data-node-id="${node.id}">添加</button>
            </div>
        `).join('');
        
        // Bind add buttons
        listDiv.querySelectorAll('.btn-add-prerequisite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nodeId = e.target.getAttribute('data-node-id');
                this.addPrerequisite(nodeId);
            });
        });
    }
    
    /**
     * Add prerequisite
     */
    addPrerequisite(nodeId) {
        if (!this.selectedPrerequisites) {
            this.selectedPrerequisites = [];
        }
        
        if (!this.selectedPrerequisites.includes(nodeId)) {
            this.selectedPrerequisites.push(nodeId);
            this.renderSelectedPrerequisites();
            this.renderPrerequisitesList(document.getElementById('prerequisiteSearch').value);
        }
    }
    
    /**
     * Remove prerequisite
     */
    removePrerequisite(nodeId) {
        if (this.selectedPrerequisites) {
            this.selectedPrerequisites = this.selectedPrerequisites.filter(id => id !== nodeId);
            this.renderSelectedPrerequisites();
            this.renderPrerequisitesList(document.getElementById('prerequisiteSearch').value);
        }
    }
    
    /**
     * Render selected prerequisites
     */
    renderSelectedPrerequisites() {
        const container = document.getElementById('selectedPrerequisites');
        
        if (!this.selectedPrerequisites || this.selectedPrerequisites.length === 0) {
            container.innerHTML = '<div class="no-prerequisites">未选择前置知识</div>';
            return;
        }
        
        // CRITICAL: Ensure allNodes is an array before using .find() method
        // Convert any non-array value to empty array to prevent TypeError
        if (!Array.isArray(this.allNodes)) {
            console.warn('allNodes is not an array in renderSelectedPrerequisites, converting to empty array');
            this.allNodes = [];
        }
        
        const selectedNodes = this.selectedPrerequisites.map(id => 
            this.allNodes.find(n => n.id === id)
        ).filter(n => n);
        
        container.innerHTML = selectedNodes.map(node => `
            <div class="selected-prerequisite-tag">
                <span>${node.name}</span>
                <button type="button" class="btn-remove-prerequisite" data-node-id="${node.id}">&times;</button>
            </div>
        `).join('');
        
        // Bind remove buttons
        container.querySelectorAll('.btn-remove-prerequisite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nodeId = e.target.getAttribute('data-node-id');
                this.removePrerequisite(nodeId);
            });
        });
    }
    
    /**
     * Set save callback
     */
    onSave(callback) {
        this.onSaveCallback = callback;
    }
}

// Export singleton instance
export const nodeEditor = new NodeEditor();
