const statusAPI = {
  OK: {
    message: "Send successfuly",
    code: 200,
  },
  CREATED: {
    message: "Created successfuly",
    code: 201,
  },
  ACCEPTED: {
    message: "Accepted successfuly",
    code: 202,
  },
  BAD_REQUEST: {
    message: "BadRequest, please try again",
    code: 400,
  },
  UNAUTHORIZED: {
    message: "Unauthorized",
    code: 401,
  },
  FORBIDDEN: {
    message: "Forbidden",
    code: 403,
  },
  NOT_FOUND: {
    message: "NotFound",
    code: 404,
  },
  METHOD_NOT_ALLOWED: {
    message: "MethodNotAllowed",
    code: 405,
  },
};

module.exports = statusAPI;
