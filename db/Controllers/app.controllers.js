const {
  fetchCategories,
  fetchReviews,
  fetchReview,
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

module.exports = { getCategories, getReviews, getReview };
