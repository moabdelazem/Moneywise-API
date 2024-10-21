/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: API for managing expenses
 */

/**
 * @swagger
 * /expenses:
 *   get:
 *     summary: Fetch all expenses
 *     tags: [Expenses]
 *     responses:
 *       200:
 *         description: A list of expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Expense'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /expenses/{id}:
 *   get:
 *     summary: Fetch an expense by ID
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The expense ID
 *     responses:
 *       200:
 *         description: The expense data
 *         content:
 *           application/json:
 *             schema:
 *
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       201:
 *         description: The created expense
 *         content:
 *           application/json:
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /expenses/{id}:
 *   delete:
 *     summary: Delete an expense by ID
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The expense ID
 *     responses:
 *       204:
 *         description: No content
 *       500:
 *         description: Internal server error
 */

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
