const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  const usersWithSameName = users.filter((user) => user.username === username);
  return usersWithSameName.length === 0;
}

//Task7-1
const authenticatedUser = (username,password)=>{ 
return users.some((user) => user.username === username && user.password === password);
}

//Task6
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // 既に存在するなら登録不可
  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

//Task7-2
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  // username/password がない
  if (!username || !password) {
    return res.status(400).json({ message: "Error logging in" });
  }

  // 認証
  if (authenticatedUser(username, password)) {
    // JWT 発行（index.js の verify と同じ secret "access" を使う）
    const accessToken = jwt.sign(
      { data: username },      // payload（何を入れてもOKだが username が分かりやすい）
      "access",
      { expiresIn: 60 * 60 }   // 1時間
    );

    // セッションに保存（これが /customer/auth/* の認証で使われる）
    req.session.authorization = { accessToken, username };

    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});
  
// Task8
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // セッションから username を取得（Task7で保存したやつ）
  const username = req.session.authorization?.username;

  // review は query から取得（例：?review=Great%20book）
  const review = req.query.review;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review query parameter is required" });
  }

  // 本が存在するか
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // reviews が無い場合に備える（基本 {} のはずだが安全策）
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // 同一ユーザーなら上書き＝更新、別ユーザーなら追加
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: `Review added/updated for ISBN ${isbn}` });
});
  
//Task9
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // セッションから username を取得
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  // 本が存在するか
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // reviews が存在するか
  if (!books[isbn].reviews || Object.keys(books[isbn].reviews).length === 0) {
    return res.status(404).json({ message: "No reviews found for this book." });
  }

  // 自分のレビューがあるか
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this user." });
  }

  // 自分のレビューだけ削除
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: `Review for ISBN ${isbn} deleted for user ${username}.` });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
