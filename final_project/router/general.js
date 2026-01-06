const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');



public_users.post("/register", (req,res) => {
  //Task?
  return res.status(300).json({message: "Yet to be implemented"});
});
 

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Task1 
  res.send(JSON.stringify(books, null, 4));
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Task2
  const isbn = req.params.isbn;      // URLパラメータからISBNを取得
  const book = books[isbn];          // booksは "isbnをキーにしたオブジェクト" 前提

  if (book) {
    res.send(JSON.stringify(book, null, 4));
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Task3
  const author = req.params.author;   // URLパラメータからauthor取得
  let result = [];

  // books の全キーを取得
  const bookKeys = Object.keys(books);

  // すべての本をチェック
  bookKeys.forEach((key) => {
    if (books[key].author === author) {
      result.push({
        isbn: key,
        ...books[key]
      });
    }
  });

  if (result.length > 0) {
    res.send(JSON.stringify(result, null, 4));
  } else {
    res.status(404).json({ message: "No books found for this author" });
  }
});


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Task4
  const title = req.params.title;   // URLパラメータからtitle取得
  let result = [];

  // books の全キーを取得
  const bookKeys = Object.keys(books);

  // すべての本をチェック
  bookKeys.forEach((key) => {
    if (books[key].title === title) {
      result.push({
        isbn: key,
        ...books[key]
      });
    }
  });

  if (result.length > 0) {
    res.send(JSON.stringify(result, null, 4));
  } else {
    res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Task5
    const isbn = req.params.isbn;     // URLパラメータからISBN取得
  const book = books[isbn];         // ISBNに対応する本を取得

  if (book) {
    res.send(JSON.stringify(book.reviews, null, 4));
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

//Task10
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/');
    // response.data はすでにJSON（または文字列）として返ってくる
    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

//Task11
public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return res.status(200).send(response.data);
  } catch (error) {
    // 404など、元のAPIが返したステータスをなるべく維持
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: "Error fetching book by ISBN" };
    return res.status(status).send(data);
  }
});

//Task12
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    return res.status(200).send(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: "Error fetching books by author" };
    return res.status(status).send(data);
  }
});

//Task13
public_users.get('/async/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    return res.status(200).send(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: "Error fetching books by title" };
    return res.status(status).send(data);
  }
});

module.exports.general = public_users;
