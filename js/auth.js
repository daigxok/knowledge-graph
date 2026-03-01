/**
 * Authentication Page Script
 * Handles login and registration forms
 */

import { auth } from './modules/Auth.js';

// Check if already logged in
if (auth.isAuthenticated()) {
    window.location.href = 'index.html';
}

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginTab = document.querySelector('[data-tab="login"]');
const registerTab = document.querySelector('[data-tab="register"]');
const notificationToast = document.getElementById('notificationToast');
const notificationMessage = document.getElementById('notificationMessage');

// Tab Switching
loginTab.addEventListener('click', () => switchTab('login'));
registerTab.addEventListener('click', () => switchTab('register'));

// Switch tab links
document.querySelectorAll('[data-switch]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-switch');
        switchTab(tab);
    });
});

function switchTab(tab) {
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    }
}

// Login Form Submit
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    const result = auth.login(username, password, rememberMe);
    
    if (result.success) {
        showNotification(result.message, 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        showNotification(result.message, 'error');
    }
});


// Register Form Submit
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const email = document.getElementById('registerEmail').value.trim();
    const role = document.querySelector('input[name="role"]:checked').value;
    
    // Validate password confirmation
    if (password !== passwordConfirm) {
        showNotification('两次输入的密码不一致', 'error');
        return;
    }
    
    const result = auth.register(username, password, email, role);
    
    if (result.success) {
        showNotification(result.message, 'success');
        // Auto login after registration
        setTimeout(() => {
            auth.login(username, password, false);
            window.location.href = 'index.html';
        }, 1000);
    } else {
        showNotification(result.message, 'error');
    }
});

// Show Notification
function showNotification(message, type = 'info') {
    notificationMessage.textContent = message;
    notificationToast.className = 'notification-toast show ' + type;
    
    setTimeout(() => {
        notificationToast.classList.remove('show');
    }, 3000);
}

// Input validation feedback
const inputs = document.querySelectorAll('input[required]');
inputs.forEach(input => {
    input.addEventListener('blur', () => {
        if (input.value.trim() === '') {
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });
    
    input.addEventListener('input', () => {
        input.classList.remove('error');
    });
});

// Role selection change handler - update username hint
const roleInputs = document.querySelectorAll('input[name="role"]');
const usernameHint = document.getElementById('usernameHint');
const usernameInput = document.getElementById('registerUsername');

roleInputs.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'teacher') {
            usernameHint.textContent = '教师账号需要审核，如注册失败请联系：15805295231';
            usernameHint.style.color = '#3498db';
            usernameInput.placeholder = '请输入用户名（3-20个字符）';
        } else {
            usernameHint.textContent = '用户名长度为3-20个字符';
            usernameHint.style.color = '';
            usernameInput.placeholder = '请输入用户名（3-20个字符）';
        }
    });
});
