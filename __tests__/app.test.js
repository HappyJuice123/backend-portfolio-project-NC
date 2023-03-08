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
  describe("/api", () => {
    test("200: responds with a JSON object showing all the endpoints", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          const { endpoints } = body;
          expect(endpoints).toMatchObject({
            "GET /api/categories": expect.any(Object),
            "GET /api/reviews": expect.any(Object),
            "GET /api/reviews/:review_id": expect.any(Object),
            "GET /api/reviews/:review_id/comments": expect.any(Object),
            "POST /api/reviews/:review_id/comments": expect.any(Object),
            "PATCH /api/reviews/:review_id": expect.any(Object),
            "GET /api/users": expect.any(Object),
            "DELETE /api/comments/:comment_id": expect.any(Object),
          });
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
          expect(reviews).toHaveLength(10);
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

          expect(reviews).toHaveLength(10);
          expect(reviewsSorted).toEqual(reviews);
        });
    });
    test("200: GET - responds with reviews filtered by category", () => {
      return request(app)
        .get("/api/reviews?category=social deduction")
        .expect(200)
        .then(({ body }) => {
          const { reviews } = body;
          expect(reviews).toHaveLength(10);
          reviews.forEach((review) => {
            expect(review).toMatchObject({
              review_id: expect.any(Number),
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
    test("400: GET - responds with a msg of no bad request if given an invalid category", () => {
      return request(app)
        .get("/api/reviews?category=notACategory")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test('200: GET - responds with a msg of "no reviews found" if given a valid category but has no reviews', () => {
      return request(app)
        .get("/api/reviews?category=children's games")
        .expect(200)
        .then(({ body }) => {
          expect(body.reviews).toHaveLength(0);
        });
    });
    test("200: GET - responds with reviews sorted by any valid column", () => {
      return request(app)
        .get("/api/reviews?sort_by=title")
        .expect(200)
        .then(({ body }) => {
          const { reviews } = body;
          expect(reviews).toHaveLength(10);
          expect(reviews).toBeSortedBy("title", { descending: true });
        });
    });
    test("400: GET - responds with a msg of Bad Request if given an invalid sort_by column", () => {
      return request(app)
        .get("/api/reviews?sort_by=notAColumn")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("200: GET - responds with reviews sorted by a valid column in ascending order", () => {
      return request(app)
        .get("/api/reviews?sort_by=owner&order=ASC")
        .expect(200)
        .then(({ body }) => {
          const { reviews } = body;
          expect(reviews).toHaveLength(10);
          expect(reviews).toBeSortedBy("owner", { descending: false });
        });
    });
    test("400: GET - responds with a msg of Bad Request if given an invalid order query", () => {
      return request(app)
        .get("/api/reviews?sort_by=owner&order=invalidOrderQuery")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("200: GET - responds with object of first 10 reviews only and an additional key value pair of the total count of all reviews", () => {
      return request(app)
        .get("/api/reviews?limit=10&p=1")
        .expect(200)
        .then(({ body }) => {
          const { reviews } = body;
          expect(reviews).toHaveLength(10);
          reviews.map((review) => {
            expect(review).toMatchObject({
              review_id: expect.any(Number),
              title: expect.any(String),
              designer: expect.any(String),
              owner: expect.any(String),
              review_img_url: expect.any(String),
              review_body: expect.any(String),
              category: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(String),
              total_count: "13",
            });
          });
        });
    });
    test("200: GET - responds with object of second page of 3 reviews with a limit of 10", () => {
      return request(app)
        .get("/api/reviews?limit=10&p=2")
        .expect(200)
        .then(({ body }) => {
          const { reviews } = body;
          expect(reviews).toHaveLength(3);
          reviews.map((review) => {
            expect(review).toMatchObject({
              review_id: expect.any(Number),
              title: expect.any(String),
              designer: expect.any(String),
              owner: expect.any(String),
              review_img_url: expect.any(String),
              review_body: expect.any(String),
              category: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(String),
              total_count: "13",
            });
          });
        });
    });
    test("400: GET - responds with a msg of bad request when passed a limit that isn't a number", () => {
      return request(app)
        .get("/api/reviews?limit=hi&p=2")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad Request");
        });
    });
    test("200: GET - responds with an empty array", () => {
      return request(app)
        .get("/api/reviews?limit=10&p=3")
        .expect(200)
        .then(({ body }) => {
          const { reviews } = body;
          expect(reviews).toHaveLength(0);
        });
    });
    test("201: POST - responds with an object of the newly added review", () => {
      newReview = {
        title: "Catan",
        designer: "Klaus Teuber",
        owner: "mallionaire",
        review_body: "Building fun!",
        category: "euro game",
        review_img_url:
          "https://preview.redd.it/avjpjuwxwe841.jpg?width=1440&format=pjpg&auto=webp&v=enabled&s=dababb7ed0ae76c63e68039e084bdc2691dd5919",
      };
      return request(app)
        .post("/api/reviews")
        .send(newReview)
        .expect(201)
        .then(({ body }) => {
          const { newReview } = body;

          expect(newReview).toMatchObject({
            review_id: expect.any(Number),
            title: "Catan",
            designer: "Klaus Teuber",
            owner: "mallionaire",
            review_body: "Building fun!",
            category: "euro game",
            review_img_url: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            comment_count: expect.any(String),
          });
        });
    });
    test("201: POST - responds with an object of the newly added review with the review_img_url defaulting if it is not given", () => {
      newReview = {
        title: "Catan",
        designer: "Klaus Teuber",
        owner: "mallionaire",
        review_body: "Building fun!",
        category: "euro game",
      };
      return request(app)
        .post("/api/reviews")
        .send(newReview)
        .expect(201)
        .then(({ body }) => {
          const { newReview } = body;

          expect(newReview).toMatchObject({
            review_id: expect.any(Number),
            title: "Catan",
            designer: "Klaus Teuber",
            owner: "mallionaire",
            review_body: "Building fun!",
            category: "euro game",
            review_img_url:
              "https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?w=700&h=700",
            created_at: expect.any(String),
            votes: expect.any(Number),
            comment_count: expect.any(String),
          });
        });
    });
    test("404: POST - responds with a msg of not found when given an owner that does not exist", () => {
      newReview = {
        title: "Catan",
        designer: "Klaus Teuber",
        owner: "NotAOwner",
        review_body: "Building fun!",
        category: "euro game",
        review_img_url:
          "https://preview.redd.it/avjpjuwxwe841.jpg?width=1440&format=pjpg&auto=webp&v=enabled&s=dababb7ed0ae76c63e68039e084bdc2691dd5919",
      };
      return request(app)
        .post("/api/reviews")
        .send(newReview)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found");
        });
    });
    test("400: POST - responds with a msg of bad request when given a missing property", () => {
      newReview = {
        title: "Catan",
        designer: "Klaus Teuber",
        review_body: "Building fun!",
        category: "euro game",
        review_img_url:
          "https://preview.redd.it/avjpjuwxwe841.jpg?width=1440&format=pjpg&auto=webp&v=enabled&s=dababb7ed0ae76c63e68039e084bdc2691dd5919",
      };
      return request(app)
        .post("/api/reviews")
        .send(newReview)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
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
            comment_count: "0",
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
    test("400: responds with bad request given invalid review id", () => {
      return request(app)
        .patch("/api/reviews/invalidReviewId")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("400: responds with bad request given an invalid key in updateReview", () => {
      const updateReview = { count: 8 };
      return request(app)
        .patch("/api/reviews/1")
        .send(updateReview)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
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
    test("200: GET - responds with a default of 10 maximum when limit is not specified", () => {
      return request(app)
        .get("/api/reviews/2/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toHaveLength(3);
          comments.map((comment) => {
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
    test("200: GET - responds with a length of one when limit is passed as one", () => {
      return request(app)
        .get("/api/reviews/2/comments?limit=1")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toHaveLength(1);
          comments.map((comment) => {
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
    test("200: GET - responds with an empty array when passed limit=10 and p=2", () => {
      return request(app)
        .get("/api/reviews/2/comments?limit=10&p=2")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toHaveLength(0);
        });
    });
    test("400: GET - responds with a msg of bad request when passed a limit that isn't a number", () => {
      return request(app)
        .get("/api/reviews/2/comments?limit=hi&p=2")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad Request");
        });
    });
    test("400: GET - responds with a msg of bad request when passed a p that isn't a number", () => {
      return request(app)
        .get("/api/reviews/2/comments?limit=10&p=hi")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad Request");
        });
    });
    test("201: POST - adds an object onto comments with the properties username and body and responds with the posted comment", () => {
      const newComment = {
        username: "mallionaire",
        body: "i like umbrellas",
      };

      return request(app)
        .post("/api/reviews/1/comments")
        .send(newComment)
        .expect(201)
        .then(({ body }) => {
          const { addComment } = body;
          expect(addComment).toMatchObject({
            comment_id: 7,
            body: "i like umbrellas",
            votes: expect.any(Number),
            author: "mallionaire",
            review_id: 1,
            created_at: expect.any(String),
          });
        });
    });
    test("201: POST - responds with the added comment when passed in extra properties that are to be ignored", () => {
      const newComment = {
        username: "mallionaire",
        body: "i like umbrellas",
        msg: "whats up",
      };

      return request(app)
        .post("/api/reviews/1/comments")
        .send(newComment)
        .expect(201)
        .then(({ body }) => {
          const { addComment } = body;
          expect(addComment).toMatchObject({
            comment_id: 7,
            body: "i like umbrellas",
            votes: expect.any(Number),
            author: "mallionaire",
            review_id: 1,
            created_at: expect.any(String),
          });
        });
    });

    test("404: POST - responds with msg when sent a query with a valid but non-existent review_id", () => {
      const newComment = {
        username: "mallionaire",
        body: "i like cats",
      };

      return request(app)
        .post("/api/reviews/50000/comments")
        .send(newComment)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found");
        });
    });
    test("400: POST - responds with msg when sent a query with a non-valid review_id", () => {
      const newComment = {
        username: "mallionaire",
        body: "i like cats",
      };

      return request(app)
        .post("/api/reviews/notANumber/comments")
        .send(newComment)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("404: POST - responds with msg when sent a query with a username that does not exist", () => {
      const newComment = {
        username: "hello123",
        body: "i like cats",
      };

      return request(app)
        .post("/api/reviews/1/comments")
        .send(newComment)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found");
        });
    });
    test("400: POST - responds with bad request given a missing property in new comment", () => {
      const newComment = {
        username: "mallionaire",
      };
      return request(app)
        .post("/api/reviews/1/comments")
        .send(newComment)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
  });
  describe("/api/users", () => {
    test("200: GET - responds with an array of users", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          const { users } = body;
          expect(users).toHaveLength(4);
          users.forEach((user) => {
            expect(user).toMatchObject({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            });
          });
        });
    });
  });
  describe("/api/users/:username", () => {
    test("200: GET - responds with an array of a user with the given username", () => {
      return request(app)
        .get("/api/users/mallionaire")
        .expect(200)
        .then(({ body }) => {
          const { user } = body;
          expect(user).toEqual({
            username: "mallionaire",
            name: "haz",
            avatar_url:
              "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
          });
        });
    });
    test("404: GET - responds with a msg when passed a username that does not exist", () => {
      return request(app)
        .get("/api/users/notAUser")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("username does not exist");
        });
    });
  });
  describe("/api/comments/:comment_id", () => {
    test("204: DELETE - responds with status code 204 returning nothing", () => {
      return request(app)
        .delete("/api/comments/2")
        .expect(204)
        .then((response) => {
          expect(response.res.statusMessage).toBe("No Content");
        });
    });
    test("404: DELETE - responds with a msg of comment_id does not exist when given a valid but non-existent comment id", () => {
      return request(app)
        .delete("/api/comments/2222")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("comment_id does not exist");
        });
    });
    test("400: DELETE - responds with a msg of Bad Request when given a non valid comment_id", () => {
      return request(app)
        .delete("/api/comments/notAValidCommentId")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("200: PATCH - responds with an object with the number of votes updated on the comment when a given a number to increase the vote by", () => {
      const incVote = { inc_votes: 1 };

      return request(app)
        .patch("/api/comments/3")
        .send(incVote)
        .expect(200)
        .then(({ body }) => {
          const { comment } = body;
          expect(comment).toEqual({
            comment_id: 3,
            body: "I didn't know dogs could play games",
            votes: 11,
            author: "philippaclaire9",
            review_id: 3,
            created_at: new Date(1610964588110).toISOString(),
          });
        });
    });
    test("400: PATCH - responds with a msg of Bad Request when given a non valid comment_id", () => {
      const incVote = { inc_votes: 1 };
      return request(app)
        .patch("/api/comments/notAValidCommentId")
        .send(incVote)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    test("404: PATCH - responds with a msg of comment_id does not exist when given a valid but non-existent comment id", () => {
      const incVote = { inc_votes: 1 };
      return request(app)
        .patch("/api/comments/2222")
        .send(incVote)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("comment_id does not exist");
        });
    });
    test("400: PATCH - responds with a msg of bad request when given non integer for the inc_votes value", () => {
      const incVote = { inc_votes: "notAInteger" };
      return request(app)
        .patch("/api/comments/3")
        .send(incVote)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
  });
});
