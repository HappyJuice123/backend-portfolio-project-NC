exports.handle404NonExistentPaths = (req, res, next) => {
  res.status(404).send({ msg: "Not Found" });
};

exports.handlePSQL400s = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad Request" });
  } else if (err.code === "23502") {
    res.status(400).send({ msg: "Bad Request" });
<<<<<<< HEAD
  } else if (err.code === "23503") {
    res.status(400).send({ msg: "Bad Request" });
=======
>>>>>>> 7c00c948b7b310f2b8334f1132d9da964c7f5864
  } else {
    next(err);
  }
};

exports.handleCustomError = (err, req, res, next) => {
  if (err === "review_id not found") {
    res.status(404).send({ msg: "Not Found" });
  } else if (err === "Invalid input") {
    res.status(400).send({ msg: "Bad Request" });
  } else {
    next(err);
  }
};

exports.handleServerError = (err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
};
