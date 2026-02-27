/**
 * MobileGestureHandler - 移动端手势处理器
 * Task 20.2: 实现触摸手势支持
 * 需求 17.2: 支持触摸手势进行缩放和平移
 */

export class MobileGestureHandler {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            enablePinchZoom: true,
            enablePan: true,
            enableDoubleTap: true,
            minScale: 0.5,
            maxScale: 5,
            ...options
        };
        
        // 状态
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.lastTouchDistance = 0;
        this.lastTouchCenter = { x: 0, y: 0 };
        this.touches = [];
        this.isGesturing = false;
        
        // 双击检测
        this.lastTapTime = 0;
        this.tapTimeout = null;
        
        // 回调函数
        this.onZoom = options.onZoom || (() => {});
        this.onPan = options.onPan || (() => {});
        this.onDoubleTap = options.onDoubleTap || (() => {});
        
        this.init();
    }

    /**
     * 初始化事件监听
     */
    init() {
        // 触摸事件
        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        this.element.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
        
        // 阻止默认的缩放行为
        this.element.addEventListener('gesturestart', (e) => e.preventDefault());
        this.element.addEventListener('gesturechange', (e) => e.preventDefault());
        this.element.addEventListener('gestureend', (e) => e.preventDefault());
        
        console.log('✅ Mobile gesture handler initialized');
    }

    /**
     * 处理触摸开始
     */
    handleTouchStart(event) {
        this.touches = Array.from(event.touches);
        
        if (this.touches.length === 1) {
            // 单指触摸 - 可能是平移或双击
            const touch = this.touches[0];
            this.lastTouchCenter = { x: touch.clientX, y: touch.clientY };
            
            // 检测双击
            if (this.options.enableDoubleTap) {
                this.detectDoubleTap(touch);
            }
        } else if (this.touches.length === 2) {
            // 双指触摸 - 缩放和平移
            event.preventDefault();
            this.isGesturing = true;
            
            this.lastTouchDistance = this.getTouchDistance(this.touches);
            this.lastTouchCenter = this.getTouchCenter(this.touches);
        }
    }

    /**
     * 处理触摸移动
     */
    handleTouchMove(event) {
        this.touches = Array.from(event.touches);
        
        if (this.touches.length === 1 && this.options.enablePan && !this.isGesturing) {
            // 单指平移
            event.preventDefault();
            const touch = this.touches[0];
            const deltaX = touch.clientX - this.lastTouchCenter.x;
            const deltaY = touch.clientY - this.lastTouchCenter.y;
            
            this.translateX += deltaX;
            this.translateY += deltaY;
            
            this.lastTouchCenter = { x: touch.clientX, y: touch.clientY };
            
            this.onPan({
                deltaX,
                deltaY,
                translateX: this.translateX,
                translateY: this.translateY
            });
            
            this.applyTransform();
        } else if (this.touches.length === 2 && this.options.enablePinchZoom) {
            // 双指缩放和平移
            event.preventDefault();
            
            const currentDistance = this.getTouchDistance(this.touches);
            const currentCenter = this.getTouchCenter(this.touches);
            
            // 计算缩放
            const scaleChange = currentDistance / this.lastTouchDistance;
            const newScale = this.scale * scaleChange;
            
            // 限制缩放范围
            if (newScale >= this.options.minScale && newScale <= this.options.maxScale) {
                // 计算缩放中心点
                const rect = this.element.getBoundingClientRect();
                const centerX = currentCenter.x - rect.left;
                const centerY = currentCenter.y - rect.top;
                
                // 调整平移以保持缩放中心点不变
                this.translateX = centerX - (centerX - this.translateX) * scaleChange;
                this.translateY = centerY - (centerY - this.translateY) * scaleChange;
                
                this.scale = newScale;
                
                this.onZoom({
                    scale: this.scale,
                    centerX,
                    centerY
                });
            }
            
            // 计算平移
            const deltaX = currentCenter.x - this.lastTouchCenter.x;
            const deltaY = currentCenter.y - this.lastTouchCenter.y;
            
            this.translateX += deltaX;
            this.translateY += deltaY;
            
            this.lastTouchDistance = currentDistance;
            this.lastTouchCenter = currentCenter;
            
            this.applyTransform();
        }
    }

    /**
     * 处理触摸结束
     */
    handleTouchEnd(event) {
        this.touches = Array.from(event.touches);
        
        if (this.touches.length === 0) {
            this.isGesturing = false;
        } else if (this.touches.length === 1) {
            // 从双指变为单指
            const touch = this.touches[0];
            this.lastTouchCenter = { x: touch.clientX, y: touch.clientY };
            this.isGesturing = false;
        }
    }

    /**
     * 检测双击
     */
    detectDoubleTap(touch) {
        const now = Date.now();
        const timeSinceLastTap = now - this.lastTapTime;
        
        if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
            // 双击检测成功
            clearTimeout(this.tapTimeout);
            
            const rect = this.element.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            this.onDoubleTap({ x, y });
            
            // 默认行为：放大或缩小
            if (this.scale > 1) {
                this.resetTransform();
            } else {
                this.zoomTo(2, x, y);
            }
            
            this.lastTapTime = 0;
        } else {
            this.lastTapTime = now;
            
            // 设置超时，如果300ms内没有第二次点击，则视为单击
            this.tapTimeout = setTimeout(() => {
                this.lastTapTime = 0;
            }, 300);
        }
    }

    /**
     * 获取两个触摸点之间的距离
     */
    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 获取触摸点的中心
     */
    getTouchCenter(touches) {
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
        };
    }

    /**
     * 应用变换
     */
    applyTransform() {
        this.element.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
        this.element.style.transformOrigin = '0 0';
    }

    /**
     * 缩放到指定比例
     */
    zoomTo(scale, centerX, centerY) {
        const oldScale = this.scale;
        this.scale = Math.max(this.options.minScale, Math.min(this.options.maxScale, scale));
        
        if (centerX !== undefined && centerY !== undefined) {
            // 调整平移以保持中心点不变
            const scaleChange = this.scale / oldScale;
            this.translateX = centerX - (centerX - this.translateX) * scaleChange;
            this.translateY = centerY - (centerY - this.translateY) * scaleChange;
        }
        
        this.applyTransform();
        
        this.onZoom({
            scale: this.scale,
            centerX,
            centerY
        });
    }

    /**
     * 平移到指定位置
     */
    panTo(x, y, animated = true) {
        if (animated) {
            this.element.style.transition = 'transform 0.3s ease';
        }
        
        this.translateX = x;
        this.translateY = y;
        this.applyTransform();
        
        if (animated) {
            setTimeout(() => {
                this.element.style.transition = '';
            }, 300);
        }
    }

    /**
     * 重置变换
     */
    resetTransform(animated = true) {
        if (animated) {
            this.element.style.transition = 'transform 0.3s ease';
        }
        
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.applyTransform();
        
        if (animated) {
            setTimeout(() => {
                this.element.style.transition = '';
            }, 300);
        }
    }

    /**
     * 获取当前变换状态
     */
    getTransform() {
        return {
            scale: this.scale,
            translateX: this.translateX,
            translateY: this.translateY
        };
    }

    /**
     * 设置变换状态
     */
    setTransform(transform, animated = false) {
        if (animated) {
            this.element.style.transition = 'transform 0.3s ease';
        }
        
        this.scale = transform.scale || this.scale;
        this.translateX = transform.translateX || this.translateX;
        this.translateY = transform.translateY || this.translateY;
        this.applyTransform();
        
        if (animated) {
            setTimeout(() => {
                this.element.style.transition = '';
            }, 300);
        }
    }

    /**
     * 销毁手势处理器
     */
    destroy() {
        this.element.removeEventListener('touchstart', this.handleTouchStart);
        this.element.removeEventListener('touchmove', this.handleTouchMove);
        this.element.removeEventListener('touchend', this.handleTouchEnd);
        this.element.removeEventListener('touchcancel', this.handleTouchEnd);
        
        clearTimeout(this.tapTimeout);
        
        console.log('🗑️ Mobile gesture handler destroyed');
    }
}

/**
 * 检测是否为移动设备
 */
export function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 检测是否为触摸设备
 */
export function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * 获取设备类型
 */
export function getDeviceType() {
    const width = window.innerWidth;
    
    if (width < 480) {
        return 'phone-small';
    } else if (width < 768) {
        return 'phone';
    } else if (width < 1024) {
        return 'tablet';
    } else {
        return 'desktop';
    }
}

/**
 * 检测是否为横屏
 */
export function isLandscape() {
    return window.innerWidth > window.innerHeight;
}
