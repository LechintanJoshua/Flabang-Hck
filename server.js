const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;
const SALT_ROUNDS = 10;
const USERS_FILE = path.join(__dirname, 'users.json');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the different folders
app.use('/css', express.static(path.join(__dirname, 'CSS')));
app.use('/imagini', express.static(path.join(__dirname, 'Imagini')));
app.use(express.static(path.join(__dirname, 'HTML'))); // Serve HTML files from root URL

// Initialize users.json if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

// Registration endpoint
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

    // Return success response (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    // Redirect to a success page or respond with JSON based on your needs
    res.redirect('/login.html'); // If you have a success page
    // Or send JSON response:
    // res.status(201).json({
    //   message: 'User registered successfully',
    //   user: userWithoutPassword
    // });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
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