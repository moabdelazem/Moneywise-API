import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";

interface ErrorMessage {
  message: string;
}

interface ValidationErrorResponse {
  error: string;
  details: ErrorMessage[];
}

interface InternalServerErrorResponse {
  error: string;
}

/**
 * Middleware to validate request data against a given Zod schema.
 *
 * @param schema - The Zod schema to validate the request data against.
 * @returns A middleware function that validates the request body and calls the next middleware if valid.
 *          If validation fails, it responds with a 400 status code and validation error details.
 *          If an unexpected error occurs, it responds with a 500 status code and an internal server error message.
 */
export function validateData(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages: ErrorMessage[] = error.errors.map(
          (issue: any) => ({
            message: `${issue.path.join(".")} is ${issue.message}`,
          })
        );
        const response: ValidationErrorResponse = {
          error: "Invalid data",
          details: errorMessages,
        };
        res.status(StatusCodes.BAD_REQUEST).json(response);
      } else {
        const response: InternalServerErrorResponse = {
          error: "Internal Server Error",
        };
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);
      }
    }
  };
}
