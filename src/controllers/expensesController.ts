import { Request, Response } from "express";
import { db } from "..";
import { expensesTable } from "../db/schema";
import { StatusCodes } from "http-status-codes";
import { and, eq } from "drizzle-orm";

/* 
    getExpensesFromDB function
    - Fetch all expenses from the database
    - Respond with the expenses
*/
async function getExpensesFromDB(userId: string) {
  try {
    // Get all expenses from the database
    const result = await db
      .select()
      .from(expensesTable)
      .where(eq(expensesTable.userId, userId));
    return result;
  } catch (error) {
    console.error("Error fetching expenses from the database:", error);
    throw new Error("Could not fetch expenses");
  }
}

async function getExpenseWithIdFromDB(id: string, userId: string) {
  try {
    // Get the expense from the database
    const result = await db
      .select()
      .from(expensesTable)
      .where(and(eq(expensesTable.id, id), eq(expensesTable.userId, userId)));
    return result;
  } catch (error) {
    console.error("Error fetching expense from the database:", error);
    throw new Error("Could not fetch expense");
  }
}

/* 
    createExpenseInDB function
    - Create a new expense in the database
    - Respond with the created expense
*/
async function createExpenseInDB(expenseReq: Request["body"], userId: string) {
  // Check if the user is logged in
  if (!userId) {
    throw new Error("User not authenticated");
  }
  try {
    // Create a new expense in the database
    const result = await db
      .insert(expensesTable)
      .values({
        ...expenseReq,
        date: new Date(expenseReq.date),
      })
      .returning();
    return result;
  } catch (error) {
    console.error("Error creating expense in the database:", error);
    throw new Error("Could not create expense");
  }
}

// * GET /api/v1/expenses
//  - Fetch all expenses from the database
//  - Respond with a JSON object containing the expenses
export const getExpenses = async (req: Request, res: Response) => {
  const userId = req.userId as string;
  try {
    const expenses = await getExpensesFromDB(userId);
    res.status(StatusCodes.OK).json({ expenses });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send("Could not fetch expenses");
  }
};

// * GET /api/v1/expenses/:id
//  - Fetch an expense with the specified id from the database
//  - Respond with a JSON object containing the expense
export const getExpense = async (req: Request, res: Response) => {
  // Extract the id from the request parameters
  const { id } = req.params;
  const userId = req.userId as string;

  try {
    const expense = await getExpenseWithIdFromDB(id, userId);
    res.status(StatusCodes.OK).json({ expense });
  } catch (error) {
    console.error("Error fetching expense:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send("Could not fetch expense");
  }
};

// * POST /api/v1/expenses
//  - Create a new expense in the database
//  - Respond with the created expense
export const createExpense = async (req: Request, res: Response) => {
  // Extract the expense details from the request body
  const expenseReq = req.body;
  const userId = req.userId as string;

  // Try to create the expense in the database
  try {
    const result = await createExpenseInDB(expenseReq, userId);
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    console.error("Error creating expense:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send("Could not create expense");
  }
};

// !TODO: Implement the updateExpense function

// * DELETE /api/v1/expenses/:id
//  - Delete an expense from the database
//  - Respond with a 204 status code
export const deleteExpense = async (req: Request, res: Response) => {
  // Extract the id from the request parameters
  const { id } = req.params;
  const userId = req.userId as string;

  try {
    // Delete the expense from the database
    await db
      .delete(expensesTable)
      .where(and(eq(expensesTable.id, id), eq(expensesTable.userId, userId)));
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    console.error("Error deleting expense from the database:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send("Could not delete expense");
  }
};
