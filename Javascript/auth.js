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
    // Elements to hide when logged in
    const loginLinks = document.querySelectorAll('a[href="login.html"]');
    const registerLinks = document.querySelectorAll('a[href="register.html"]');
    
    // Elements to show only when logged in
    const logoutButtons = document.querySelectorAll('.logout-button');
    const dashboardLinks = document.querySelectorAll('a[href="dashboard.html"]');
    const createFundButton = document.querySelector('.button');
    const userMenus = document.querySelectorAll('.user-menu');
    
    if (isLoggedIn) {
        // Hide login/register links everywhere including dropdown
        loginLinks.forEach(link => {
            link.style.display = 'none';
        });
        
        registerLinks.forEach(link => {
            link.style.display = 'none';
        });
        
        // Show logout buttons, dashboard links, and create fund button
        logoutButtons.forEach(button => button.style.display = 'block');
        dashboardLinks.forEach(link => {
            link.style.display = 'block';
        });
        
        if (createFundButton) {
            createFundButton.style.display = 'block';
        }
        
        userMenus.forEach(menu => {
            menu.style.display = 'flex';
            const greeting = menu.querySelector('#welcome-message');
            if (greeting && currentUser) {
                greeting.textContent = `Welcome, ${currentUser.firstName}!`;
            }
        });
    } else {
        // Show login/register links
        loginLinks.forEach(link => {
            link.style.display = 'block';
        });
        
        registerLinks.forEach(link => {
            link.style.display = 'block';
        });
        
        // Hide logout buttons, dashboard links, and create fund button
        logoutButtons.forEach(button => button.style.display = 'none');
        dashboardLinks.forEach(link => {
            // Only show Dashboard in dropdown for logged-in users
            link.style.display = 'none';
        });
        
        if (createFundButton) {
            createFundButton.style.display = 'none';
        }
        
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