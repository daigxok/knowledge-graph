/**
 * OnboardingGuide - Interactive Onboarding System
 * 
 * Features:
 * - Welcome message for first-time visitors
 * - Step-by-step feature introduction
 * - UI element highlighting
 * - Skip and replay support
 * 
 * Requirements: 20.6, 20.7
 */

export class OnboardingGuide {
  constructor() {
    this.currentStep = 0;
    this.isActive = false;
    this.hasSeenGuide = localStorage.getItem('hasSeenOnboarding') === 'true';
    
    // Define onboarding steps
    this.steps = [
      {
        target: '.app-header',
        title: '欢迎使用 Phase 2 知识图谱系统！',
        titleEn: 'Welcome to Phase 2 Knowledge Graph System!',
        content: '我们为您准备了150个数学知识节点、5种专业可视化和完整的移动端支持。让我们快速了解主要功能。',
        contentEn: 'We have prepared 150 math nodes, 5 professional visualizations, and complete mobile support. Let\'s explore the main features.',
        position: 'bottom'
      },
      {
        target: '#languageSwitcher',
        title: '多语言支持',
        titleEn: 'Multi-language Support',
        content: '点击这里可以在中文和English之间切换。系统会记住您的选择。',
        contentEn: 'Click here to switch between Chinese and English. The system will remember your choice.',
        position: 'bottom'
      },
      {
        target: '#searchInput',
        title: '搜索功能',
        titleEn: 'Search Function',
        content: '在这里输入关键词搜索节点。支持中英文名称、描述和关键词搜索。',
        contentEn: 'Enter keywords here to search nodes. Supports Chinese/English names, descriptions, and keywords.',
        position: 'bottom'
      },
      {
        target: '#domainFilters',
        title: '学域筛选',
        titleEn: 'Domain Filter',
        content: '按五大学域筛选节点：变化与逼近、结构与累积、优化与决策、不确定性处理、真实问题建模。',
        contentEn: 'Filter nodes by five domains: Change & Approximation, Structure & Accumulation, Optimization & Decision, Uncertainty Handling, Real-World Modeling.',
        position: 'right'
      },
      {
        target: '#graphCanvas',
        title: '知识图谱',
        titleEn: 'Knowledge Graph',
        content: '这是知识图谱主视图。点击节点查看详情，拖动平移，滚轮缩放。',
        contentEn: 'This is the main knowledge graph view. Click nodes for details, drag to pan, scroll to zoom.',
        position: 'center'
      },
      {
        target: '.zoom-controls',
        title: '视图控制',
        titleEn: 'View Controls',
        content: '使用这些按钮控制视图：放大、缩小、重置、适应画布、跨学域视图。',
        contentEn: 'Use these buttons to control the view: zoom in, zoom out, reset, fit to view, cross-domain view.',
        position: 'left'
      }
    ];
  }
  
  /**
   * Check if should show onboarding
   * @returns {boolean}
   */
  shouldShow() {
    return !this.hasSeenGuide;
  }
  
  /**
   * Start onboarding guide
   */
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.currentStep = 0;
    this.createOverlay();
    this.showStep(0);
  }
  
  /**
   * Create overlay and tooltip elements
   */
  createOverlay() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'onboardingOverlay';
    overlay.className = 'onboarding-overlay';
    document.body.appendChild(overlay);
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'onboardingTooltip';
    tooltip.className = 'onboarding-tooltip';
    tooltip.innerHTML = `
      <div class="onboarding-tooltip-header">
        <h3 class="onboarding-tooltip-title" id="onboardingTitle"></h3>
        <button class="onboarding-close-btn" id="onboardingClose" aria-label="Close">×</button>
      </div>
      <div class="onboarding-tooltip-content" id="onboardingContent"></div>
      <div class="onboarding-tooltip-footer">
        <div class="onboarding-progress">
          <span id="onboardingProgress">1 / 6</span>
        </div>
        <div class="onboarding-buttons">
          <button class="onboarding-btn onboarding-btn-skip" id="onboardingSkip">跳过</button>
          <button class="onboarding-btn onboarding-btn-prev" id="onboardingPrev">上一步</button>
          <button class="onboarding-btn onboarding-btn-next" id="onboardingNext">下一步</button>
        </div>
      </div>
    `;
    document.body.appendChild(tooltip);
    
    // Attach event listeners
    document.getElementById('onboardingClose').addEventListener('click', () => this.end());
    document.getElementById('onboardingSkip').addEventListener('click', () => this.skip());
    document.getElementById('onboardingPrev').addEventListener('click', () => this.prev());
    document.getElementById('onboardingNext').addEventListener('click', () => this.next());
    
    // Close on overlay click
    overlay.addEventListener('click', () => this.end());
  }
  
  /**
   * Show specific step
   * @param {number} stepIndex
   */
  showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.steps.length) return;
    
    this.currentStep = stepIndex;
    const step = this.steps[stepIndex];
    const currentLang = this.getCurrentLanguage();
    
    // Update tooltip content
    const title = currentLang === 'en' ? (step.titleEn || step.title) : step.title;
    const content = currentLang === 'en' ? (step.contentEn || step.content) : step.content;
    
    document.getElementById('onboardingTitle').textContent = title;
    document.getElementById('onboardingContent').textContent = content;
    document.getElementById('onboardingProgress').textContent = `${stepIndex + 1} / ${this.steps.length}`;
    
    // Update button states
    document.getElementById('onboardingPrev').disabled = stepIndex === 0;
    const nextBtn = document.getElementById('onboardingNext');
    if (stepIndex === this.steps.length - 1) {
      nextBtn.textContent = currentLang === 'en' ? 'Finish' : '完成';
    } else {
      nextBtn.textContent = currentLang === 'en' ? 'Next' : '下一步';
    }
    
    // Highlight target element
    this.highlightElement(step.target);
    
    // Position tooltip
    this.positionTooltip(step.target, step.position);
  }
  
  /**
   * Highlight target element
   * @param {string} selector
   */
  highlightElement(selector) {
    // Remove previous highlights
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });
    
    // Add highlight to target
    const target = document.querySelector(selector);
    if (target) {
      target.classList.add('onboarding-highlight');
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  /**
   * Position tooltip relative to target
   * @param {string} selector
   * @param {string} position
   */
  positionTooltip(selector, position) {
    const tooltip = document.getElementById('onboardingTooltip');
    const target = document.querySelector(selector);
    
    if (!target) {
      tooltip.style.top = '50%';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translate(-50%, -50%)';
      return;
    }
    
    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let top, left;
    
    switch (position) {
      case 'top':
        top = rect.top - tooltipRect.height - 20;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = rect.bottom + 20;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.left - tooltipRect.width - 20;
        break;
      case 'right':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.right + 20;
        break;
      case 'center':
      default:
        top = window.innerHeight / 2 - tooltipRect.height / 2;
        left = window.innerWidth / 2 - tooltipRect.width / 2;
        break;
    }
    
    // Ensure tooltip stays within viewport
    top = Math.max(20, Math.min(top, window.innerHeight - tooltipRect.height - 20));
    left = Math.max(20, Math.min(left, window.innerWidth - tooltipRect.width - 20));
    
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.transform = 'none';
  }
  
  /**
   * Go to next step
   */
  next() {
    if (this.currentStep < this.steps.length - 1) {
      this.showStep(this.currentStep + 1);
    } else {
      this.finish();
    }
  }
  
  /**
   * Go to previous step
   */
  prev() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }
  
  /**
   * Skip onboarding
   */
  skip() {
    this.finish();
  }
  
  /**
   * Finish onboarding
   */
  finish() {
    localStorage.setItem('hasSeenOnboarding', 'true');
    this.hasSeenGuide = true;
    this.end();
  }
  
  /**
   * End onboarding (without marking as seen)
   */
  end() {
    this.isActive = false;
    
    // Remove overlay and tooltip
    const overlay = document.getElementById('onboardingOverlay');
    const tooltip = document.getElementById('onboardingTooltip');
    
    if (overlay) overlay.remove();
    if (tooltip) tooltip.remove();
    
    // Remove highlights
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });
  }
  
  /**
   * Reset onboarding (for testing or replay)
   */
  reset() {
    localStorage.removeItem('hasSeenOnboarding');
    this.hasSeenGuide = false;
  }
  
  /**
   * Get current language
   * @returns {string}
   */
  getCurrentLanguage() {
    // Try to get from LanguageManager if available
    if (window.languageManager) {
      return window.languageManager.getCurrentLanguage();
    }
    // Fallback to localStorage
    return localStorage.getItem('preferredLanguage') || 'zh';
  }
}

// Export singleton instance
export const onboardingGuide = new OnboardingGuide();
