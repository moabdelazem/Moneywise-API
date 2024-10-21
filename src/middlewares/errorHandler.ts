import chalk from "chalk";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Middleware function to handle errors in the application.
 *
 * @param err - The error object.
 * @param _req - The request object (unused).
 * @param res - The response object.
 * @param next - The next middleware function in the stack.
 *
 * Logs the error message, sets the appropriate status code, and sends a JSON response
 * with the error message and stack trace (if not in production).
 */
function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error message
  console.log(chalk.redBright(err.message));

  // Set the status code and send the error message
  const statusCode =
    res.statusCode === StatusCodes.OK
      ? StatusCodes.INTERNAL_SERVER_ERROR
      : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });

  next();
}

export default errorHandler;
