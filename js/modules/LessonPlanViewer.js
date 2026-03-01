/**
 * Lesson Plan Viewer
 * Modal viewer for displaying and editing lesson plans
 */

export class LessonPlanViewer {
    constructor() {
        this.modal = null;
        this.currentLessonPlan = null;
        this.isEditing = false;
    }
    
    /**
     * Initialize viewer
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
            <div class="lesson-plan-modal" id="lessonPlanModal">
                <div class="lesson-plan-content">
                    <div class="lesson-plan-header">
                        <h2 id="lessonPlanTitle">教案</h2>
                        <div class="lesson-plan-toolbar">
                            <button class="toolbar-btn" id="editLessonPlanBtn" title="编辑">✏️ 编辑</button>
                            <button class="toolbar-btn" id="exportLessonPlanBtn" title="导出">📥 导出</button>
                            <button class="close-btn" id="closeLessonPlanBtn">&times;</button>
                        </div>
                    </div>
                    <div class="lesson-plan-body" id="lessonPlanBody">
                        <!-- Content will be dynamically generated -->
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.modal = document.getElementById('lessonPlanModal');
    }
    
    /**
     * Bind events
     */
    bindEvents() {
        document.getElementById('closeLessonPlanBtn').addEventListener('click', () => this.hide());
        document.getElementById('editLessonPlanBtn').addEventListener('click', () => this.toggleEdit());
        document.getElementById('exportLessonPlanBtn').addEventListener('click', () => this.showExportDialog());
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });
    }
    
    /**
     * Show lesson plan
     */
    show(lessonPlan) {
        this.currentLessonPlan = lessonPlan;
        this.isEditing = false;
        
        document.getElementById('lessonPlanTitle').textContent = `教案：${lessonPlan.nodeName}`;
        this.renderContent();
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Hide viewer
     */
    hide() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentLessonPlan = null;
        this.isEditing = false;
    }
    
    /**
     * Render lesson plan content
     */
    renderContent() {
        const body = document.getElementById('lessonPlanBody');
        
        if (!this.currentLessonPlan) {
            body.innerHTML = '<p>无教案内容</p>';
            return;
        }
        
        const html = `
            <div class="lesson-plan-meta">
                <p><strong>节点：</strong>${this.currentLessonPlan.nodeName} (${this.currentLessonPlan.nodeNameEn})</p>
                <p><strong>生成时间：</strong>${new Date(this.currentLessonPlan.generatedAt).toLocaleString()}</p>
            </div>
            
            ${this.currentLessonPlan.sections.map(section => `
                <div class="lesson-plan-section">
                    <h3>${section.title}</h3>
                    <div class="section-content">${this.formatContent(section.content)}</div>
                </div>
            `).join('')}
        `;
        
        body.innerHTML = html;
        
        // Render LaTeX if MathJax is available
        if (window.MathJax) {
            MathJax.typesetPromise([body]).catch(err => console.error('MathJax error:', err));
        }
    }
    
    /**
     * Format content (preserve line breaks, render lists)
     */
    formatContent(content) {
        return content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .map(line => `<p>${line}</p>`)
            .join('');
    }
    
    /**
     * Toggle edit mode
     */
    toggleEdit() {
        this.isEditing = !this.isEditing;
        
        if (this.isEditing) {
            this.enableEditMode();
        } else {
            this.disableEditMode();
        }
    }
    
    /**
     * Enable edit mode
     */
    enableEditMode() {
        const sections = document.querySelectorAll('.section-content');
        sections.forEach(section => {
            const content = section.textContent;
            section.innerHTML = `<textarea class="edit-textarea">${content}</textarea>`;
        });
        
        document.getElementById('editLessonPlanBtn').textContent = '💾 保存';
    }
    
    /**
     * Disable edit mode
     */
    disableEditMode() {
        const textareas = document.querySelectorAll('.edit-textarea');
        textareas.forEach((textarea, index) => {
            const content = textarea.value;
            this.currentLessonPlan.sections[index].content = content;
            textarea.parentElement.innerHTML = this.formatContent(content);
        });
        
        document.getElementById('editLessonPlanBtn').textContent = '✏️ 编辑';
        
        // Re-render LaTeX
        if (window.MathJax) {
            MathJax.typesetPromise([document.getElementById('lessonPlanBody')]);
        }
    }
    
    /**
     * Show export dialog
     */
    showExportDialog() {
        // Dispatch event for LessonPlanExporter to handle
        window.dispatchEvent(new CustomEvent('exportLessonPlan', {
            detail: { lessonPlan: this.currentLessonPlan }
        }));
    }
}

// Export singleton instance
export const lessonPlanViewer = new LessonPlanViewer();
