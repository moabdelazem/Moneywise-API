import { Router } from "express";
import { validateData } from "../middlewares/validationMiddleware";
import { createUserSchema, loginUserSchema } from "../db/schema";
import {
  createUserController,
  getUsersController,
  loginUserController,
} from "../controllers/authenticationController";

export const authRouter = Router()
  .get("/users", getUsersController)
  .post("/register", validateData(createUserSchema), createUserController)
  .post("/login", validateData(loginUserSchema), loginUserController)
  .delete("/:id", (req, res) => {
    res.send(`DELETE /expenses/${req.params.id}`);
  });
