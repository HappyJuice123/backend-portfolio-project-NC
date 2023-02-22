\c nc_games_test

SELECT * FROM users;
SELECT * FROM comments;

INSERT INTO comments
(body, votes, review_id, created_at, author)
VALUES
('hello', 0, 1, '2017-11-22 12:43:33.389', (SELECT username FROM users WHERE username = 'HappyJuice123'))
RETURNING *;