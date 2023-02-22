const {
  fetchCategories,
  fetchReviews,
  fetchReview,
  fetchComments,
  addingComment,
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
  fetchReviews()
    .then((reviews) => {
      res.status(200).send({ reviews });
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

  const reviewIdPromise = fetchReview(review_id);
  const addingCommentPromise = addingComment(review_id, username, body);

  Promise.all([reviewIdPromise, addingCommentPromise])
    .then((result) => {
      const addComment = result[1];
      res.status(201).send({ addComment });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
}

module.exports = {
  getCategories,
  getReviews,
  getReview,
  getComments,
  addComment,
};
