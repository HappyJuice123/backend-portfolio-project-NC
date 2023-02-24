const db = require("../connection");
const fs = require("fs/promises");

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

function fetchReviews(category, sort_by = "created_at", order = "DESC") {
  let queryStr = `SELECT reviews.review_id, reviews.title, reviews.designer, reviews.owner, reviews.review_img_url, reviews.review_body, reviews.category, reviews.created_at, reviews.votes, COUNT(comments.review_id) AS comment_count
    FROM reviews
    LEFT JOIN comments
    ON reviews.review_id = comments.review_id`;

  const queryParams = [];

  if (category) {
    queryStr += " WHERE category = $1";
    queryParams.push(category);
  }

  queryStr += ` GROUP BY reviews.review_id`;

  const validSortByOptions = [
    "review_id",
    "title",
    "desginer",
    "owner",
    "review_img_url",
    "review_body",
    "category",
    "created_at",
    "votes",
    "comment_count",
  ];

  const validOrderByOptions = ["ASC", "DESC"];

  const validOption = validSortByOptions.find((option) => option === sort_by);

  const orderOption = validOrderByOptions.find((option) => option === order);

  if (validOption) {
    queryStr += `
        ORDER BY reviews.${sort_by}`;
  } else {
    return Promise.reject("Invalid query");
  }

  if (orderOption) {
    queryStr += ` ${order}`;
  } else {
    return Promise.reject("Invalid query");
  }

  return db.query(queryStr, queryParams).then(({ rows }) => {
    return rows;
  });
}

function selectReviewByCategory(category) {
  let queryStr = "SELECT * FROM categories";

  const queryParams = [];

  const validCategoryOptions = [
    "euro game",
    "social deduction",
    "dexterity",
    "children's games",
  ];

  const categoryOption = validCategoryOptions.find(
    (option) => option === category
  );

  if (categoryOption) {
    queryStr += " WHERE slug = $1";
    queryParams.push(category);
  }

  if (category && !categoryOption) {
    return Promise.reject("Invalid query");
  }

  return db.query(queryStr, queryParams).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject("No category found");
    }
    return rows;
  });
}

function fetchReview(review_id) {
  let queryStr = `SELECT reviews.review_id, reviews.title, reviews.designer, reviews.owner, reviews.review_img_url, reviews.review_body, reviews.category, reviews.created_at, reviews.votes, COUNT(comments.review_id) AS comment_count
  FROM reviews
  LEFT JOIN comments
  ON reviews.review_id = comments.review_id`;

  const queryParams = [];

  if (review_id) {
    queryStr += " WHERE reviews.review_id = $1";
    queryParams.push(review_id);
  }

  queryStr += " GROUP BY reviews.review_id";

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
      return rows[0];
    });
}

function updatedReview(review_id, inc_votes) {
  return db
    .query(
      `
    UPDATE reviews
    SET votes = votes + $1
    WHERE review_id = $2
    RETURNING *
    `,
      [inc_votes, review_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject("review_id not found");
      }
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

function removeComment(comment_id) {
  return db
    .query(
      `
    DELETE FROM comments 
    WHERE comment_id = $1
    RETURNING *
    `,
      [comment_id]
    )
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject("comment_id does not exist");
      }
      return result.rows;
    });
}

function fetchEndpoints() {
  return fs
    .readFile(`${__dirname}/../../endpoints.json`, "utf8")
    .then((result) => {
      console.log(JSON.parse(result));
      return JSON.parse(result);
    });
}

module.exports = {
  fetchCategories,
  fetchReviews,
  fetchReview,
  fetchComments,
  addingComment,
  updatedReview,
  selectReviewByCategory,
  fetchUsers,
  removeComment,
  fetchEndpoints,
};
