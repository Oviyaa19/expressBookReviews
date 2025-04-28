const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const jwt = require('jsonwebtoken');
const secretKey = 'aXhD3a3IrJ3HD8hs8IHV3kKJ8VbrzLKmgDsoIGs2R2Y='; 
const axios = require('axios'); 

public_users.post('/customer/login', (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Find the user
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Create a JWT Token
  const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' });

  // Send the token
  res.status(200).json({ message: 'Login successful', token });
});

public_users.get('/books', (req, res) => {
  res.status(200).json(books);
});


// Route to register a new user
public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if user already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(400).json({ message: "Username already exists" });
    }

    // Add new user
    users.push({ username, password });

    return res.status(201).json({ message: "User registered successfully" });
});


// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.json(JSON.stringify(books, null, 2));  
});




public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;

  try {
    // Make an axios GET request to your own /books endpoint
    const response = await axios.get('http://localhost:5000/books');
    const books = response.data;

    const book = books[isbn];
    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});

  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;  // Get the author from URL

  try {
    
    const response = await axios.get('http://localhost:5000/books'); 

    const books = response.data;  

    // Filter books by author
    const booksByAuthor = Object.values(books).filter(book => book.author === author);

    if (booksByAuthor.length > 0) {
      res.status(200).json(booksByAuthor);
    } else {
      res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    // Handle errors gracefully
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});


// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;  

  try {
    const response = await axios.get('http://localhost:5000/books'); 

    const books = response.data;  

    // Filter books by title
    const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());

    if (booksByTitle.length > 0) {
      res.status(200).json(booksByTitle);
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    // Handle errors gracefully
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;   // get ISBN from URL
  const book = books[isbn];       // get book directly from object

  if (book) {
    res.status(200).json(book.reviews);  // send only the reviews
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});


function getBooks() {
  axios.get('http://localhost:5000/books') // Replace with your actual API endpoint
    .then(response => {
      // console.log('Books List:', response.data); // Displaying the list of books in the console
    })
    .catch(error => {
      console.error('Error fetching books:', error);
    });
}

// Call the function
getBooks();



module.exports.general = public_users;
