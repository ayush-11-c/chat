const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";
  if (err.code === 11000 && err.keyValue) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err.message = message;
    err.statusCode = 400;
  }
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err.message = message;
    err.statusCode = 400;
  }
  res.status(err.statusCode).json({
    success: false,
    error: err.stack,
    message: err.message,
  });
};
export { errorMiddleware };
