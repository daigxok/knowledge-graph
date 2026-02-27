/**
 * LearningDataManager
 * Collects real learning behavior data on-device (localStorage) with versioned schema.
 *
 * Design goals:
 * - Lightweight: no backend required
 * - Privacy: stored locally by default
 * - Useful for analysis: events + aggregates (time/visits)
 * - Safe: storage size caps and graceful degradation
 */
export class LearningDataManager {
    /**
     * @param {Object} [options]
     * @param {string} [options.storageKey] localStorage key
     * @param {number} [options.maxEvents] max events kept
     * @param {number} [options.maxSessions] max sessions kept
     */
    constructor(options = {}) {
        this.schemaVersion = 1;
        this.storageKey = options.storageKey || 'math_knowledge_graph_learning_data_v1';
        this.maxEvents = Number.isFinite(options.maxEvents) ? options.maxEvents : 2000;
        this.maxSessions = Number.isFinite(options.maxSessions) ? options.maxSessions : 80;

        this.data = this._loadOrInit();

        this.sessionId = this._createId('sess');
        this.sessionStartAt = Date.now();

        this._activeNodeId = null;
        this._activeNodeStartAt = null;
        this._activeSkillName = null;
        this._activeSkillStartAt = null;

        this._addSession();
        this.logEvent('session_start', {
            page: location && location.pathname ? location.pathname : '',
            referrer: document && document.referrer ? document.referrer : ''
        });

        this._bindLifecycle();
    }

    /**
     * Log an event with timestamp and sessionId.
     * @param {string} type
     * @param {Object} [payload]
     */
    logEvent(type, payload = {}) {
        try {
            const ev = {
                t: Date.now(),
                type,
                sessionId: this.sessionId,
                ...payload
            };
            this.data.events.push(ev);
            if (this.data.events.length > this.maxEvents) {
                this.data.events.splice(0, this.data.events.length - this.maxEvents);
            }
            this.data.updatedAt = new Date().toISOString();
            this._save();
        } catch (e) {
            // If storage is full or blocked, fail silently.
            console.warn('LearningDataManager logEvent failed:', e);
        }
    }

    /**
     * Mark a node as "entered" (selected). Will automatically close previous node timing.
     * @param {string} nodeId
     * @param {Object} [meta]
     */
    enterNode(nodeId, meta = {}) {
        if (!nodeId) return;
        this._closeActiveNode();
        this._activeNodeId = nodeId;
        this._activeNodeStartAt = Date.now();

        const s = this._ensureNodeAgg(nodeId);
        s.visits += 1;
        s.lastSeenAt = new Date().toISOString();
        if (meta.domainIds) s.domainIds = meta.domainIds;
        if (meta.nodeType) s.nodeType = meta.nodeType;
        this._save();

        this.logEvent('node_select', { nodeId, ...meta });
    }

    /**
     * Mark a skill as "opened". Will automatically close previous skill timing.
     * @param {string} skillName
     * @param {Object} [meta]
     */
    openSkill(skillName, meta = {}) {
        if (!skillName) return;
        this._closeActiveSkill();
        this._activeSkillName = skillName;
        this._activeSkillStartAt = Date.now();

        const s = this._ensureSkillAgg(skillName);
        s.opens += 1;
        s.lastOpenAt = new Date().toISOString();
        if (meta.phase2 === true) s.phase2Opens += 1;
        if (meta.nodeId) s.lastNodeId = meta.nodeId;
        this._save();

        this.logEvent('skill_open', { skillName, ...meta });
    }

    /**
     * Close current skill timing and log close event.
     * @param {Object} [meta]
     */
    closeSkillPanel(meta = {}) {
        this._closeActiveSkill();
        this.logEvent('skill_panel_close', { ...meta });
    }

    /**
     * Track opening a Phase2 details item (exercise/project).
     * @param {'exercise'|'project'} itemType
     * @param {string} itemId
     * @param {Object} [meta]
     */
    openPhase2Item(itemType, itemId, meta = {}) {
        if (!itemType || !itemId) return;
        const s = this._ensurePhase2Agg();
        if (itemType === 'exercise') s.exerciseOpens += 1;
        if (itemType === 'project') s.projectOpens += 1;
        s.lastOpenAt = new Date().toISOString();
        this._save();
        this.logEvent('phase2_item_open', { itemType, itemId, ...meta });
    }

    /**
     * Export full learning data as JSON string.
     * @returns {string}
     */
    exportJSON() {
        return JSON.stringify(this.data, null, 2);
    }

    /**
     * Trigger a download of learning data JSON.
     * @param {string} [filename]
     */
    downloadJSON(filename = 'learning-data.json') {
        const blob = new Blob([this.exportJSON()], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2500);
    }

    /**
     * Reset all learning data (keeps a reset event).
     */
    resetAll() {
        const previous = this.data;
        this.data = this._initData();
        this._save();
        this.logEvent('data_reset', {
            previousCreatedAt: previous.createdAt,
            previousUpdatedAt: previous.updatedAt
        });
    }

    /**
     * End current session and flush timing.
     */
    endSession() {
        this._closeActiveSkill();
        this._closeActiveNode();
        this._updateSessionEnd();
        this.logEvent('session_end', { durationMs: Date.now() - this.sessionStartAt });
    }

    // ----------------- Internals -----------------

    _bindLifecycle() {
        window.addEventListener('beforeunload', () => {
            try { this.endSession(); } catch (_) {}
        });
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.logEvent('page_hidden');
                this._save();
            } else {
                this.logEvent('page_visible');
            }
        });
    }

    _initData() {
        return {
            schemaVersion: this.schemaVersion,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sessions: [],
            events: [],
            aggregates: {
                nodes: {},
                skills: {},
                phase2: {
                    exerciseOpens: 0,
                    projectOpens: 0,
                    lastOpenAt: null
                }
            }
        };
    }

    _loadOrInit() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return this._initData();
            const parsed = JSON.parse(raw);
            if (!parsed || parsed.schemaVersion !== this.schemaVersion) {
                return this._initData();
            }
            // minimal shape guard
            parsed.sessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
            parsed.events = Array.isArray(parsed.events) ? parsed.events : [];
            parsed.aggregates = parsed.aggregates || { nodes: {}, skills: {}, phase2: { exerciseOpens: 0, projectOpens: 0, lastOpenAt: null } };
            parsed.aggregates.nodes = parsed.aggregates.nodes || {};
            parsed.aggregates.skills = parsed.aggregates.skills || {};
            parsed.aggregates.phase2 = parsed.aggregates.phase2 || { exerciseOpens: 0, projectOpens: 0, lastOpenAt: null };
            return parsed;
        } catch (e) {
            console.warn('LearningDataManager load failed, re-init:', e);
            return this._initData();
        }
    }

    _save() {
        try {
            const json = JSON.stringify(this.data);
            // avoid bloating localStorage too much
            if (json.length > 900 * 1024) {
                // aggressive trim events
                const keep = Math.min(this.maxEvents, 800);
                if (this.data.events.length > keep) {
                    this.data.events = this.data.events.slice(-keep);
                }
            }
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            // Quota exceeded: trim and retry once
            if (e && e.name === 'QuotaExceededError') {
                try {
                    this.data.events = this.data.events.slice(-500);
                    this.data.sessions = this.data.sessions.slice(-20);
                    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
                } catch (e2) {
                    console.warn('LearningDataManager save failed after trim:', e2);
                }
            } else {
                console.warn('LearningDataManager save failed:', e);
            }
        }
    }

    _addSession() {
        const s = {
            id: this.sessionId,
            startAt: new Date(this.sessionStartAt).toISOString(),
            endAt: null,
            timezoneOffsetMinutes: new Date().getTimezoneOffset(),
            userAgent: navigator && navigator.userAgent ? navigator.userAgent : ''
        };
        this.data.sessions.push(s);
        if (this.data.sessions.length > this.maxSessions) {
            this.data.sessions.splice(0, this.data.sessions.length - this.maxSessions);
        }
        this._save();
    }

    _updateSessionEnd() {
        const s = this.data.sessions.find(x => x.id === this.sessionId);
        if (s) s.endAt = new Date().toISOString();
        this._save();
    }

    _ensureNodeAgg(nodeId) {
        const nodes = this.data.aggregates.nodes;
        if (!nodes[nodeId]) {
            nodes[nodeId] = {
                visits: 0,
                totalTimeMs: 0,
                lastSeenAt: null,
                domainIds: null,
                nodeType: null
            };
        }
        return nodes[nodeId];
    }

    _ensureSkillAgg(skillName) {
        const skills = this.data.aggregates.skills;
        if (!skills[skillName]) {
            skills[skillName] = {
                opens: 0,
                totalTimeMs: 0,
                lastOpenAt: null,
                phase2Opens: 0,
                lastNodeId: null
            };
        }
        return skills[skillName];
    }

    _ensurePhase2Agg() {
        const p = this.data.aggregates.phase2;
        if (!p) {
            this.data.aggregates.phase2 = { exerciseOpens: 0, projectOpens: 0, lastOpenAt: null };
        }
        return this.data.aggregates.phase2;
    }

    _closeActiveNode() {
        if (!this._activeNodeId || !this._activeNodeStartAt) return;
        const delta = Date.now() - this._activeNodeStartAt;
        const agg = this._ensureNodeAgg(this._activeNodeId);
        agg.totalTimeMs += Math.max(0, delta);
        this.logEvent('node_leave', { nodeId: this._activeNodeId, durationMs: delta });
        this._activeNodeId = null;
        this._activeNodeStartAt = null;
        this._save();
    }

    _closeActiveSkill() {
        if (!this._activeSkillName || !this._activeSkillStartAt) return;
        const delta = Date.now() - this._activeSkillStartAt;
        const agg = this._ensureSkillAgg(this._activeSkillName);
        agg.totalTimeMs += Math.max(0, delta);
        this.logEvent('skill_leave', { skillName: this._activeSkillName, durationMs: delta });
        this._activeSkillName = null;
        this._activeSkillStartAt = null;
        this._save();
    }

    _createId(prefix) {
        const rnd = Math.random().toString(16).slice(2, 10);
        return `${prefix}-${Date.now().toString(16)}-${rnd}`;
    }
}

