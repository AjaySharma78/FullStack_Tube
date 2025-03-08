class ApiErrors extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = "Bad Request", errors = [], data = null) {
    return new ApiErrors(400, message, errors, data);
  }

  static unauthorized(message = "Unauthorized", errors = [], data = null) {
    return new ApiErrors(401, message, errors, data);
  }

  static invalidToken(message = "Invalid Token", errors = [], data = null) {
    return new ApiErrors(401, message, errors, data);
  }

  static forbidden(message = "Forbidden", errors = [], data = null) {
    return new ApiErrors(403, message, errors, data);
  }

  static notFound(message = "Not Found", errors = [], data = null) {
    return new ApiErrors(404, message, errors, data);
  }

  static internal(message = "Internal Server Error", errors = [], data = null) {
    return new ApiErrors(500, message, errors, data);
  }
}

export { ApiErrors };
