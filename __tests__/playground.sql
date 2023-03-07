\c nc_games_test

SELECT reviews.review_id, reviews.title, reviews.designer, reviews.owner, reviews.review_img_url, reviews.review_body, reviews.category, reviews.created_at, reviews.votes, COUNT(comments.review_id) AS comment_count, 
  (SELECT COUNT(*) AS total_count FROM reviews)
    FROM reviews
    LEFT JOIN comments
    ON reviews.review_id = comments.review_id
    GROUP BY reviews.review_id
    ORDER BY reviews.review_id
    LIMIT 10 OFFSET 2;