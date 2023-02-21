const express = require("express");

const db = require("./connection");

const {
  getCategories,
  getReviews,
  getReview,
} = require("./Controllers/app.controllers");

const {
  handle404NonExistentPaths,
  handleServerError,
  handleCustomError,
  handlePSQL400s,
} = require("./Controllers/error-handling.controller");

const app = express();

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id", getReview);

app.use(handle404NonExistentPaths);

app.use(handlePSQL400s);

app.use(handleCustomError);

app.use(handleServerError);

module.exports = app;
