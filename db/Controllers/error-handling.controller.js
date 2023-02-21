exports.handle404NonExistentPaths = (req, res, next) => {
  res.status(404).send({ msg: "Not Found" });
};

exports.handlePSQL400s = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad Request" });
  } else {
    next(err);
  }
};

exports.handleCustomError = (err, req, res, next) => {
  if (err === "review_id not found") {
    res.status(404).send({ msg: "Not Found" });
  } else {
    next(err);
  }
};

exports.handleServerError = (err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
};
