const express = require("express");

const db = require("./connection");

const {
  getCategories,
  getReviews,
  getReview,
  getComments,
  addComment,
  updateReview,
  getUsers,
} = require("./Controllers/app.controllers");

const {
  handle404NonExistentPaths,
  handleServerError,
  handleCustomError,
  handlePSQL400s,
} = require("./Controllers/error-handling.controller");

const app = express();

app.use(express.json());

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id", getReview);

app.get("/api/reviews/:review_id/comments", getComments);

app.post("/api/reviews/:review_id/comments", addComment);

app.patch("/api/reviews/:review_id", updateReview);

app.get("/api/users", getUsers);

app.use(handle404NonExistentPaths);

app.use(handlePSQL400s);

app.use(handleCustomError);

app.use(handleServerError);

module.exports = app;
