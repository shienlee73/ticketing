import { CustomError } from "./CustomError";

export class DatabaseConnectionError extends CustomError {
  statusCode = 500;
  reason = "Failed to connect to database";

  constructor() {
    super("Failed to connect to database");

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, new.target.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
