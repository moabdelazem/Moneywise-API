import { Router } from "express";
import {
  createExpense,
  deleteExpense,
  getExpense,
  getExpenses,
} from "../controllers/expensesController";
import { validateData } from "../middlewares/validationMiddleware";
import { createExpenseSchema } from "../db/schema";
import { isAuth } from "../middlewares/isAuth";

// Create a new router to handle the expenses routes
// * The router will be used as a middleware for the base route "/api/v1/expenses"
export const expensesRouter = Router()
  .get("/", isAuth, getExpenses)
  .get("/:id", isAuth, getExpense)
  .post("/", validateData(createExpenseSchema), createExpense)
  .delete("/:id", deleteExpense);
