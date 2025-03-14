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
app.use(express.static(path.join(__dirname, 'HTML'))); // Serve HTML files from root URL

// Initialize users.json if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
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
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Read users from file
    let users = [];
    try {
      const data = fs.readFileSync(USERS_FILE);
      users = JSON.parse(data);
    } catch (err) {
      console.error('Error reading users file:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Set session variables
    req.session.isLoggedIn = true;
    req.session.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    };

    // Redirect or respond with success
    if (req.headers['content-type'] === 'application/json') {
      // API request
      return res.status(200).json({ 
        success: true, 
        message: 'Login successful',
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    } else {
      // Form submission
      return res.redirect('/dashboard.html');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
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

// Registration endpoint (unchanged)
app.post('/register', async (req, res) => {
  try {
    // Get form data
    const { firstName, lastName, email, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
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
      return res.status(409).json({ error: 'User with this email already exists' });
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
    
    // Redirect to a success page or respond with JSON based on your needs
    res.redirect('/dashboard.html'); // If you have a dashboard page
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Protected route example - middleware to check if user is logged in
const requireLogin = (req, res, next) => {
  if (req.session.isLoggedIn) {
    next();
  } else {
    res.redirect('/login.html');
  }
};

// Example of a protected route
app.get('/api/profile', requireLogin, (req, res) => {
  res.json({ user: req.session.user });
});

// Add a route to serve your main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'HTML', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});