const db = require("../connection");

function fetchCategories() {
  return db
    .query(
      `
    SELECT * FROM categories;
    `
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject("could not find this data");
      }
      return rows;
    });
}

module.exports = { fetchCategories };
