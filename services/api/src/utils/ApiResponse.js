export class ApiResponse {
  constructor(statusCode, data = null, message = "Success") {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

export function sendSuccess(res, { statusCode = 200, data = null, message = "Success" } = {}) {
  return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
}
