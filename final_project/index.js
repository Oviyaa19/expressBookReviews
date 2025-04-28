const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const books = require('./router/booksdb'); // IMPORT books

const app = express();
const secretKey = 'aXhD3a3IrJ3HD8hs8IHV3kKJ8VbrzLKmgDsoIGs2R2Y='; 

app.use(express.json());

// Example in-memory users
const users = [
  { username: 'Oviya', password: 'Connect@123' }
];

// Login
app.post('/customer/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' });
  res.status(200).json({ message: 'Login successful', token });
});

// Middleware to verify token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  jwt.verify(token, secretKey, (err, user) => {  // FIXED secretKey
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Protected review endpoint
app.post('/customer/review', authenticateToken, (req, res) => {
  const { isbn, review } = req.body;

  if (!isbn || !review) {
    return res.status(400).json({ message: 'ISBN and review are required' });
  }

  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const book = books[isbn];
  if (book.reviews[username]) {
    book.reviews[username] = review;
    return res.status(200).json({ message: 'Review updated successfully' });
  } else {
    book.reviews[username] = review;
    return res.status(200).json({ message: 'Review added successfully' });
  }
});

// Delete review endpoint
app.delete('/customer/review/:isbn', authenticateToken, (req, res) => {
  const { isbn } = req.params; // Extract the ISBN from the URL parameter
  const username = req.user.username; // Get the username from the authenticated user (JWT token)

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const book = books[isbn];

  // Check if the review exists for the user and delete it
  if (book.reviews[username]) {
    delete book.reviews[username]; // Delete the review for the authenticated user
    return res.status(200).json({ message: 'Review deleted successfully' });
  } else {
    return res.status(404).json({ message: 'No review found for this user to delete' });
  }
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
