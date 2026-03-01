/**
 * Auth Module - User Authentication System
 * 
 * Features:
 * - User registration with validation
 * - User login with credential verification
 * - Session management using localStorage
 * - Password hashing (simple for demo purposes)
 * - Remember me functionality
 * 
 * Note: This is a client-side only authentication system
 * suitable for demo/personal use. For production, use
 * server-side authentication with proper security.
 */

export class Auth {
    constructor() {
        this.storageKey = 'kg_users';
        this.sessionKey = 'kg_session';
        this.currentUser = null;
        
        // Initialize from session
        this.loadSession();
    }
    
    /**
     * Simple hash function for passwords (demo only)
     * In production, use proper server-side hashing
     */
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }
    
    /**
     * Get all registered users
     */
    getUsers() {
        const usersJson = localStorage.getItem(this.storageKey);
        return usersJson ? JSON.parse(usersJson) : [];
    }
    
    /**
     * Save users to localStorage
     */
    saveUsers(users) {
        localStorage.setItem(this.storageKey, JSON.stringify(users));
    }
    
    /**
     * Register a new user
     */
    register(username, password, email = '', role = 'student') {
        // Validation
        if (!username || username.length < 3 || username.length > 20) {
            return {
                success: false,
                message: '用户名长度必须为3-20个字符'
            };
        }
        
        if (!password || password.length < 6) {
            return {
                success: false,
                message: '密码长度至少为6个字符'
            };
        }
        
        // Validate role
        if (!['teacher', 'student'].includes(role)) {
            return {
                success: false,
                message: '无效的用户角色'
            };
        }
        
        // Teacher registration restriction: username must start with "Ujs"
        if (role === 'teacher' && !username.startsWith('Ujs')) {
            return {
                success: false,
                message: '教师账号注册需要审核，请联系：15805295231'
            };
        }
        
        // Check if username already exists
        const users = this.getUsers();
        const existingUser = users.find(u => u.username === username);
        
        if (existingUser) {
            return {
                success: false,
                message: '用户名已存在'
            };
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username: username,
            password: this.hashPassword(password),
            email: email,
            role: role,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        
        users.push(newUser);
        this.saveUsers(users);
        
        return {
            success: true,
            message: '注册成功！',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        };
    }
    
    /**
     * Login user
     */
    login(username, password, rememberMe = false) {
        // Validation
        if (!username || !password) {
            return {
                success: false,
                message: '请输入用户名和密码'
            };
        }
        
        // Find user
        const users = this.getUsers();
        const user = users.find(u => u.username === username);
        
        if (!user) {
            return {
                success: false,
                message: '用户名或密码错误'
            };
        }
        
        // Verify password
        const hashedPassword = this.hashPassword(password);
        if (user.password !== hashedPassword) {
            return {
                success: false,
                message: '用户名或密码错误'
            };
        }
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        this.saveUsers(users);
        
        // Create session
        this.currentUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role || 'student'
        };
        
        this.saveSession(rememberMe);
        
        return {
            success: true,
            message: '登录成功！',
            user: this.currentUser
        };
    }

    
    /**
     * Logout user
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem(this.sessionKey);
        sessionStorage.removeItem(this.sessionKey);
    }
    
    /**
     * Save session
     */
    saveSession(persistent = false) {
        const sessionData = {
            user: this.currentUser,
            timestamp: Date.now()
        };
        
        const sessionJson = JSON.stringify(sessionData);
        
        if (persistent) {
            localStorage.setItem(this.sessionKey, sessionJson);
        } else {
            sessionStorage.setItem(this.sessionKey, sessionJson);
        }
    }
    
    /**
     * Load session
     */
    loadSession() {
        // Try sessionStorage first (current session)
        let sessionJson = sessionStorage.getItem(this.sessionKey);
        
        // If not found, try localStorage (remember me)
        if (!sessionJson) {
            sessionJson = localStorage.getItem(this.sessionKey);
        }
        
        if (sessionJson) {
            try {
                const sessionData = JSON.parse(sessionJson);
                
                // Check if session is still valid (24 hours)
                const now = Date.now();
                const sessionAge = now - sessionData.timestamp;
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                
                if (sessionAge < maxAge) {
                    this.currentUser = sessionData.user;
                    return true;
                } else {
                    // Session expired
                    this.logout();
                }
            } catch (error) {
                console.error('Failed to load session:', error);
            }
        }
        
        return false;
    }
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }
    
    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * Require authentication (redirect if not authenticated)
     */
    requireAuth(redirectUrl = 'auth.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    /**
     * Check if current user is a teacher
     */
    isTeacher() {
        return this.currentUser && this.currentUser.role === 'teacher';
    }

    /**
     * Get current user role
     */
    getUserRole() {
        return this.currentUser ? this.currentUser.role : null;
    }

    /**
     * Require teacher role (redirect if not teacher)
     */
    requireTeacher(redirectUrl = 'index.html') {
        if (!this.isAuthenticated()) {
            window.location.href = 'auth.html';
            return false;
        }
        if (!this.isTeacher()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }
}

// Export singleton instance
export const auth = new Auth();
