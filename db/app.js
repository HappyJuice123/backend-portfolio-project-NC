const express = require("express");

const db = require("./connection");

const cors = require("cors");

const {
  getCategories,
  getReviews,
  getReview,
  getComments,
  addComment,
  updateReview,
  getUsers,
  deleteComment,
  getEndpoints,
  getUser,
  updateVote,
  addReview,
  addCategory,
  deleteReview,
} = require("./Controllers/app.controllers");

const {
  handle404NonExistentPaths,
  handleServerError,
  handleCustomError,
  handlePSQL400s,
} = require("./Controllers/error-handling.controller");

const app = express();
app.use(cors());
app.use(express.json());

// EndPoints
app.get("/api", getEndpoints);

// Categories
app.get("/api/categories", getCategories);

app.post("/api/categories", addCategory);

// Reviews
app.get("/api/reviews", getReviews);

app.post("/api/reviews", addReview);

app.get("/api/reviews/:review_id", getReview);

app.get("/api/reviews/:review_id/comments", getComments);

app.post("/api/reviews/:review_id/comments", addComment);

app.patch("/api/reviews/:review_id", updateReview);

app.delete("/api/reviews/:review_id", deleteReview);

// Users
app.get("/api/users", getUsers);

app.get("/api/users/:username", getUser);

// Comments
app.delete("/api/comments/:comment_id", deleteComment);

app.patch("/api/comments/:comment_id", updateVote);

app.use(handle404NonExistentPaths);

app.use(handlePSQL400s);

app.use(handleCustomError);

app.use(handleServerError);

module.exports = app;
