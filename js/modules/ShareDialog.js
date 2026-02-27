/**
 * ShareDialog - 分享对话框组件
 * Task 21: 导出与分享功能
 */

import { exportManager } from './ExportManager.js';

export class ShareDialog {
    constructor() {
        this.dialog = null;
        this.isOpen = false;
    }

    /**
     * 显示分享对话框
     */
    show(data, options = {}) {
        if (this.isOpen) {
            return;
        }

        this.createDialog(data, options);
        this.isOpen = true;
    }

    /**
     * 创建对话框
     */
    createDialog(data, options) {
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'share-dialog-overlay';
        overlay.addEventListener('click', () => this.close());

        // 创建对话框
        this.dialog = document.createElement('div');
        this.dialog.className = 'share-dialog';
        this.dialog.innerHTML = `
            <div class="share-dialog-header">
                <h2>📤 导出与分享</h2>
                <button class="share-dialog-close" aria-label="关闭">×</button>
            </div>
            
            <div class="share-dialog-content">
                <!-- 导出选项 -->
                <div class="share-section">
                    <h3>📥 导出</h3>
                    <div class="export-options">
                        <button class="export-btn" data-format="pdf">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <span>PDF</span>
                        </button>
                        
                        <button class="export-btn" data-format="markdown">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                            </svg>
                            <span>Markdown</span>
                        </button>
                        
                        <button class="export-btn" data-format="png">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <span>PNG</span>
                        </button>
                        
                        <button class="export-btn" data-format="json">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <path d="M10 12h4"></path>
                                <path d="M10 16h4"></path>
                            </svg>
                            <span>JSON</span>
                        </button>
                    </div>
                </div>
                
                <!-- 分享链接 -->
                <div class="share-section">
                    <h3>🔗 分享链接</h3>
                    <div class="share-link-container">
                        <input type="text" class="share-link-input" readonly placeholder="点击生成分享链接">
                        <button class="generate-link-btn">生成链接</button>
                        <button class="copy-link-btn" style="display: none;">复制</button>
                    </div>
                    <p class="share-link-hint">分享链接包含当前的图谱视图和过滤条件</p>
                </div>
                
                <!-- 批量导出 -->
                <div class="share-section">
                    <h3>📦 批量导出</h3>
                    <button class="batch-export-btn">导出全部格式</button>
                </div>
                
                <!-- 状态提示 -->
                <div class="share-status" style="display: none;"></div>
            </div>
        `;

        // 添加到页面
        document.body.appendChild(overlay);
        document.body.appendChild(this.dialog);

        // 绑定事件
        this.bindEvents(data, options);

        // 添加样式
        this.addStyles();

        // 动画显示
        setTimeout(() => {
            overlay.classList.add('active');
            this.dialog.classList.add('active');
        }, 10);
    }

    /**
     * 绑定事件
     */
    bindEvents(data, options) {
        // 关闭按钮
        const closeBtn = this.dialog.querySelector('.share-dialog-close');
        closeBtn.addEventListener('click', () => this.close());

        // 导出按钮
        const exportBtns = this.dialog.querySelectorAll('.export-btn');
        exportBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.dataset.format;
                this.handleExport(format, data, options);
            });
        });

        // 生成链接按钮
        const generateBtn = this.dialog.querySelector('.generate-link-btn');
        generateBtn.addEventListener('click', () => {
            this.handleGenerateLink(data, options);
        });

        // 复制链接按钮
        const copyBtn = this.dialog.querySelector('.copy-link-btn');
        copyBtn.addEventListener('click', () => {
            this.handleCopyLink();
        });

        // 批量导出按钮
        const batchBtn = this.dialog.querySelector('.batch-export-btn');
        batchBtn.addEventListener('click', () => {
            this.handleBatchExport(data, options);
        });
    }

    /**
     * 处理导出
     */
    async handleExport(format, data, options) {
        this.showStatus('正在导出...', 'loading');

        try {
            let result;

            switch (format) {
                case 'pdf':
                    if (!data.learningPath || data.learningPath.length === 0) {
                        throw new Error('没有学习路径可导出');
                    }
                    result = await exportManager.exportLearningPathToPDF(data.learningPath, options.pdf);
                    break;

                case 'markdown':
                    if (!data.nodes || data.nodes.length === 0) {
                        throw new Error('没有节点可导出');
                    }
                    result = exportManager.exportNodesToMarkdown(data.nodes, options.markdown);
                    break;

                case 'png':
                    if (!data.graphElement) {
                        throw new Error('没有图谱元素可导出');
                    }
                    result = await exportManager.exportGraphToPNG(data.graphElement, options.png);
                    break;

                case 'json':
                    if (!data.progress) {
                        throw new Error('没有进度数据可导出');
                    }
                    result = exportManager.exportProgressToJSON(data.progress, options.json);
                    break;
            }

            this.showStatus(`✅ ${format.toUpperCase()} 导出成功！`, 'success');
        } catch (error) {
            this.showStatus(`❌ 导出失败: ${error.message}`, 'error');
        }
    }

    /**
     * 处理生成链接
     */
    handleGenerateLink(data, options) {
        try {
            const shareData = {
                nodes: data.selectedNodes || [],
                filters: data.filters || {},
                view: data.view || {},
                timestamp: Date.now()
            };

            const shareUrl = exportManager.generateShareLink(shareData, options.share);
            
            const input = this.dialog.querySelector('.share-link-input');
            input.value = shareUrl;
            
            const generateBtn = this.dialog.querySelector('.generate-link-btn');
            const copyBtn = this.dialog.querySelector('.copy-link-btn');
            
            generateBtn.style.display = 'none';
            copyBtn.style.display = 'block';
            
            this.showStatus('✅ 分享链接已生成！', 'success');
        } catch (error) {
            this.showStatus(`❌ 生成链接失败: ${error.message}`, 'error');
        }
    }

    /**
     * 处理复制链接
     */
    async handleCopyLink() {
        const input = this.dialog.querySelector('.share-link-input');
        const shareUrl = input.value;

        if (!shareUrl) {
            this.showStatus('❌ 请先生成分享链接', 'error');
            return;
        }

        const success = await exportManager.copyShareLinkToClipboard(shareUrl);
        
        if (success) {
            this.showStatus('✅ 链接已复制到剪贴板！', 'success');
        } else {
            this.showStatus('❌ 复制失败，请手动复制', 'error');
        }
    }

    /**
     * 处理批量导出
     */
    async handleBatchExport(data, options) {
        this.showStatus('正在批量导出...', 'loading');

        try {
            const results = await exportManager.exportAll(data, options);
            
            const successCount = Object.values(results).filter(r => r !== null).length;
            this.showStatus(`✅ 批量导出完成！成功导出 ${successCount} 个文件`, 'success');
        } catch (error) {
            this.showStatus(`❌ 批量导出失败: ${error.message}`, 'error');
        }
    }

    /**
     * 显示状态提示
     */
    showStatus(message, type = 'info') {
        const statusEl = this.dialog.querySelector('.share-status');
        statusEl.textContent = message;
        statusEl.className = `share-status ${type}`;
        statusEl.style.display = 'block';

        if (type !== 'loading') {
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 3000);
        }
    }

    /**
     * 关闭对话框
     */
    close() {
        const overlay = document.querySelector('.share-dialog-overlay');
        
        if (overlay) {
            overlay.classList.remove('active');
        }
        
        if (this.dialog) {
            this.dialog.classList.remove('active');
        }

        setTimeout(() => {
            if (overlay) overlay.remove();
            if (this.dialog) this.dialog.remove();
            this.dialog = null;
            this.isOpen = false;
        }, 300);
    }

    /**
     * 添加样式
     */
    addStyles() {
        if (document.getElementById('share-dialog-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'share-dialog-styles';
        style.textContent = `
            .share-dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9998;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .share-dialog-overlay.active {
                opacity: 1;
            }
            
            .share-dialog {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                z-index: 9999;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                opacity: 0;
                transition: all 0.3s ease;
            }
            
            .share-dialog.active {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            
            .share-dialog-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .share-dialog-header h2 {
                margin: 0;
                font-size: 20px;
                color: #333;
            }
            
            .share-dialog-close {
                background: none;
                border: none;
                font-size: 28px;
                color: #666;
                cursor: pointer;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s;
            }
            
            .share-dialog-close:hover {
                background: #f0f0f0;
            }
            
            .share-dialog-content {
                padding: 20px;
            }
            
            .share-section {
                margin-bottom: 30px;
            }
            
            .share-section h3 {
                margin: 0 0 15px 0;
                font-size: 16px;
                color: #555;
            }
            
            .export-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 10px;
            }
            
            .export-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 15px;
                background: #f5f5f5;
                border: 2px solid transparent;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .export-btn:hover {
                background: #e8e8e8;
                border-color: #667eea;
            }
            
            .export-btn svg {
                color: #667eea;
            }
            
            .export-btn span {
                font-size: 14px;
                font-weight: 500;
                color: #333;
            }
            
            .share-link-container {
                display: flex;
                gap: 10px;
            }
            
            .share-link-input {
                flex: 1;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
            }
            
            .generate-link-btn,
            .copy-link-btn,
            .batch-export-btn {
                padding: 10px 20px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: background 0.2s;
            }
            
            .generate-link-btn:hover,
            .copy-link-btn:hover,
            .batch-export-btn:hover {
                background: #764ba2;
            }
            
            .batch-export-btn {
                width: 100%;
            }
            
            .share-link-hint {
                margin: 10px 0 0 0;
                font-size: 12px;
                color: #666;
            }
            
            .share-status {
                padding: 12px;
                border-radius: 5px;
                margin-top: 15px;
                font-size: 14px;
            }
            
            .share-status.success {
                background: #e8f5e9;
                color: #2e7d32;
            }
            
            .share-status.error {
                background: #ffebee;
                color: #c62828;
            }
            
            .share-status.loading {
                background: #e3f2fd;
                color: #1976d2;
            }
        `;
        
        document.head.appendChild(style);
    }
}
