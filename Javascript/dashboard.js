// dashboard.js - Load and display user's fundraising cards
document.addEventListener('DOMContentLoaded', async function() {
    // First check if user is logged in
    await checkLoginStatus();
    
    // If logged in, load user's funds
    if (window.auth.isLoggedIn) {
        loadUserFunds();
    }
});

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // First check if auth.js is loaded
        if (typeof window.auth === 'undefined') {
            console.error('Auth module not loaded!');
            return;
        }
        
        // Check login status
        const authStatus = await window.auth.checkLoginStatus();
        
        // If logged in, load user's funds
        if (authStatus.isLoggedIn) {
            loadUserFunds();
        } else {
            // Redirect to login if not logged in
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Dashboard initialization error:', error);
    }
});
         
        // Rest of your function...

// Function to load user's fundraising cards
async function loadUserFunds() {

    try {
        const response = await fetch('/api/funds');
        
        if (!response.ok) {
            throw new Error('Failed to load funds');
        }
        
        const data = await response.json();
        
        if (data.funds && data.funds.length > 0) {
            const fundsContainer = document.createElement('div');
            fundsContainer.className = 'funds-container';
            
            // Add header for funds section
            const fundsHeader = document.createElement('h2');
            fundsHeader.textContent = 'Your Fundraising Projects';
            document.querySelector('.container').appendChild(fundsHeader);
            
            // Create and append fund cards
            data.funds.forEach(fund => {
                const card = createFundCard(fund);
                fundsContainer.appendChild(card);
            });
            
            document.querySelector('.container').appendChild(fundsContainer);
        } else {
            // No funds message
            const noFundsMsg = document.createElement('p');
            noFundsMsg.textContent = 'You have not created any fundraising projects yet.';
            document.querySelector('.container').appendChild(noFundsMsg);
        }
    } catch (error) {
        console.error('Error loading funds:', error);
        
        // Display error message
        const errorMsg = document.createElement('p');
        errorMsg.textContent = 'Failed to load your fundraising projects. Please try again later.';
        errorMsg.style.color = 'red';
        document.querySelector('.container').appendChild(errorMsg);
    }
}

// Function to create a fund card element
function createFundCard(fund) {
    // Create the card div
    const card = document.createElement('div');
    card.className = 'card';

    // Create the image element
    const img = document.createElement('img');
    img.src = '/Imagini/Fund_Raising1.jpg';
    img.alt = 'Raise funding';

    // Create the loading bar container
    const loadingBar = document.createElement('div');
    loadingBar.className = 'loading-bar';

    // Create the progress bar
    const progress = document.createElement('div');
    progress.className = 'progress';
    progress.style.width = '0%'; // Start at 0%

    // Create the progress text
    const progressText = document.createElement('div');
    progressText.className = 'progress-text';
    progressText.innerHTML = `<b>0%</b>`;

    // Create a div to display the fund data
    const infoDiv = document.createElement('div');
    infoDiv.className = 'info';
    infoDiv.innerHTML = `
        <h3>${fund.title}</h3>
        <p><strong>Email:</strong> ${fund.email}</p>
        <p><strong>Card Info:</strong> ${fund.cardInfo}</p>
        <p><strong>Amount Goal:</strong> $${fund.amount}</p>
        <p><strong>Description:</strong> ${fund.description}</p>
        <p><strong>Created:</strong> ${new Date(fund.createdAt).toLocaleDateString()}</p>
    `;

    // Append elements to their respective parents
    progress.appendChild(progressText);
    loadingBar.appendChild(progress);
    card.appendChild(img);
    card.appendChild(loadingBar);
    card.appendChild(infoDiv);

    return card;
}