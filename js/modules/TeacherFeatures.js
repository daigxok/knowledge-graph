/**
 * Teacher Features Integration
 * Initializes and coordinates all teacher-related modules
 */

import { auth } from './Auth.js';
import { teacherUIController } from './TeacherUIController.js';
import { nodeDataManager } from './NodeDataManager.js';
import { nodeEditor } from './NodeEditor.js';
import { lessonPlanGenerator } from './LessonPlanGenerator.js';
import { lessonPlanViewer } from './LessonPlanViewer.js';
import { lessonPlanExporter } from './LessonPlanExporter.js';
import { batchOperationManager } from './BatchOperationManager.js';

export class TeacherFeatures {
    constructor() {
        this.initialized = false;
    }
    
    /**
     * Initialize all teacher features (node data + modals always init so 生成教案/编辑节点 work for all)
     */
    async initialize() {
        if (this.initialized) {
            return;
        }
        
        console.log('Initializing teacher features...');
        
        try {
            // 与主图共用节点数据：主入口已 setNodes(nodesData.nodes)，此处再加载一次以支持单独打开场景
            await nodeDataManager.loadNodes();
            
            nodeEditor.initialize();
            lessonPlanViewer.initialize();
            lessonPlanExporter.initialize();
            batchOperationManager.initialize();
            this.bindGlobalEvents();
            
            if (auth.isTeacher()) {
                teacherUIController.initialize();
            }
            
            // Set up node editor callback
            nodeEditor.onSave((node) => {
                this.onNodeSaved(node);
            });
            
            this.initialized = true;
            console.log('Teacher features initialized successfully');
        } catch (error) {
            console.error('Error initializing teacher features:', error);
        }
    }
    
    /**
     * Bind global events
     */
    bindGlobalEvents() {
        // Listen for add node request
        window.addEventListener('addNodeRequest', () => {
            nodeEditor.openForCreate();
        });
        
        // Listen for edit node request
        window.addEventListener('editNodeRequest', (e) => {
            const node = e.detail.node;
            nodeEditor.openForEdit(node);
        });
        
        // Listen for generate lesson plan request
        window.addEventListener('generateLessonPlanRequest', (e) => {
            const nodeId = e.detail.nodeId;
            this.generateAndShowLessonPlan(nodeId);
        });
        
        // Listen for batch lesson plan request
        window.addEventListener('generateBatchLessonPlanRequest', (e) => {
            const nodeIds = e.detail.nodeIds;
            this.generateBatchLessonPlans(nodeIds);
        });
        
        // Listen for show lesson plan request
        window.addEventListener('showLessonPlan', (e) => {
            const lessonPlan = e.detail.lessonPlan;
            lessonPlanViewer.show(lessonPlan);
        });
        
        // Listen for node click in multi-select mode
        window.addEventListener('nodeClickInMultiSelect', (e) => {
            const { nodeId, nodeElement } = e.detail;
            batchOperationManager.toggleNodeSelection(nodeId, nodeElement);
        });
    }
    
    /**
     * Handle node saved
     */
    onNodeSaved(node) {
        console.log('Node saved:', node);
        
        this.showNotification(`节点"${node.name}"已保存`, 'success');
        
        window.dispatchEvent(new CustomEvent('nodeDataChanged', { detail: { node } }));
    }
    
    /**
     * Generate and show lesson plan
     */
    generateAndShowLessonPlan(nodeId) {
        const result = lessonPlanGenerator.generate(nodeId);
        
        if (result.success) {
            lessonPlanViewer.show(result.lessonPlan);
        } else {
            this.showNotification(result.message, 'error');
        }
    }
    
    /**
     * Generate batch lesson plans
     */
    generateBatchLessonPlans(nodeIds) {
        const result = lessonPlanGenerator.generateBatch(nodeIds);
        
        if (result.success && result.lessonPlans.length > 0) {
            // Show export dialog for batch
            this.showBatchExportDialog(result.lessonPlans);
        } else {
            this.showNotification('批量生成失败', 'error');
        }
    }
    
    /**
     * Show batch export dialog
     */
    showBatchExportDialog(lessonPlans) {
        const dialog = document.createElement('div');
        dialog.className = 'export-dialog';
        dialog.innerHTML = `
            <div class="export-dialog-content">
                <h3>批量教案生成完成</h3>
                <p>已生成 ${lessonPlans.length} 个教案</p>
                <div class="export-options">
                    <button class="export-btn" data-action="export">📥 导出为Markdown</button>
                    <button class="export-btn" data-action="preview">👁️ 预览第一个</button>
                </div>
                <button class="export-cancel">关闭</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        dialog.querySelector('[data-action="export"]').addEventListener('click', () => {
            lessonPlanExporter.exportBatch(lessonPlans, 'markdown');
            dialog.remove();
        });
        
        dialog.querySelector('[data-action="preview"]').addEventListener('click', () => {
            lessonPlanViewer.show(lessonPlans[0]);
            dialog.remove();
        });
        
        dialog.querySelector('.export-cancel').addEventListener('click', () => {
            dialog.remove();
        });
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const toast = document.getElementById('notificationToast');
        const messageEl = document.getElementById('notificationMessage');
        
        if (toast && messageEl) {
            messageEl.textContent = message;
            toast.className = 'notification-toast show ' + type;
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }
    
    /**
     * Add teacher controls to node detail panel
     */
    enhanceNodeDetailPanel() {
        // This will be called when a node is selected
        window.addEventListener('nodeSelected', (e) => {
            const node = e.detail.node;
            const detailPanel = document.getElementById('detailPanel');
            
            if (!detailPanel) return;
            
            // Check if teacher controls already exist
            let teacherControls = detailPanel.querySelector('.teacher-node-controls');
            
            if (!teacherControls) {
                teacherControls = document.createElement('div');
                teacherControls.className = 'teacher-node-controls';
                teacherControls.innerHTML = `
                    <button class="teacher-btn teacher-btn-primary" id="editNodeBtn">
                        ✏️ 编辑节点
                    </button>
                    <button class="teacher-btn teacher-btn-secondary" id="generateLessonPlanBtn">
                        📝 生成教案
                    </button>
                `;
                
                const detailContent = detailPanel.querySelector('.detail-panel-content');
                if (detailContent) {
                    // 插入到详情内容最上方，而不是末尾
                    if (detailContent.firstChild) {
                        detailContent.insertBefore(teacherControls, detailContent.firstChild);
                    } else {
                        detailContent.appendChild(teacherControls);
                    }
                }
            }
            
            // Bind events
            const editBtn = teacherControls.querySelector('#editNodeBtn');
            const lessonBtn = teacherControls.querySelector('#generateLessonPlanBtn');
            
            if (editBtn) {
                editBtn.onclick = () => {
                    window.dispatchEvent(new CustomEvent('editNodeRequest', {
                        detail: { node: node }
                    }));
                };
            }
            
            if (lessonBtn) {
                lessonBtn.onclick = () => {
                    window.dispatchEvent(new CustomEvent('generateLessonPlanRequest', {
                        detail: { nodeId: node.id }
                    }));
                };
            }
        });
    }
}

// Export singleton instance
export const teacherFeatures = new TeacherFeatures();
