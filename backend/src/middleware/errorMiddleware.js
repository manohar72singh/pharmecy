const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);

  if (err.code === "LIMIT_FILE_SIZE")
    return res
      .status(400)
      .json({ success: false, message: "File too large. Max 5MB allowed." });

  if (err.code === "ER_DUP_ENTRY")
    return res
      .status(409)
      .json({
        success: false,
        message: "Duplicate entry. Record already exists.",
      });

  if (err.code === "ER_NO_REFERENCED_ROW_2")
    return res
      .status(400)
      .json({ success: false, message: "Referenced record not found." });

  if (err.name === "JsonWebTokenError")
    return res.status(401).json({ success: false, message: "Invalid token." });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

export default errorHandler;
