const request = require("supertest");
const app = require("../db/app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");

const { categoryData, commentData, reviewData, userData } = data;

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(categoryData, commentData, reviewData, userData);
});

describe("app", () => {
  describe("/api/categories", () => {
    test("200: GET - responds with category objects", () => {
      return request(app)
        .get("/api/categories")
        .expect(200)
        .then(({ body }) => {
          const { categories } = body;
          expect(categories).toHaveLength(4);
          categories.forEach((category) => {
            expect(category).toMatchObject({
              slug: expect.any(String),
              description: expect.any(String),
            });
          });
        });
    });
  });
});
