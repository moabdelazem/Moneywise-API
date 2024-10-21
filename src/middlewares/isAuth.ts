import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import chalk from "chalk";

// Extend the Request interface to include userId
declare module "express-serve-static-core" {
  interface Request {
    userId?: string | object;
  }
}

/**
 * Middleware to check if the request is authenticated.
 *
 * This middleware function checks for the presence of an Authorization token
 * in the request headers. If the token is present, it verifies the token using
 * the JWT_SECRET environment variable. If the token is valid, it attaches the
 * decoded token to the request object for further use. If the token is missing
 * or invalid, it responds with a 401 status code and an error message.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function in the stack.
 *
 * @throws Will throw an error if the token is undefined or invalid.
 */
export function isAuth(req: Request, res: Response, next: NextFunction) {
  // Get the Authorization header from the request
  const authHeader = req.get("Authorization");
  // If the Authorization header is missing, respond with a 401 status code
  if (!authHeader) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  // Split the Authorization header to get the token
  const token = req.get("Authorization")?.split(" ")[1];
  let decodeToken;

  // Verify the token using the JWT_SECRET environment variable
  try {
    if (!token) {
      throw new Error("Token is undefined");
    }
    // Decode the token
    decodeToken = jwt.verify(token, process.env.JWT_SECRET as string);
  } catch {
    // Log the error and respond with a 401 status code
    console.log(chalk.bgRedBright("Error in isAuth middleware: "));
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  // If the token is invalid, respond with a 401 status code
  if (!decodeToken) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  // Attach the decoded token to the request object for further use
  req.userId = decodeToken;
  next();
}
