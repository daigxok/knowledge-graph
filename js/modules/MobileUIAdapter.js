/**
 * MobileUIAdapter - 移动端UI适配器
 * Task 20.3: 优化移动端UI
 * 需求 17: 移动端适配
 */

import { isMobileDevice, isTouchDevice, getDeviceType, isLandscape } from './MobileGestureHandler.js';

export class MobileUIAdapter {
    constructor() {
        this.deviceType = getDeviceType();
        this.isMobile = isMobileDevice();
        this.isTouch = isTouchDevice();
        this.sidebarOpen = false;
        this.detailPanelOpen = false;
        
        this.init();
    }

    /**
     * 初始化移动端UI
     */
    init() {
        if (!this.isMobile && !this.isTouch) {
            console.log('📱 Desktop device detected, mobile UI not needed');
            return;
        }
        
        console.log(`📱 Mobile device detected: ${this.deviceType}`);
        
        // 添加移动端类名
        document.body.classList.add('mobile-device');
        document.body.classList.add(`device-${this.deviceType}`);
        
        // 创建移动端UI元素
        this.createMobileHeader();
        this.createSidebarOverlay();
        this.setupSidebarDrawer();
        this.setupDetailPanel();
        this.optimizeGraphForMobile();
        this.setupOrientationChange();
        
        console.log('✅ Mobile UI adapter initialized');
    }

    /**
     * 创建移动端顶部导航栏
     */
    createMobileHeader() {
        // 检查是否已存在
        if (document.querySelector('.mobile-header')) return;
        
        const header = document.createElement('div');
        header.className = 'mobile-header';
        header.innerHTML = `
            <button class="menu-button" id="mobile-menu-btn" aria-label="打开菜单">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>
            <h1>知识图谱</h1>
            <button class="search-button" id="mobile-search-btn" aria-label="搜索">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
            </button>
        `;
        
        document.body.insertBefore(header, document.body.firstChild);
        
        // 绑定事件
        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        document.getElementById('mobile-search-btn').addEventListener('click', () => {
            this.showSearchDialog();
        });
    }

    /**
     * 创建侧边栏遮罩层
     */
    createSidebarOverlay() {
        if (document.querySelector('.sidebar-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.addEventListener('click', () => {
            this.closeSidebar();
        });
        
        document.body.appendChild(overlay);
    }

    /**
     * 设置侧边栏抽屉
     */
    setupSidebarDrawer() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        // 添加关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.className = 'sidebar-close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', '关闭侧边栏');
        closeBtn.addEventListener('click', () => {
            this.closeSidebar();
        });
        
        sidebar.insertBefore(closeBtn, sidebar.firstChild);
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .sidebar-close-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                width: 40px;
                height: 40px;
                border: none;
                background: rgba(0,0,0,0.1);
                border-radius: 50%;
                font-size: 24px;
                cursor: pointer;
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10;
            }
            
            @media (max-width: 768px) {
                .sidebar-close-btn {
                    display: flex;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 设置节点详情面板
     */
    setupDetailPanel() {
        const panel = document.querySelector('.node-detail-panel');
        if (!panel) return;
        
        // 添加拖动手柄
        const handle = document.createElement('div');
        handle.className = 'panel-handle';
        panel.insertBefore(handle, panel.firstChild);
        
        // 添加关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.className = 'panel-close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', '关闭详情面板');
        closeBtn.addEventListener('click', () => {
            this.closeDetailPanel();
        });
        
        panel.insertBefore(closeBtn, panel.firstChild);
        
        // 支持向下滑动关闭
        this.setupPanelSwipeDown(panel, handle);
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .panel-close-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                width: 36px;
                height: 36px;
                border: none;
                background: rgba(0,0,0,0.1);
                border-radius: 50%;
                font-size: 24px;
                cursor: pointer;
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10;
            }
            
            @media (max-width: 768px) {
                .panel-close-btn {
                    display: flex;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 设置面板向下滑动关闭
     */
    setupPanelSwipeDown(panel, handle) {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        
        handle.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isDragging = true;
            panel.style.transition = 'none';
        });
        
        handle.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            if (deltaY > 0) {
                panel.style.transform = `translateY(${deltaY}px)`;
            }
        });
        
        handle.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            const deltaY = currentY - startY;
            panel.style.transition = 'transform 0.3s ease';
            
            if (deltaY > 100) {
                this.closeDetailPanel();
            } else {
                panel.style.transform = 'translateY(0)';
            }
            
            isDragging = false;
        });
    }

    /**
     * 优化图谱显示
     */
    optimizeGraphForMobile() {
        const canvas = document.querySelector('.graph-canvas');
        if (!canvas) return;
        
        // 调整节点大小
        const nodes = canvas.querySelectorAll('.graph-node');
        nodes.forEach(node => {
            const circle = node.querySelector('circle');
            if (circle) {
                const currentR = parseFloat(circle.getAttribute('r') || 5);
                circle.setAttribute('r', currentR * 1.5);
            }
            
            const text = node.querySelector('text');
            if (text) {
                text.style.fontSize = '12px';
                text.style.fontWeight = '500';
            }
        });
        
        // 调整边线宽度
        const edges = canvas.querySelectorAll('.graph-edge');
        edges.forEach(edge => {
            edge.style.strokeWidth = '2px';
        });
    }

    /**
     * 设置屏幕方向变化监听
     */
    setupOrientationChange() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    /**
     * 处理屏幕方向变化
     */
    handleOrientationChange() {
        const landscape = isLandscape();
        
        if (landscape) {
            document.body.classList.add('landscape');
            document.body.classList.remove('portrait');
        } else {
            document.body.classList.add('portrait');
            document.body.classList.remove('landscape');
        }
        
        console.log(`📱 Orientation changed: ${landscape ? 'landscape' : 'portrait'}`);
        
        // 关闭打开的面板
        if (this.sidebarOpen) {
            this.closeSidebar();
        }
    }

    /**
     * 处理窗口大小变化
     */
    handleResize() {
        const newDeviceType = getDeviceType();
        
        if (newDeviceType !== this.deviceType) {
            this.deviceType = newDeviceType;
            document.body.className = document.body.className.replace(/device-\w+/, `device-${newDeviceType}`);
            console.log(`📱 Device type changed: ${newDeviceType}`);
        }
    }

    /**
     * 切换侧边栏
     */
    toggleSidebar() {
        if (this.sidebarOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }

    /**
     * 打开侧边栏
     */
    openSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.add('open');
            this.sidebarOpen = true;
        }
        
        if (overlay) {
            overlay.classList.add('active');
        }
        
        // 禁止背景滚动
        document.body.style.overflow = 'hidden';
    }

    /**
     * 关闭侧边栏
     */
    closeSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.remove('open');
            this.sidebarOpen = false;
        }
        
        if (overlay) {
            overlay.classList.remove('active');
        }
        
        // 恢复背景滚动
        document.body.style.overflow = '';
    }

    /**
     * 打开详情面板
     */
    openDetailPanel() {
        const panel = document.querySelector('.node-detail-panel');
        
        if (panel) {
            panel.classList.add('open');
            this.detailPanelOpen = true;
        }
    }

    /**
     * 关闭详情面板
     */
    closeDetailPanel() {
        const panel = document.querySelector('.node-detail-panel');
        
        if (panel) {
            panel.classList.remove('open');
            this.detailPanelOpen = false;
        }
    }

    /**
     * 显示搜索对话框
     */
    showSearchDialog() {
        // 创建搜索对话框
        const dialog = document.createElement('div');
        dialog.className = 'mobile-search-dialog';
        dialog.innerHTML = `
            <div class="search-dialog-content">
                <div class="search-dialog-header">
                    <input type="search" placeholder="搜索节点..." class="search-input" autofocus>
                    <button class="search-close-btn">取消</button>
                </div>
                <div class="search-results"></div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 绑定事件
        const closeBtn = dialog.querySelector('.search-close-btn');
        closeBtn.addEventListener('click', () => {
            dialog.remove();
        });
        
        const searchInput = dialog.querySelector('.search-input');
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value, dialog.querySelector('.search-results'));
        });
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .mobile-search-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: white;
                z-index: 2000;
                animation: slideInUp 0.3s ease;
            }
            
            .search-dialog-content {
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            
            .search-dialog-header {
                display: flex;
                align-items: center;
                padding: 12px;
                border-bottom: 1px solid #ddd;
            }
            
            .search-input {
                flex: 1;
                padding: 10px;
                font-size: 16px;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin-right: 10px;
            }
            
            .search-close-btn {
                padding: 10px 16px;
                background: none;
                border: none;
                color: #667eea;
                font-size: 16px;
                cursor: pointer;
            }
            
            .search-results {
                flex: 1;
                overflow-y: auto;
                padding: 12px;
            }
            
            @keyframes slideInUp {
                from {
                    transform: translateY(100%);
                }
                to {
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 处理搜索
     */
    handleSearch(query, resultsContainer) {
        // 这里应该调用实际的搜索功能
        // 示例实现
        resultsContainer.innerHTML = `<p>搜索: ${query}</p>`;
    }

    /**
     * 获取设备信息
     */
    getDeviceInfo() {
        return {
            deviceType: this.deviceType,
            isMobile: this.isMobile,
            isTouch: this.isTouch,
            isLandscape: isLandscape(),
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight
        };
    }
}
