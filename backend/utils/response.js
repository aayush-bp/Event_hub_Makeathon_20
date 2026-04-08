/**
 * Standard API response format
 * @param {object} data - Response data
 * @param {string} message - Response message
 * @param {boolean} success - Success status
 * @param {number} statusCode - HTTP status code
 * @returns {object} Formatted response
 */
exports.sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message,
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send success response
 */
exports.sendSuccess = (res, statusCode, message, data = null) => {
  return exports.sendResponse(res, statusCode, true, message, data);
};

/**
 * Send error response
 */
exports.sendError = (res, statusCode, message, data = null) => {
  return exports.sendResponse(res, statusCode, false, message, data);
};
