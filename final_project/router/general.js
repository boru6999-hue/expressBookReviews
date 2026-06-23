const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!users.some(user => user.username === username)) {
      users.push({ username, password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop (async/await)
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => new Promise((resolve) => resolve(books));
    const allBooks = await getBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN (async/await)
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const getByIsbn = () => new Promise((resolve, reject) => {
      if (books[isbn]) resolve(books[isbn]);
      else reject("Book not found");
    });
    const book = await getByIsbn();
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author (async/await)
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const getByAuthor = () => new Promise((resolve, reject) => {
      const filtered = [];
      for (let isbn in books) {
        if (books[isbn].author === author) filtered.push({ isbn, ...books[isbn] });
      }
      if (filtered.length > 0) resolve(filtered);
      else reject("No books found");
    });
    const result = await getByAuthor();
    return res.status(200).json({ booksbyauthor: result });
  } catch (error) {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title (async/await)
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const getByTitle = () => new Promise((resolve, reject) => {
      const filtered = [];
      for (let isbn in books) {
        if (books[isbn].title === title) filtered.push({ isbn, ...books[isbn] });
      }
      if (filtered.length > 0) resolve(filtered);
      else reject("No books found");
    });
    const result = await getByTitle();
    return res.status(200).json({ booksbytitle: result });
  } catch (error) {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;