/**
 * Định nghĩa riêng một Class ApiError kế thừa class Error sẵn (điều này cần thiết và là Best Practice vì class Error nó là class built-in sẵn)
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.name = 'ApiError'
    // Gán thêm http status code của chúng ta ở đây
    this.statusCode = statusCode

    // Ghi lại Stack Trace (dấu vết ngăn xếp) để thuận tiện cho việc debug
    Error.captureStackTrace(this, this.constructor)
  }
}

export default ApiError