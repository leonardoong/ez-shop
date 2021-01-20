function errorHandler(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ message: "User not authorized", error: err });
  }

  if (err.name === "ValidationError") {
    res.status(401).json({ error: err });
  }

  return res.status(500).json({message: "Server Error", error: err})
}

module.exports = errorHandler;
