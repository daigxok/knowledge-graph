/**
 * LanguageManager - Multi-language Support Module
 * 
 * Features:
 * - Language switching (Chinese/English)
 * - Content internationalization
 * - Language auto-detection
 * - Persistent language preference
 * - Dynamic UI translation
 * 
 * Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6
 */

import { translations } from '../i18n/translations.js';

export class LanguageManager {
  constructor() {
    this.currentLanguage = 'zh'; // Default language
    this.translations = translations;
    this.listeners = [];
    
    // Initialize language from localStorage or browser
    this.initialize();
  }
  
  /**
   * Initialize language manager
   * Requirement 19.4, 19.5
   */
  initialize() {
    // Try to load saved language preference
    const savedLanguage = localStorage.getItem('preferredLanguage');
    
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      this.currentLanguage = savedLanguage;
    } else {
      // Auto-detect browser language (Requirement 19.5)
      this.currentLanguage = this.detectBrowserLanguage();
    }
    
    // Apply initial language
    this.applyLanguage(this.currentLanguage);
  }
  
  /**
   * Detect browser language
   * Requirement 19.5
   * @returns {string} 'zh' or 'en'
   */
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    
    // Check if browser language is Chinese
    if (browserLang.startsWith('zh')) {
      return 'zh';
    }
    
    // Default to English for other languages
    return 'en';
  }
  
  /**
   * Get current language
   * @returns {string} Current language code
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }
  
  /**
   * Switch language
   * Requirements 19.1, 19.4
   * @param {string} language - Language code ('zh' or 'en')
   */
  switchLanguage(language) {
    if (language !== 'zh' && language !== 'en') {
      console.error('Invalid language:', language);
      return;
    }
    
    if (language === this.currentLanguage) {
      return; // No change needed
    }
    
    this.currentLanguage = language;
    
    // Save preference (Requirement 19.4)
    localStorage.setItem('preferredLanguage', language);
    
    // Apply language to UI
    this.applyLanguage(language);
    
    // Notify listeners
    this.notifyListeners(language);
  }
  
  /**
   * Apply language to UI
   * Requirement 19.1, 19.2, 19.3
   * @param {string} language - Language code
   */
  applyLanguage(language) {
    // Update HTML lang attribute
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    
    // Update all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.translate(key, language);
      
      if (translation) {
        // Update text content or placeholder
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          if (element.hasAttribute('placeholder')) {
            element.placeholder = translation;
          } else {
            element.value = translation;
          }
        } else {
          element.textContent = translation;
        }
      }
    });
    
    // Update title
    const titleKey = 'app.title';
    document.title = this.translate(titleKey, language);
  }
  
  /**
   * Translate a key
   * Requirement 19.2, 19.3
   * @param {string} key - Translation key
   * @param {string} [language] - Language code (defaults to current)
   * @returns {string} Translated text
   */
  translate(key, language = this.currentLanguage) {
    const lang = this.translations[language];
    
    if (!lang) {
      console.warn('Language not found:', language);
      return key;
    }
    
    const translation = lang[key];
    
    if (!translation) {
      console.warn('Translation not found:', key, 'in', language);
      return key;
    }
    
    return translation;
  }
  
  /**
   * Get node name in current language
   * Requirement 19.2
   * @param {Object} node - Node object with name and nameEn
   * @returns {string} Node name in current language
   */
  getNodeName(node) {
    if (!node) return '';
    
    if (this.currentLanguage === 'en' && node.nameEn) {
      return node.nameEn;
    }
    
    return node.name || node.nameEn || '';
  }
  
  /**
   * Get node description in current language
   * Requirement 19.3
   * @param {Object} node - Node object with description and descriptionEn
   * @returns {string} Node description in current language
   */
  getNodeDescription(node) {
    if (!node) return '';
    
    if (this.currentLanguage === 'en' && node.descriptionEn) {
      return node.descriptionEn;
    }
    
    return node.description || node.descriptionEn || '';
  }
  
  /**
   * Get domain name in current language
   * @param {string} domainId - Domain ID (e.g., 'domain-1')
   * @returns {string} Domain name
   */
  getDomainName(domainId) {
    const domainNumber = domainId.replace('domain-', '');
    return this.translate(`domain.${domainNumber}`);
  }
  
  /**
   * Get domain description in current language
   * @param {string} domainId - Domain ID
   * @returns {string} Domain description
   */
  getDomainDescription(domainId) {
    const domainNumber = domainId.replace('domain-', '');
    return this.translate(`domain.${domainNumber}.desc`);
  }
  
  /**
   * Register language change listener
   * @param {Function} callback - Callback function(language)
   */
  onLanguageChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }
  
  /**
   * Unregister language change listener
   * @param {Function} callback - Callback function to remove
   */
  offLanguageChange(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }
  
  /**
   * Notify all listeners of language change
   * @param {string} language - New language
   */
  notifyListeners(language) {
    this.listeners.forEach(callback => {
      try {
        callback(language);
      } catch (error) {
        console.error('Error in language change listener:', error);
      }
    });
  }
  
  /**
   * Format number according to locale
   * @param {number} number - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(number) {
    const locale = this.currentLanguage === 'zh' ? 'zh-CN' : 'en-US';
    return new Intl.NumberFormat(locale).format(number);
  }
  
  /**
   * Format date according to locale
   * @param {Date} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate(date) {
    const locale = this.currentLanguage === 'zh' ? 'zh-CN' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }
  
  /**
   * Get all available languages
   * @returns {Array} Array of language objects
   */
  getAvailableLanguages() {
    return [
      { code: 'zh', name: '中文', nativeName: '中文' },
      { code: 'en', name: 'English', nativeName: 'English' }
    ];
  }
  
  /**
   * Check if a language is supported
   * @param {string} language - Language code
   * @returns {boolean} True if supported
   */
  isLanguageSupported(language) {
    return language === 'zh' || language === 'en';
  }
}

// Export singleton instance
export const languageManager = new LanguageManager();
