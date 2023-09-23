import { CustomError } from "./CustomError";

export class AuthorizationError extends CustomError {
  statusCode = 401;

  constructor() {
    super("Not Authorized");

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, new.target.prototype);
  }

  serializeErrors() {
    return [{ message: "Not Authorized" }];
  }
}
