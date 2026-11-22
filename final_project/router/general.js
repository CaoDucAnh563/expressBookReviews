const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Endpoint nội bộ cung cấp dữ liệu gốc để Axios gọi bất đồng bộ (tránh lặp vô hạn)
public_users.get('/books', function (req, res) {
  return res.status(200).json(books);
});

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    const userExists = users.some((user) => user.username === username);
    if (!userExists) {
      users.push({ username: username, password: password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(409).json({ message: "User already exists!" });
    }
  }
  return res.status(400).json({ message: "Unable to register user. Username and password are required." });
});

// Task 10: Get the book list available in the shop using async/await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/books');
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book list", error: error.message });
  }
});

// Task 11: Get book details based on ISBN using async/await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get('http://localhost:5000/books');
    const book = response.data[isbn];
    if (book) {
      return res.status(200).send(JSON.stringify(book, null, 4));
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book details by ISBN", error: error.message });
  }
});

// Task 12: Get book details based on author using async/await with Axios
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get('http://localhost:5000/books');
    const allBooks = response.data;
    const matchingBooks = [];

    Object.keys(allBooks).forEach((isbn) => {
      if (allBooks[isbn].author.toLowerCase() === author.toLowerCase()) {
        matchingBooks.push({
          isbn: isbn,
          author: allBooks[isbn].author,
          title: allBooks[isbn].title,
          reviews: allBooks[isbn].reviews
        });
      }
    });

    if (matchingBooks.length > 0) {
      return res.status(200).send(JSON.stringify({ booksbyauthor: matchingBooks }, null, 4));
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books by author", error: error.message });
  }
});

// Task 13: Get all books based on title using async/await with Axios
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const response = await axios.get('http://localhost:5000/books');
    const allBooks = response.data;
    const matchingBooks = [];

    Object.keys(allBooks).forEach((isbn) => {
      if (allBooks[isbn].title.toLowerCase() === title.toLowerCase()) {
        matchingBooks.push({
          isbn: isbn,
          author: allBooks[isbn].author,
          title: allBooks[isbn].title,
          reviews: allBooks[isbn].reviews
        });
      }
    });

    if (matchingBooks.length > 0) {
      return res.status(200).send(JSON.stringify({ booksbytitle: matchingBooks }, null, 4));
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books by title", error: error.message });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;