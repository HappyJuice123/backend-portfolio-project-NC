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

function insertCategory(slug, description) {
  return db
    .query(
      `
  INSERT INTO categories
  (slug, description)
  VALUES
  ($1, $2)
  RETURNING *
  `,
      [slug, description]
    )
    .then(({ rows }) => {
      return rows[0];
    });
}

function fetchReviews(
  category,
  sort_by = "created_at",
  order = "DESC",
  limit = 10,
  p
) {
  let queryStr = `SELECT reviews.review_id, reviews.title, reviews.designer, reviews.owner, reviews.review_img_url, reviews.review_body, reviews.category, reviews.created_at, reviews.votes, COUNT(comments.review_id) AS comment_count, 
  (SELECT COUNT(*) AS total_count FROM reviews)
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
    "designer",
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

  if (validOption && validOption !== "comment_count") {
    queryStr += `
        ORDER BY reviews.${sort_by}`;
  } else if (validOption && validOption === "comment_count") {
    queryStr += `
        ORDER BY comment_count`;
  } else {
    return Promise.reject("Invalid query");
  }

  if (orderOption) {
    queryStr += ` ${order}`;
  } else {
    return Promise.reject("Invalid query");
  }

  if (typeof +limit === "number" && !p) {
    queryStr += ` LIMIT ${limit}`;
  } else if (typeof +limit === "number" && +p === 1) {
    queryStr += ` LIMIT ${limit}`;
  } else if (typeof +limit === "number" && +p > 1) {
    const offset = +limit * (+p - 1);
    queryStr += ` LIMIT ${limit} OFFSET ${offset}`;
  } else {
    return Promise.reject("Invalid query");
  }

  return db.query(queryStr, queryParams).then(({ rows }) => {
    return rows;
  });
}

function selectReviewByCategory(category) {
  return db.query(`SELECT slug FROM categories`).then(({ rows }) => {
    const validCategoryOptions = rows.map((row) => {
      return row.slug;
    });

    let queryStr = "SELECT * FROM categories";

    const queryParams = [];

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

function insertReview(
  title,
  designer,
  owner,
  review_body,
  category,
  review_img_url = "https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700"
) {
  return db
    .query(
      `
  INSERT INTO reviews
  (title, designer, owner, review_body, category, review_img_url)
  VALUES
  ($1, $2, $3, $4, $5, $6)
  RETURNING *
  `,
      [title, designer, owner, review_body, category, review_img_url]
    )
    .then(() => {
      return db.query(
        `
      SELECT reviews.review_id, reviews.title, reviews.designer, reviews.owner, reviews.review_img_url, reviews.review_body, reviews.category, reviews.created_at, reviews.votes, COUNT(comments.review_id) AS comment_count
  FROM reviews
  LEFT JOIN comments
  ON reviews.review_id = comments.review_id
  WHERE reviews.title = $1
  GROUP BY reviews.review_id
      `,
        [title]
      );
    })
    .then(({ rows }) => {
      return rows[0];
    });
}

function fetchComments(review_id, limit = 10, p) {
  let queryStr = "SELECT * FROM comments";
  const queryParams = [];

  if (review_id) {
    queryStr += " WHERE review_id = $1";
    queryParams.push(review_id);
  }

  if (typeof +limit === "number" && !p) {
    queryStr += ` LIMIT ${limit}`;
  } else if (typeof +limit === "number" && +p === 1) {
    queryStr += ` LIMIT ${limit}`;
  } else if (typeof +limit === "number" && +p > 1) {
    const offset = +limit * (+p - 1);
    queryStr += ` LIMIT ${limit} OFFSET ${offset}`;
  } else {
    return Promise.reject("Invalid query");
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

function removeReview(review_id) {
  return db
    .query(
      `
    DELETE FROM reviews 
    WHERE review_id = $1
    RETURNING *
    `,
      [review_id]
    )
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject("review_id does not exist");
      }

      return result.rows;
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

function fetchUser(username) {
  let queryStr = `SELECT * FROM users`;
  const queryParams = [];

  if (username) {
    queryStr += ` WHERE username = $1`;
    queryParams.push(username);
  }

  return db.query(queryStr, queryParams).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject("username does not exist");
    }
    return rows[0];
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

function addVote(inc_votes, comment_id) {
  return db
    .query(
      `
  UPDATE comments
  SET votes = votes + $1
  WHERE comment_id = $2
  RETURNING *
  `,
      [inc_votes, comment_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject("comment_id does not exist");
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
  updatedReview,
  selectReviewByCategory,
  fetchUsers,
  removeComment,
  fetchUser,
  addVote,
  insertReview,
  insertCategory,
  removeReview,
};
