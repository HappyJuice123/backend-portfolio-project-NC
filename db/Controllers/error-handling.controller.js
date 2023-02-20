exports.handleCustomError = (err, req, res, next) => {
  if (err === "could not find this data") {
    res.status(404).send({ msg: "Not Found" });
  } else {
    next(err);
  }
};

exports.handleServerError = (err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
};
