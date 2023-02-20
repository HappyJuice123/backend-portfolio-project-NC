const db = require("../connection");

function fetchCategories() {
  return db
    .query(
      `
    SELECT * FROM categories;
    `
    )
    .then(({ rows }) => {
      return rows;
    });
}

function fetchReviews() {
  return db
    .query(
      `
      SELECT reviews.review_id, reviews.title, reviews.designer, reviews.owner, reviews.review_img_url, reviews.review_body, reviews.category, reviews.created_at, reviews.votes, COUNT(comments.review_id) AS comment_count
      FROM reviews
      LEFT JOIN comments
      ON reviews.review_id = comments.review_id
      GROUP BY reviews.review_id
    `
    )
    .then(({ rows }) => {
      return rows;
    });
}

module.exports = { fetchCategories, fetchReviews };
