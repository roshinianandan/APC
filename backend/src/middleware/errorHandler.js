export function errorHandler(err, req, res, next) {
  console.error("ERROR:", err);

  // Mongo duplicate key error
  if (err && err.code === 11000) {
    const keys = err.keyValue || {};
    const field = Object.keys(keys)[0] || "field";
    const value = keys[field];

    return res.status(409).json({
      success: false,
      message: `${field} already exists: ${value}`
    });
  }

  // Custom AppError
  if (err && err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  return res.status(500).json({
    success: false,
    message: err && err.message ? err.message : "Server error"
  });
}
