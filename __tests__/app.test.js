const request = require("supertest");
const app = require("../db/app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const convertTimestampToDate = require("../db/seeds/utils");

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(data);
});

describe("app", () => {
  describe("server errors", () => {
    test("404: responds with msg when sent a valid but non-existent path", () => {
      return request(app)
        .get("/notAPath")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found");
        });
    });
  });
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

  describe("/api/reviews", () => {
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
          const reviewsCopy = [];
          // converting date to timestamp
          reviews.forEach((review) => {
            reviewCopy = { ...review };
            reviewsCopy.push(reviewCopy);
            reviewCopy.created_at = new Date(reviewCopy.created_at).getTime();
          });
          // sorting out in descending order using timestamp
          const reviewsSorted = reviewsCopy.sort((reviewA, reviewB) => {
            return reviewB.created_at - reviewA.created_at;
          });
          // converting back to compare the expected and to be
          reviewsCopy.forEach((reviewCopy) => {
            reviewCopy.created_at = new Date(
              reviewCopy.created_at
            ).toISOString();
          });

          expect(reviews).toHaveLength(13);
          expect(reviewsSorted).toEqual(reviews);
        });
    });
  });
  describe("/api/reviews/:review_id", () => {
    test("200: GET - responds with reviews only with the review_id given", () => {
      return request(app)
        .get("/api/reviews/1")
        .expect(200)
        .then(({ body }) => {
          const { review } = body;
          expect(review).toEqual({
            review_id: 1,
            title: "Agricola",
            designer: "Uwe Rosenberg",
            owner: "mallionaire",
            review_img_url:
              "https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700",
            review_body: "Farmyard fun!",
            category: "euro game",
            created_at: new Date(1610964020514).toISOString(),
            votes: 1,
          });
        });
    });
    test("400: responds with bad request given invalid review id", () => {
      return request(app)
        .get("/api/reviews/invalidReviewId")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("404: GET - responds with msg when sent a query with a valid but non-existent review_id", () => {
      return request(app)
        .get("/api/reviews/50000")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found");
        });
    });
    test("200: PATCH - responds with the updated review", () => {
      const updateReview = { inc_votes: 8 };
      return request(app)
        .patch("/api/reviews/1")
        .send(updateReview)
        .expect(200)
        .then(({ body }) => {
          const { updatedReview } = body;
          expect(updatedReview).toMatchObject({
            review_id: 1,
            title: "Agricola",
            designer: "Uwe Rosenberg",
            owner: "mallionaire",
            review_img_url:
              "https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700",
            review_body: "Farmyard fun!",
            category: "euro game",
            created_at: new Date(1610964020514).toISOString(),
            votes: 9,
          });
        });
    });
    test("404: PATCH - responds with msg when sent a query with a valid but non-existent review_id", () => {
      const updateReview = { inc_votes: 8 };
      return request(app)
        .patch("/api/reviews/50000")
        .send(updateReview)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found");
        });
    });
  });

  describe("/api/reviews/:review_id/comments", () => {
    test("200: GET - responds with array of comments for the given review_id", () => {
      return request(app)
        .get("/api/reviews/2/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toHaveLength(3);

          comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              review_id: expect.any(Number),
            });
          });
        });
    });
    test("200: GET - responds with an empty array when queried with a review_id that exists but has no comments", () => {
      return request(app)
        .get("/api/reviews/1/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.comments).toHaveLength(0);
        });
    });
  });
});
