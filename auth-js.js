// auth.js - Client-side authentication helper
// Include this script in any page where you need to check login status

// Global variable to store login state
let isLoggedIn = false;
let currentUser = null;

// Function to check auth status
async function checkLoginStatus() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        isLoggedIn = data.isLoggedIn;
        currentUser = data.user;
        
        // Apply UI changes based on login status
        updateUI();
        
        return data;
    } catch (error) {
        console.error('Error checking login status:', error);
        return { isLoggedIn: false, user: null };
    }
}

// Function to update UI based on login status
function updateUI() {
    const loginLinks = document.querySelectorAll('.login-link, .login-button');
    const registerLinks = document.querySelectorAll('.register-link, .register-button');
    const logoutLinks = document.querySelectorAll('.logout-link, .logout-button');
    const userMenus = document.querySelectorAll('.user-greeting, .user-menu');
    
    if (isLoggedIn) {
        // Hide login/register links
        loginLinks.forEach(link => link.style.display = 'none');
        registerLinks.forEach(link => link.style.display = 'none');
        
        // Show logout links and user menu
        logoutLinks.forEach(link => link.style.display = 'block');
        userMenus.forEach(menu => {
            menu.style.display = 'block';
            const greeting = menu.querySelector('.greeting');
            if (greeting && currentUser) {
                greeting.textContent = `Welcome, ${currentUser.firstName}!`;
            }
        });
    } else {
        // Show login/register links
        loginLinks.forEach(link => link.style.display = 'block');
        registerLinks.forEach(link => link.style.display = 'block');
        
        // Hide logout links and user menu
        logoutLinks.forEach(link => link.style.display = 'none');
        userMenus.forEach(menu => menu.style.display = 'none');
    }
}

// Check login status when page loads
document.addEventListener('DOMContentLoaded', checkLoginStatus);

// Export functions and variables for use in other scripts
window.auth = {
    isLoggedIn,
    currentUser,
    checkLoginStatus
};
