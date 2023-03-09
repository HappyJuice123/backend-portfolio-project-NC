exports.handle404NonExistentPaths = (req, res, next) => {
  res.status(404).send({ msg: "Not Found" });
};

exports.handlePSQL400s = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad Request" });
  } else if (err.code === "23502") {
    res.status(400).send({ msg: "Bad Request" });
  } else if (err.code === "23503") {
    res.status(404).send({ msg: "Not Found" });
  } else if (err.code === "42703") {
    res.status(400).send({ msg: "Bad Request" });
  } else {
    next(err);
  }
};

exports.handleCustomError = (err, req, res, next) => {
  if (err === "review_id not found") {
    res.status(404).send({ msg: "Not Found" });
  } else if (err === "Invalid input") {
    res.status(400).send({ msg: "Bad Request" });
  } else if (err === "Invalid query") {
    res.status(400).send({ msg: "Bad Request" });
  } else if (err === "No reviews found") {
    res.status(404).send({ msg: err });
  } else if (err === "no category found") {
    res.status(404).send({ msg: err });
  } else if (err === "comment_id does not exist") {
    res.status(404).send({ msg: err });
  } else if (err === "username does not exist") {
    res.status(404).send({ msg: err });
  } else if (err === "review_id does not exist") {
    res.status(404).send({ msg: err });
  } else {
    next(err);
  }
};

exports.handleServerError = (err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
};
