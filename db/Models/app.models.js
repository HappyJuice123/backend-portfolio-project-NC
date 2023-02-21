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

function fetchReview(review_id) {
  let queryStr = "SELECT * FROM reviews";
  const queryParams = [];

  if (review_id) {
    queryStr += " WHERE review_id = $1";
    queryParams.push(review_id);
  }

  return db.query(queryStr, queryParams).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject("review_id not found");
    }
    return rows[0];
  });
}

module.exports = { fetchCategories, fetchReview };
