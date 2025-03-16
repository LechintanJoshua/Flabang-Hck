const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = 3000;
const SALT_ROUNDS = 10;
const USERS_FILE = path.join(__dirname, 'users.json');
const FUNDS_FILE = path.join(__dirname, 'funds.json');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up session middleware
app.use(session({
  secret: 'your-secret-key', // Change this to a secure random string
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 3600000, // Session expires after 1 hour (in milliseconds)
    secure: false    // Set to true if using HTTPS
  }
}));

// Serve static files from the different folders
app.use('/css', express.static(path.join(__dirname, 'CSS')));
app.use('/imagini', express.static(path.join(__dirname, 'Imagini')));
app.use('/javascript', express.static(path.join(__dirname, 'Javascript'))); // Serve JavaScript files
app.use(express.static(path.join(__dirname, 'HTML')));

// Initialize users.json if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

// Initialize funds.json if it doesn't exist
if (!fs.existsSync(FUNDS_FILE)) {
  fs.writeFileSync(FUNDS_FILE, JSON.stringify([], null, 2));
}

// Make isLoggedIn available to all templates
app.use((req, res, next) => {
  // Create a global variable that can be accessed by client-side JavaScript
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.user = req.session.user || null;
  next();
});

// Add route to check login status (for client-side JavaScript)
app.get('/api/auth/status', (req, res) => {
  res.json({
    isLoggedIn: req.session.isLoggedIn || false,
    user: req.session.user ? {
      firstName: req.session.user.firstName,
      lastName: req.session.user.lastName,
      email: req.session.user.email
    } : null
  });
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).send(`
        <script>
          sessionStorage.setItem("loginError", "Email and password are required");
          window.location.href = "/login.html";
        </script>
      `);
    }

    // Read users from file
    let users = [];
    try {
      const data = fs.readFileSync(USERS_FILE);
      users = JSON.parse(data);
    } catch (err) {
      console.error('Error reading users file:', err);
      return res.status(500).send(`
        <script>
          sessionStorage.setItem("loginError", "Server error. Please try again later.");
          window.location.href = "/login.html";
        </script>
      `);
    }

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).send(`
        <script>
          sessionStorage.setItem("loginError", "Invalid email or password");
          window.location.href = "/login.html";
        </script>
      `);
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send(`
        <script>
          sessionStorage.setItem("loginError", "Invalid email or password");
          window.location.href = "/login.html";
        </script>
      `);
    }

    // Set session variables
    req.session.isLoggedIn = true;
    req.session.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    };

    // Redirect to dashboard
    res.redirect('/dashboard.html');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send(`
      <script>
        sessionStorage.setItem("loginError", "Login failed. Please try again.");
        window.location.href = "/login.html";
      </script>
    `);
  }
});

// Logout endpoint
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.redirect('/');
  });
});

// Registration endpoint
app.post('/register', async (req, res) => {
  try {
    // Get form data
    const { firstName, lastName, email, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).send(`
        <script>
          sessionStorage.setItem("registerError", "All fields are required");
          window.location.href = "/register.html";
        </script>
      `);
    }

    // Read existing users
    let users = [];
    try {
      const data = fs.readFileSync(USERS_FILE);
      users = JSON.parse(data);
    } catch (err) {
      console.error('Error reading users file:', err);
    }

    // Check if user already exists
    const userExists = users.some(user => user.email === email);
    if (userExists) {
      return res.status(409).send(`
        <script>
          sessionStorage.setItem("registerError", "User with this email already exists");
          window.location.href = "/register.html";
        </script>
      `);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user object
    const newUser = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    // Add user to array
    users.push(newUser);

    // Save updated users array to file
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    // Set session (automatically log in after registration)
    req.session.isLoggedIn = true;
    req.session.user = {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email
    };
    
    // Redirect to dashboard
    res.redirect('/dashboard.html');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send(`
      <script>
        sessionStorage.setItem("registerError", "Registration failed. Please try again.");
        window.location.href = "/register.html";
      </script>
    `);
  }
});

// Protected route middleware to check if user is logged in
const requireLogin = (req, res, next) => {
  if (req.session.isLoggedIn) {
    next();
  } else {
    res.redirect('/login.html');
  }
};

app.get('/api/all-funds', (req, res) => {
  try {
    // Read funds from file
    let funds = [];
    try {
      const data = fs.readFileSync(FUNDS_FILE);
      funds = JSON.parse(data);
    } catch (err) {
      console.error('Error reading funds file:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    
    // Return all funds
    res.json({ funds: funds });
  } catch (error) {
    console.error('Error getting funds:', error);
    res.status(500).json({ error: 'Failed to get funds' });
  }
});


// Protected routes
app.get('/dashboard.html', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'HTML', 'dashboard.html'));
});

app.get('/api/profile', requireLogin, (req, res) => {
  res.json({ user: req.session.user });
});

// API endpoint to create a new fund
app.post('/api/funds', requireLogin, (req, res) => {
  try {
    // Get fund data from request
    const fundData = req.body;
    
    // Add user ID to the fund data
    fundData.userId = req.session.user.id;
    fundData.id = Date.now().toString(); // Generate a unique ID for the fund
    
    // Read existing funds
    let funds = [];
    try {
      const data = fs.readFileSync(FUNDS_FILE);
      funds = JSON.parse(data);
    } catch (err) {
      console.error('Error reading funds file:', err);
    }
    
    // Add new fund to array
    funds.push(fundData);
    
    // Save updated funds array to file
    fs.writeFileSync(FUNDS_FILE, JSON.stringify(funds, null, 2));
    
    // Return success response
    res.status(201).json({ success: true, fundId: fundData.id });
  } catch (error) {
    console.error('Fund creation error:', error);
    res.status(500).json({ error: 'Failed to create fund' });
  }
});

// API endpoint to get user's funds
app.get('/api/funds', requireLogin, (req, res) => {
  try {
    // Read funds from file
    let funds = [];
    try {
      const data = fs.readFileSync(FUNDS_FILE);
      funds = JSON.parse(data);
    } catch (err) {
      console.error('Error reading funds file:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    
    // Filter funds by user ID
    const userFunds = funds.filter(fund => fund.userId === req.session.user.id);
    
    // Return funds
    res.json({ funds: userFunds });
  } catch (error) {
    console.error('Error getting funds:', error);
    res.status(500).json({ error: 'Failed to get funds' });
  }
});

// Add a route to serve your main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'HTML', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});