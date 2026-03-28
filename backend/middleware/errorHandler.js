const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  let message = err.message || "Internal Server Error";
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Extract OpenAI error if available
  if (err.response?.data?.error?.message) {
    message = err.response.data.error.message;
  }

  res.status(statusCode).json({
    error: message,
  });
};

module.exports = { errorHandler };
