const btn = document.querySelector('.button');
btn.addEventListener("click", showForm);

function showForm() {
    // Create the form container
    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';

    // Create the form
    const form = document.createElement('form');
    form.className='form-container'
    form.innerHTML = `
        <label for="title">Title:</label>
        <input id="title" required>

        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
        
        <label for="card-info">Card Information:</label>
        <input type="text" id="card-info" name="card-info" required>
        
        <label for="amount">Amount:</label>
        <input type="number" id="amount" name="amount" required>
        
        <label for="description">Description:</label>
        <textarea id="description" name="description" required></textarea>
        
        <button type="submit">Submit</button>
    `;

    // Append the form to the form container
    formContainer.appendChild(form);

    // Append the form container to the body
    document.body.appendChild(formContainer);

    // Add a submit event listener to the form
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting
    
        // Get the form data from 'form' instead of document
        const title = form.querySelector("#title").value;
        const email = form.querySelector("#email").value;
        const cardInfo = form.querySelector("#card-info").value;
        const amount = form.querySelector("#amount").value;
        const description = form.querySelector("#description").value;
    
        // Save the fundraising card to the server
        saveFundraisingCard(title, email, cardInfo, amount, description);
    
        // Remove the form container
        document.body.removeChild(formContainer);
    });
}

// New function to save fundraising card to server
async function saveFundraisingCard(title, email, cardInfo, amount, description) {
    try {
        // Save to server
        const response = await fetch('/api/funds', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                email,
                cardInfo,
                amount,
                description,
                createdAt: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save fund');
        }

        const result = await response.json();
        
        // Create card in UI after successful save
        createFundraisingCard(title, email, cardInfo, amount, description);
        
        alert('Fund created successfully!');
    } catch (error) {
        console.error('Error saving fund:', error);
        alert('Failed to create fund. Please try again.');
    }
}

function createFundraisingCard(fund) {
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