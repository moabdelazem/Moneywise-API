import { Router } from "express";
import { validateData } from "../middlewares/validationMiddleware";
import { createUserSchema, loginUserSchema } from "../db/schema";
import {
  createUserController,
  getUsersController,
  loginUserController,
} from "../controllers/authenticationController";
import { isAuth } from "../middlewares/isAuth";

/**
 * Defines the routes for authentication-related operations.
 *
 * - `GET /users`: Retrieves a list of users. Requires authentication.
 * - `POST /register`: Registers a new user. Validates the request data against `createUserSchema`.
 * - `POST /login`: Logs in a user. Validates the request data against `loginUserSchema`.
 *
 * Middleware:
 * - `isAuth`: Ensures the user is authenticated.
 * - `validateData(schema)`: Validates the request data against the provided schema.
 */
export const authRouter = Router()
  .get("/users", isAuth, getUsersController)
  .get("/me", isAuth, (req, res) => {
    res.status(200).json({ user: req.userId });
  })
  .post("/register", validateData(createUserSchema), createUserController)
  .post("/login", validateData(loginUserSchema), loginUserController);
