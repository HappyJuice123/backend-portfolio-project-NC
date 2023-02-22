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
          ORDER BY reviews.created_at DESC;
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

function fetchComments(review_id) {
  let queryStr = "SELECT * FROM comments";
  const queryParams = [];

  if (review_id) {
    queryStr += " WHERE review_id = $1";
    queryParams.push(review_id);
  }

  return db.query(queryStr, queryParams).then(({ rows }) => {
    return { rows };
  });
}

function addingComment(review_id, username, body) {
  return db
    .query(
      `
      INSERT INTO comments
      (body, review_id, author)
      VALUES
      ($1, $2, $3)
      RETURNING *
      `,
      [body, review_id, username]
    )
    .then(({ rows }) => {
      if (!rows) {
        return Promise.reject("Invalid input");
      }
      return rows[0];
    });
}

module.exports = {
  fetchCategories,
  fetchReviews,
  fetchReview,
  fetchComments,
  addingComment,
};
