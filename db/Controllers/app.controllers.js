const fs = require("fs/promises");
const {
  fetchCategories,
  fetchReviews,
  fetchReview,
  fetchComments,
  addingComment,
  updatedReview,
  selectReviewByCategory,
  fetchUsers,
  removeComment,
  fetchUser,
  addVote,
  insertReview,
} = require("../Models/app.models");

function getCategories(req, res, next) {
  fetchCategories()
    .then((categories) => {
      res.status(200).send({ categories });
    })
    .catch((err) => {
      next(err);
    });
}

function getReview(req, res, next) {
  const { review_id } = req.params;

  fetchReview(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      next(err);
    });
}

function getReviews(req, res, next) {
  const { category, sort_by, order } = req.query;

  const checkCategory = selectReviewByCategory(category);
  const getReviews = fetchReviews(category, sort_by, order);

  Promise.all([checkCategory, getReviews])
    .then((result) => {
      const reviews = result[1];
      res.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
}

function addReview(req, res, next) {
  const { title, designer, owner, review_body, category, review_img_url } =
    req.body;

  insertReview(title, designer, owner, review_body, category, review_img_url)
    .then((newReview) => {
      res.status(201).send({ newReview });
    })
    .catch((err) => {
      next(err);
    });
}

function getComments(req, res, next) {
  const { review_id } = req.params;

  const reviewIdPromise = fetchReview(review_id);
  const commentsPromise = fetchComments(review_id);

  Promise.all([reviewIdPromise, commentsPromise])
    .then((result) => {
      const { rows } = result[1];
      const comments = rows;

      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
}

function addComment(req, res, next) {
  const { review_id } = req.params;
  const { username, body } = req.body;

  addingComment(review_id, username, body)
    .then((result) => {
      const addComment = result;
      res.status(201).send({ addComment });
    })
    .catch((err) => {
      next(err);
    });
}

function updateReview(req, res, next) {
  const { review_id } = req.params;
  const { inc_votes } = req.body;

  updatedReview(review_id, inc_votes)
    .then((updatedReview) => {
      res.status(200).send({ updatedReview });
    })
    .catch((err) => {
      next(err);
    });
}

function getUsers(req, res, next) {
  fetchUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
}

function getUser(req, res, next) {
  const { username } = req.params;

  fetchUser(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => {
      next(err);
    });
}

function deleteComment(req, res, next) {
  const { comment_id } = req.params;

  removeComment(comment_id)
    .then((result) => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
}

function getEndpoints(req, res, next) {
  return fs
    .readFile(`${__dirname}/../../endpoints.json`, "utf8")
    .then((result) => {
      return JSON.parse(result);
    })
    .then((endpoints) => {
      res.status(200).send({ endpoints });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
}

function updateVote(req, res, next) {
  const { inc_votes } = req.body;
  const { comment_id } = req.params;

  addVote(inc_votes, comment_id)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = {
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
};
