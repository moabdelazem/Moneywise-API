import { Router } from "express";
import { validateData } from "../middlewares/validationMiddleware";
import { createUserSchema } from "../db/schema";
import {
  createUserController,
  getUsersController,
} from "../controllers/authenticationController";

export const authRouter = Router()
  .get("/users", getUsersController)
  .post("/register", validateData(createUserSchema), createUserController)
  .delete("/:id", (req, res) => {
    res.send(`DELETE /expenses/${req.params.id}`);
  });
