// Function to fetch all available funds and display them
async function fetchAndDisplayAllFunds() {
  try {
    const response = await fetch('/api/all-funds');
    const data = await response.json();
    
    if (!data.funds || data.funds.length === 0) {
      displayNoFundsMessage();
      return;
    }
    
    displayFunds(data.funds);
  } catch (error) {
    console.error('Error fetching funds:', error);
    displayErrorMessage();
  }
}

// Function to display the funds in the container
function displayFunds(funds) {
  const fundsContainerElement = document.getElementById('funds-container');
  fundsContainerElement.innerHTML = ''; // Clear any existing content
  
  funds.forEach(fund => {
    const card = createFundCard(fund);
    fundsContainerElement.appendChild(card);
  });
}

// Function to create a fund card element (using the same design as dashboard)
function createFundCard(fund) {
  // Create the card div
  const card = document.createElement('div');
  card.className = 'card';

  // Create the image element
  const img = document.createElement('img');
  img.src = '/Imagini/Fund_Raising1.jpg'; // Using the same image as dashboard
  img.alt = 'Raise funding';

  // Create the loading bar container
  const loadingBar = document.createElement('div');
  loadingBar.className = 'loading-bar';

  // Calculate progress percentage (for demo purposes if not available)
  const progressPercentage = fund.progress || Math.floor(Math.random() * 80) + 10;

  // Create the progress bar
  const progress = document.createElement('div');
  progress.className = 'progress';
  progress.style.width = `${progressPercentage}%`;

  // Create the progress text
  const progressText = document.createElement('div');
  progressText.className = 'progress-text';
  progressText.innerHTML = `<b>${progressPercentage}% funded</b>`;

  // Create a div to display the fund data
  const infoDiv = document.createElement('div');
  infoDiv.className = 'info';
  
  // Format the date
  const createdDate = new Date(fund.createdAt).toLocaleDateString();
  
  infoDiv.innerHTML = `
    <h3>${fund.title}</h3>
    <p><strong>Goal:</strong> $${fund.amount}</p>
    <p><strong>Description:</strong> ${fund.description}</p>
    <p><strong>Created:</strong> ${createdDate}</p>
    <button class="donate-button" data-fund-id="${fund.id}">Donate Now</button>
  `;

  // Append elements to their respective parents
  progress.appendChild(progressText);
  loadingBar.appendChild(progress);
  card.appendChild(img);
  card.appendChild(loadingBar);
  card.appendChild(infoDiv);
  
  return card;
}

// Function to display a message when no funds are available
function displayNoFundsMessage() {
  const fundsContainerElement = document.getElementById('funds-container');
  fundsContainerElement.innerHTML = `
    <div class="no-funds-message">
      <h3>No fundraising campaigns yet</h3>
      <p>Be the first to create a fundraising campaign!</p>
    </div>
  `;
}

// Function to display an error message
function displayErrorMessage() {
  const fundsContainerElement = document.getElementById('funds-container');
  fundsContainerElement.innerHTML = `
    <div class="error-message">
      <h3>Oops! Something went wrong</h3>
      <p>We couldn't load the fundraising campaigns. Please try again later.</p>
    </div>
  `;
}

// Function to open donation form modal
function openDonationForm(fundId) {
  // You can implement a donation form modal here
  alert('Donation functionality will be implemented soon for fund ID: ' + fundId);
}

// Add event listeners to donate buttons (moved from displayFunds for better separation)
function addDonateButtonListeners() {
  document.querySelectorAll('.donate-button').forEach(button => {
    button.addEventListener('click', function() {
      const fundId = this.getAttribute('data-fund-id');
      openDonationForm(fundId);
    });
  });
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the index page (has funds-container)
  if (document.getElementById('funds-container')) {
    fetchAndDisplayAllFunds().then(() => {
      addDonateButtonListeners();
    });
  }
});