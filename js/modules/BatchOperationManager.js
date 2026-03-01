/**
 * Batch Operation Manager
 * Handles batch operations for nodes (multi-select, batch lesson plan generation)
 */

import { lessonPlanGenerator } from './LessonPlanGenerator.js';
import { lessonPlanExporter } from './LessonPlanExporter.js';

export class BatchOperationManager {
    constructor() {
        this.selectedNodes = new Set();
        this.batchUI = null;
        this.isMultiSelectMode = false;
    }
    
    /**
     * Initialize batch operation manager
     */
    initialize() {
        this.createBatchUI();
        this.bindEvents();
    }
    
    /**
     * Create batch operation UI
     */
    createBatchUI() {
        const batchUIHtml = `
            <div class="batch-operation-panel hidden" id="batchOperationPanel">
                <div class="batch-panel-content">
                    <div class="batch-info">
                        <span class="batch-count">已选择 <strong id="batchSelectedCount">0</strong> 个节点</span>
                    </div>
                    <div class="batch-actions">
                        <button class="batch-btn batch-btn-primary" id="batchGenerateLessonPlans">
                            📝 批量生成教案
                        </button>
                        <button class="batch-btn batch-btn-secondary" id="batchClearSelection">
                            ✖️ 清除选择
                        </button>
                    </div>
                </div>
                <div class="batch-progress hidden" id="batchProgress">
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" id="batchProgressBar"></div>
                    </div>
                    <div class="progress-text" id="batchProgressText">处理中...</div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', batchUIHtml);
        this.batchUI = document.getElementById('batchOperationPanel');
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Batch generate button
        document.getElementById('batchGenerateLessonPlans').addEventListener('click', () => {
            this.generateBatchLessonPlans();
        });
        
        // Clear selection button
        document.getElementById('batchClearSelection').addEventListener('click', () => {
            this.clearSelection();
        });
        
        // Listen for teacher mode changes
        window.addEventListener('teacherModeChanged', (e) => {
            if (!e.detail.enabled) {
                this.clearSelection();
                this.hideBatchPanel();
            }
        });
        
        // Listen for Ctrl/Cmd key for multi-select mode
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                this.enableMultiSelectMode();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (!e.ctrlKey && !e.metaKey) {
                this.disableMultiSelectMode();
            }
        });
    }
    
    /**
     * Enable multi-select mode
     */
    enableMultiSelectMode() {
        this.isMultiSelectMode = true;
        document.body.classList.add('multi-select-mode');
    }
    
    /**
     * Disable multi-select mode
     */
    disableMultiSelectMode() {
        this.isMultiSelectMode = false;
        document.body.classList.remove('multi-select-mode');
    }
    
    /**
     * Toggle node selection
     */
    toggleNodeSelection(nodeId, nodeElement) {
        if (this.selectedNodes.has(nodeId)) {
            this.deselectNode(nodeId, nodeElement);
        } else {
            this.selectNode(nodeId, nodeElement);
        }
    }
    
    /**
     * Select a node
     */
    selectNode(nodeId, nodeElement) {
        this.selectedNodes.add(nodeId);
        
        if (nodeElement) {
            nodeElement.classList.add('node-selected');
        }
        
        this.updateBatchUI();
    }
    
    /**
     * Deselect a node
     */
    deselectNode(nodeId, nodeElement) {
        this.selectedNodes.delete(nodeId);
        
        if (nodeElement) {
            nodeElement.classList.remove('node-selected');
        }
        
        this.updateBatchUI();
    }
    
    /**
     * Clear all selections
     */
    clearSelection() {
        // Remove visual selection from all nodes
        document.querySelectorAll('.node-selected').forEach(node => {
            node.classList.remove('node-selected');
        });
        
        this.selectedNodes.clear();
        this.updateBatchUI();
    }
    
    /**
     * Update batch UI
     */
    updateBatchUI() {
        const count = this.selectedNodes.size;
        
        document.getElementById('batchSelectedCount').textContent = count;
        
        if (count > 0) {
            this.showBatchPanel();
        } else {
            this.hideBatchPanel();
        }
    }
    
    /**
     * Show batch panel
     */
    showBatchPanel() {
        if (this.batchUI) {
            this.batchUI.classList.remove('hidden');
        }
    }
    
    /**
     * Hide batch panel
     */
    hideBatchPanel() {
        if (this.batchUI) {
            this.batchUI.classList.add('hidden');
        }
    }
    
    /**
     * Generate batch lesson plans
     */
    async generateBatchLessonPlans() {
        if (this.selectedNodes.size === 0) {
            this.showNotification('请先选择节点', 'error');
            return;
        }
        
        const nodeIds = Array.from(this.selectedNodes);
        
        // Show progress
        this.showProgress();
        
        try {
            const lessonPlans = [];
            let completed = 0;
            
            for (const nodeId of nodeIds) {
                // Update progress
                this.updateProgress(completed, nodeIds.length, `正在生成: ${nodeId}`);
                
                const result = lessonPlanGenerator.generate(nodeId);
                
                if (result.success) {
                    lessonPlans.push(result.lessonPlan);
                }
                
                completed++;
                
                // Small delay to show progress
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Update final progress
            this.updateProgress(completed, nodeIds.length, '生成完成！');
            
            // Hide progress after short delay
            setTimeout(() => {
                this.hideProgress();
                
                // Show export dialog
                this.showBatchExportDialog(lessonPlans);
            }, 500);
            
        } catch (error) {
            console.error('Batch generation error:', error);
            this.hideProgress();
            this.showNotification('批量生成失败：' + error.message, 'error');
        }
    }
    
    /**
     * Show progress indicator
     */
    showProgress() {
        const progressDiv = document.getElementById('batchProgress');
        if (progressDiv) {
            progressDiv.classList.remove('hidden');
        }
    }
    
    /**
     * Hide progress indicator
     */
    hideProgress() {
        const progressDiv = document.getElementById('batchProgress');
        if (progressDiv) {
            progressDiv.classList.add('hidden');
        }
    }
    
    /**
     * Update progress
     */
    updateProgress(completed, total, message) {
        const percentage = Math.round((completed / total) * 100);
        
        const progressBar = document.getElementById('batchProgressBar');
        const progressText = document.getElementById('batchProgressText');
        
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
        
        if (progressText) {
            progressText.textContent = `${message} (${completed}/${total})`;
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
                <h3>✅ 批量教案生成完成</h3>
                <p>已成功生成 <strong>${lessonPlans.length}</strong> 个教案</p>
                <div class="export-options">
                    <button class="export-btn" data-action="export-md">
                        📝 导出为 Markdown
                    </button>
                    <button class="export-btn" data-action="export-html">
                        🌐 导出为 HTML
                    </button>
                    <button class="export-btn" data-action="preview">
                        👁️ 预览第一个
                    </button>
                </div>
                <button class="export-cancel">关闭</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Export as Markdown
        dialog.querySelector('[data-action="export-md"]').addEventListener('click', () => {
            lessonPlanExporter.exportBatch(lessonPlans, 'markdown');
            dialog.remove();
            this.clearSelection();
        });
        
        // Export as HTML
        dialog.querySelector('[data-action="export-html"]').addEventListener('click', () => {
            this.exportBatchAsHTML(lessonPlans);
            dialog.remove();
            this.clearSelection();
        });
        
        // Preview first
        dialog.querySelector('[data-action="preview"]').addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('showLessonPlan', {
                detail: { lessonPlan: lessonPlans[0] }
            }));
            dialog.remove();
        });
        
        // Close
        dialog.querySelector('.export-cancel').addEventListener('click', () => {
            dialog.remove();
        });
    }
    
    /**
     * Export batch as HTML
     */
    exportBatchAsHTML(lessonPlans) {
        let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>批量教案 - ${lessonPlans.length}个节点</title>
    <script src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-chtml.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
        }
        .toc {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 40px;
        }
        .toc h2 { margin-top: 0; }
        .toc ul { list-style: none; padding-left: 0; }
        .toc li { margin: 10px 0; }
        .toc a { color: #667eea; text-decoration: none; }
        .lesson-plan {
            margin-bottom: 60px;
            page-break-after: always;
        }
        h1 { color: #2d3436; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
        h2 { color: #667eea; margin-top: 30px; }
        .meta { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        @media print {
            body { margin: 0; padding: 20px; }
            .lesson-plan { page-break-after: always; }
        }
    </style>
</head>
<body>
    <h1>批量教案</h1>
    <div class="toc">
        <h2>目录</h2>
        <ul>
`;
        
        lessonPlans.forEach((lp, index) => {
            html += `            <li><a href="#lesson-${index + 1}">${index + 1}. ${lp.nodeName}</a></li>\n`;
        });
        
        html += `        </ul>
    </div>
`;
        
        lessonPlans.forEach((lp, index) => {
            html += `
    <div class="lesson-plan" id="lesson-${index + 1}">
        <h1>${index + 1}. ${lp.nodeName}</h1>
        <div class="meta">
            <p><strong>英文名称：</strong>${lp.nodeNameEn}</p>
            <p><strong>生成时间：</strong>${new Date(lp.generatedAt).toLocaleString()}</p>
        </div>
`;
            
            lp.sections.forEach(section => {
                html += `        <div class="section">
            <h2>${section.title}</h2>
            ${this.formatContentToHTML(section.content)}
        </div>\n`;
            });
            
            html += `    </div>\n`;
        });
        
        html += `</body>
</html>`;
        
        // Download
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `批量教案-${lessonPlans.length}个节点.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Format content to HTML
     */
    formatContentToHTML(content) {
        return content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .map(line => `<p>${line}</p>`)
            .join('\n            ');
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
     * Get selected node IDs
     */
    getSelectedNodeIds() {
        return Array.from(this.selectedNodes);
    }
    
    /**
     * Get selected node count
     */
    getSelectedCount() {
        return this.selectedNodes.size;
    }
}

// Export singleton instance
export const batchOperationManager = new BatchOperationManager();
