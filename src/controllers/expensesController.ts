import { Request, Response } from "express";
import { db } from "..";
import { expensesTable } from "../db/schema";
import { StatusCodes } from "http-status-codes";
import { eq } from "drizzle-orm";

/* 
    ? We need to generate tokens for the user to authenticate the requests
    ? user can not query the expenses without being authenticated with a token
    ? This will be next task to implement
    ! For Now Any User Can Do Anything!!! => NO AUTHENTICATION IMPELEMENTED YET
*/

/* 
    getExpensesFromDB function
    - Fetch all expenses from the database
    - Respond with the expenses
*/
async function getExpensesFromDB() {
  try {
    // Get all expenses from the database
    const result = await db.select().from(expensesTable);
    return result;
  } catch (error) {
    console.error("Error fetching expenses from the database:", error);
    throw new Error("Could not fetch expenses");
  }
}

async function getExpenseWithIdFromDB(id: string) {
  try {
    // Get the expense from the database
    const result = await db
      .select()
      .from(expensesTable)
      .where(eq(expensesTable.id, id));
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
async function createExpenseInDB(expenseReq: Request["body"]) {
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
  try {
    const expenses = await getExpensesFromDB();
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

  try {
    const expense = await getExpenseWithIdFromDB(id);
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

  // Try to create the expense in the database
  try {
    const result = await createExpenseInDB(expenseReq);
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

  try {
    // Delete the expense from the database
    await db.delete(expensesTable).where(eq(expensesTable.id, id));
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    console.error("Error deleting expense from the database:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send("Could not delete expense");
  }
};
