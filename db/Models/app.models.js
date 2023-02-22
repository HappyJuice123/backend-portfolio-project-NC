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

function addUser(username) {
  return db
    .query(
      `
    INSERT INTO users
    (username, name, avatar_url)
    VALUES
    ($1, $2, $3)
    RETURNING *
`,
      [
        username,
        "jason",
        "https://avatars.githubusercontent.com/u/9919?s=460&v=4",
      ]
    )
    .then(({ rows }) => {
      return rows[0];
    });
}

function addingComment(review_id, username, body) {
  return db
    .query(
      `
      INSERT INTO comments
      (body, votes, review_id, created_at, author)
      VALUES
      ($1, $2, $3, $4, (SELECT username FROM users WHERE username = $5))
      RETURNING *
      `,
      [body, 0, review_id, new Date(1676994323752), username]
    )
    .then(({ rows }) => {
      return rows[0];
    });
}

function fetchUsers() {
  return db
    .query(
      `
    SELECT * FROM users;
    `
    )
    .then(({ rows }) => {
      return rows;
    });
}

module.exports = {
  fetchCategories,
  fetchReviews,
  fetchReview,
  fetchComments,
  addUser,
  addingComment,
  fetchUsers,
};
