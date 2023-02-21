const express = require("express");

const db = require("./connection");

const { getCategories, getComments } = require("./Controllers/app.controllers");
const {
  handleServerError,
  handleCustomError,
} = require("./Controllers/error-handling.controller");

const app = express();

app.get("/api/categories", getCategories);

app.get("/api/reviews/:review_id/comments", getComments);

app.use(handleCustomError);

app.use(handleServerError);

module.exports = app;
