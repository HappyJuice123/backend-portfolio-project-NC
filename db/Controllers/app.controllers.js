const { fetchCategories, fetchComments } = require("../Models/app.models");

function getCategories(req, res, next) {
  fetchCategories()
    .then((categories) => {
      res.status(200).send({ categories });
    })
    .catch((err) => {
      next(err);
    });
}

function getComments(req, res, next) {
  const { review_id } = req.params;

  fetchComments(review_id).then((comments) => {
    res.status(200).send({ comments });
  });
}

module.exports = { getCategories, getComments };
