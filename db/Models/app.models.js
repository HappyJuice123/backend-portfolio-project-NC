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

function fetchComments(review_id) {
  let queryStr = "SELECT * FROM comments";
  const queryParams = [];

  if (review_id) {
    queryStr += " WHERE review_id = $1";
    queryParams.push(review_id);
  }

  return db.query(queryStr, queryParams).then(({ rows }) => {
    return rows;
  });
}

module.exports = { fetchCategories, fetchComments };
