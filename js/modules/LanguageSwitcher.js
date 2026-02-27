/**
 * LanguageSwitcher - UI Component for Language Selection
 * 
 * Features:
 * - Language toggle button
 * - Visual language indicator
 * - Smooth transitions
 * - Accessibility support
 * 
 * Requirements: 19.1
 */

import { languageManager } from './LanguageManager.js';

export class LanguageSwitcher {
  constructor(containerId = 'languageSwitcher') {
    this.containerId = containerId;
    this.container = null;
    
    this.initialize();
  }
  
  /**
   * Initialize language switcher
   */
  initialize() {
    this.createSwitcher();
    this.attachEventListeners();
    
    // Listen for language changes from other sources
    languageManager.onLanguageChange((language) => {
      this.updateUI(language);
    });
  }
  
  /**
   * Create language switcher UI
   */
  createSwitcher() {
    // Find or create container
    this.container = document.getElementById(this.containerId);
    
    if (!this.container) {
      // Create container in header
      const header = document.querySelector('.app-header .header-content');
      if (header) {
        this.container = document.createElement('div');
        this.container.id = this.containerId;
        this.container.className = 'language-switcher';
        header.appendChild(this.container);
      } else {
        console.error('Cannot find header to add language switcher');
        return;
      }
    }
    
    // Create switcher HTML
    const currentLang = languageManager.getCurrentLanguage();
    
    this.container.innerHTML = `
      <button 
        class="language-switcher-btn" 
        id="languageSwitcherBtn"
        aria-label="${languageManager.translate('language.switch')}"
        title="${languageManager.translate('language.switch')}"
      >
        <span class="language-icon">🌐</span>
        <span class="language-text">${currentLang === 'zh' ? '中文' : 'EN'}</span>
      </button>
      <div class="language-dropdown" id="languageDropdown" role="menu" aria-hidden="true">
        <button 
          class="language-option ${currentLang === 'zh' ? 'active' : ''}" 
          data-lang="zh"
          role="menuitem"
        >
          <span class="language-option-icon">🇨🇳</span>
          <span class="language-option-text">中文</span>
          ${currentLang === 'zh' ? '<span class="language-option-check">✓</span>' : ''}
        </button>
        <button 
          class="language-option ${currentLang === 'en' ? 'active' : ''}" 
          data-lang="en"
          role="menuitem"
        >
          <span class="language-option-icon">🇬🇧</span>
          <span class="language-option-text">English</span>
          ${currentLang === 'en' ? '<span class="language-option-check">✓</span>' : ''}
        </button>
      </div>
    `;
  }
  
  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const btn = document.getElementById('languageSwitcherBtn');
    const dropdown = document.getElementById('languageDropdown');
    
    if (!btn || !dropdown) return;
    
    // Toggle dropdown
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });
    
    // Language option clicks
    const options = dropdown.querySelectorAll('.language-option');
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = option.getAttribute('data-lang');
        this.switchLanguage(lang);
      });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      this.closeDropdown();
    });
    
    // Keyboard navigation
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleDropdown();
      }
    });
    
    dropdown.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDropdown();
        btn.focus();
      }
    });
  }
  
  /**
   * Toggle dropdown visibility
   */
  toggleDropdown() {
    const dropdown = document.getElementById('languageDropdown');
    if (!dropdown) return;
    
    const isHidden = dropdown.getAttribute('aria-hidden') === 'true';
    
    if (isHidden) {
      this.openDropdown();
    } else {
      this.closeDropdown();
    }
  }
  
  /**
   * Open dropdown
   */
  openDropdown() {
    const dropdown = document.getElementById('languageDropdown');
    if (!dropdown) return;
    
    dropdown.setAttribute('aria-hidden', 'false');
    dropdown.classList.add('open');
    
    // Focus first option
    const firstOption = dropdown.querySelector('.language-option');
    if (firstOption) {
      firstOption.focus();
    }
  }
  
  /**
   * Close dropdown
   */
  closeDropdown() {
    const dropdown = document.getElementById('languageDropdown');
    if (!dropdown) return;
    
    dropdown.setAttribute('aria-hidden', 'true');
    dropdown.classList.remove('open');
  }
  
  /**
   * Switch language
   * @param {string} language - Language code
   */
  switchLanguage(language) {
    languageManager.switchLanguage(language);
    this.closeDropdown();
    
    // Show notification
    this.showNotification(languageManager.translate('notification.languageChanged'));
  }
  
  /**
   * Update UI after language change
   * @param {string} language - New language
   */
  updateUI(language) {
    const btn = document.getElementById('languageSwitcherBtn');
    const dropdown = document.getElementById('languageDropdown');
    
    if (!btn || !dropdown) return;
    
    // Update button text
    const langText = btn.querySelector('.language-text');
    if (langText) {
      langText.textContent = language === 'zh' ? '中文' : 'EN';
    }
    
    // Update button aria-label
    btn.setAttribute('aria-label', languageManager.translate('language.switch'));
    btn.setAttribute('title', languageManager.translate('language.switch'));
    
    // Update active state
    const options = dropdown.querySelectorAll('.language-option');
    options.forEach(option => {
      const lang = option.getAttribute('data-lang');
      const isActive = lang === language;
      
      option.classList.toggle('active', isActive);
      
      // Update check mark
      const check = option.querySelector('.language-option-check');
      if (isActive && !check) {
        const checkSpan = document.createElement('span');
        checkSpan.className = 'language-option-check';
        checkSpan.textContent = '✓';
        option.appendChild(checkSpan);
      } else if (!isActive && check) {
        check.remove();
      }
    });
  }
  
  /**
   * Show notification
   * @param {string} message - Notification message
   */
  showNotification(message) {
    const toast = document.getElementById('notificationToast');
    const messageEl = document.getElementById('notificationMessage');
    
    if (toast && messageEl) {
      messageEl.textContent = message;
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
  }
  
  /**
   * Destroy language switcher
   */
  destroy() {
    if (this.container) {
      this.container.remove();
    }
  }
}
