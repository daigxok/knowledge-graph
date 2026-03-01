/**
 * Teacher UI Controller
 * Manages teacher-specific UI elements and interactions
 */

import { auth } from './Auth.js';

export class TeacherUIController {
    constructor() {
        this.isTeacherMode = false;
        this.teacherControls = null;
    }
    
    /**
     * Initialize teacher UI
     */
    initialize() {
        if (!auth.isTeacher()) {
            return;
        }
        
        this.createTeacherControls();
        this.bindEvents();
        
        // Check if teacher mode was previously enabled
        const savedMode = localStorage.getItem('kg_teacher_mode');
        if (savedMode === 'true') {
            this.enableTeacherMode();
        }
    }
    
    /**
     * Create teacher control elements
     */
    createTeacherControls() {
        // Add teacher mode toggle to header
        const headerUserMenu = document.querySelector('.header-user-menu');
        if (!headerUserMenu) return;
        
        const teacherToggle = document.createElement('div');
        teacherToggle.className = 'teacher-mode-toggle';
        teacherToggle.innerHTML = `
            <label class="toggle-switch">
                <input type="checkbox" id="teacherModeToggle" />
                <span class="toggle-slider"></span>
                <span class="toggle-label">备课模式</span>
            </label>
        `;
        
        headerUserMenu.insertBefore(teacherToggle, headerUserMenu.firstChild);
        
        // Add floating action button for adding nodes
        const fab = document.createElement('button');
        fab.id = 'addNodeFab';
        fab.className = 'fab-add-node hidden';
        fab.innerHTML = '➕';
        fab.title = '添加知识节点';
        fab.setAttribute('aria-label', '添加知识节点');
        document.body.appendChild(fab);
        
        this.teacherControls = {
            toggle: document.getElementById('teacherModeToggle'),
            fab: fab
        };
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        if (!this.teacherControls) return;
        
        // Teacher mode toggle
        this.teacherControls.toggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.enableTeacherMode();
            } else {
                this.disableTeacherMode();
            }
        });
        
        // Add node FAB
        this.teacherControls.fab.addEventListener('click', () => {
            this.onAddNodeClick();
        });
    }
    
    /**
     * Enable teacher mode
     */
    enableTeacherMode() {
        this.isTeacherMode = true;
        localStorage.setItem('kg_teacher_mode', 'true');
        
        if (this.teacherControls) {
            this.teacherControls.toggle.checked = true;
            this.teacherControls.fab.classList.remove('hidden');
        }
        
        document.body.classList.add('teacher-mode');
        
        // Dispatch event for other modules
        window.dispatchEvent(new CustomEvent('teacherModeChanged', {
            detail: { enabled: true }
        }));
    }
    
    /**
     * Disable teacher mode
     */
    disableTeacherMode() {
        this.isTeacherMode = false;
        localStorage.setItem('kg_teacher_mode', 'false');
        
        if (this.teacherControls) {
            this.teacherControls.toggle.checked = false;
            this.teacherControls.fab.classList.add('hidden');
        }
        
        document.body.classList.remove('teacher-mode');
        
        // Dispatch event for other modules
        window.dispatchEvent(new CustomEvent('teacherModeChanged', {
            detail: { enabled: false }
        }));
    }
    
    /**
     * Toggle teacher mode
     */
    toggleTeacherMode() {
        if (this.isTeacherMode) {
            this.disableTeacherMode();
        } else {
            this.enableTeacherMode();
        }
    }
    
    /**
     * Show teacher controls
     */
    showTeacherControls() {
        if (this.teacherControls && this.isTeacherMode) {
            this.teacherControls.fab.classList.remove('hidden');
        }
    }
    
    /**
     * Hide teacher controls
     */
    hideTeacherControls() {
        if (this.teacherControls) {
            this.teacherControls.fab.classList.add('hidden');
        }
    }
    
    /**
     * Handle add node button click
     */
    onAddNodeClick() {
        // Dispatch event for NodeEditor to handle
        window.dispatchEvent(new CustomEvent('addNodeRequest'));
    }
    
    /**
     * Check if teacher mode is enabled
     */
    isEnabled() {
        return this.isTeacherMode;
    }
}

// Export singleton instance
export const teacherUIController = new TeacherUIController();
