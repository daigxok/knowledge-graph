/**
 * DomainDataManager
 * Manages the 5 domain definitions and their metadata
 */

export class DomainDataManager {
    constructor(domainData) {
        this.domains = domainData.domains || [];
        this.traditionalChapters = domainData.traditionalChapters || [];
        this.domainMap = new Map();
        this.chapterMap = new Map();
        
        this._buildMaps();
    }

    /**
     * Build internal maps for fast lookup
     */
    _buildMaps() {
        this.domains.forEach(domain => {
            this.domainMap.set(domain.id, domain);
        });
        
        this.traditionalChapters.forEach(chapter => {
            this.chapterMap.set(chapter.id, chapter);
        });
    }

    /**
     * Get all domains
     * @returns {Array} Array of domain objects
     */
    getAllDomains() {
        return this.domains;
    }

    /**
     * Get domain by ID
     * @param {string} domainId - Domain identifier
     * @returns {Object|null} Domain object or null if not found
     */
    getDomainById(domainId) {
        return this.domainMap.get(domainId) || null;
    }

    /**
     * Get real-world scenarios for a domain
     * @param {string} domainId - Domain identifier
     * @returns {Array} Array of scenario objects
     */
    getScenariosByDomain(domainId) {
        const domain = this.getDomainById(domainId);
        return domain ? domain.realWorldScenarios : [];
    }

    /**
     * Get all traditional chapters
     * @returns {Array} Array of chapter objects
     */
    getAllChapters() {
        return this.traditionalChapters;
    }

    /**
     * Get chapter by ID
     * @param {string} chapterId - Chapter identifier
     * @returns {Object|null} Chapter object or null if not found
     */
    getChapterById(chapterId) {
        return this.chapterMap.get(chapterId) || null;
    }

    /**
     * Get domains for a chapter
     * @param {string} chapterId - Chapter identifier
     * @returns {Array} Array of domain IDs
     */
    getDomainsByChapter(chapterId) {
        const chapter = this.getChapterById(chapterId);
        return chapter ? chapter.domains : [];
    }

    /**
     * Get domain color
     * @param {string} domainId - Domain identifier
     * @returns {string} Color hex code
     */
    getDomainColor(domainId) {
        const domain = this.getDomainById(domainId);
        return domain ? domain.color : '#999999';
    }

    /**
     * Get domain icon
     * @param {string} domainId - Domain identifier
     * @returns {string} Icon emoji
     */
    getDomainIcon(domainId) {
        const domain = this.getDomainById(domainId);
        return domain ? domain.icon : '📊';
    }
}
