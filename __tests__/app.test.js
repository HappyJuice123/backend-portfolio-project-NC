const request = require("supertest");
const app = require("../db/app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(data);
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
    test("200: GET - responds with reviews objects", () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then(({ body }) => {
          const { reviews } = body;
          expect(reviews).toHaveLength(13);
          reviews.forEach((review) => {
            expect(review).toMatchObject({
              title: expect.any(String),
              designer: expect.any(String),
              owner: expect.any(String),
              review_img_url: expect.any(String),
              review_body: expect.any(String),
              category: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(String),
            });
          });
        });
    });
    test('200: GET - responds with reviews object in descending order of "created at"', () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then(({ body }) => {
          const { reviews } = body;
          const reviewsCopy = [...reviews];
          reviewsCopy.forEach((reviewCopy) => {
            reviewCopy.created_at = new Date(reviewCopy.created_at).getTime();
          });
          const reviewsSorted = reviewsCopy.sort((reviewA, reviewB) => {
            return reviewB.created_at - reviewA.created_at;
          });
          expect(reviews).toHaveLength(13);
          expect(reviewsSorted).toEqual(reviews);
        });
    });
  });
});
