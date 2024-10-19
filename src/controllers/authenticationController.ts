import { Request, Response } from "express";
import { usersTable } from "../db/schema";
import { db } from "..";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

// createUserController function
// - Create a new user in the database
// - Respond with the created user
// - If the user already exists, return an error
export const createUserController = async (req: Request, res: Response) => {
  const { username, email, hashedPassword, monthlyIncome } = req.body;

  try {
    // Check if the user already exists
    const userExists = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    // If the user already exists, return an error
    if (userExists.length > 0) {
      res.status(400).json({ error: "User already exists" });
    }

    // Validate the input
    if (!username || !email || !hashedPassword || !monthlyIncome) {
      res.status(400).json({ error: "All fields are required" });
    }

    // Enhance the hash by adding a salt and hashing the password
    const saltRounds = 12;
    const fullHashedPassword = await bcrypt.hash(hashedPassword, saltRounds);

    // Create the user in the database
    const newUser = await db
      .insert(usersTable)
      .values({
        username,
        email,
        hashedPassword: fullHashedPassword,
        monthlyIncome: monthlyIncome,
      })
      .returning();

    // Respond with the created user
    res.status(201).json({ user: newUser[0] });
  } catch (error) {
    console.error("Error creating user in the database:", error);
    res.status(500).json({ error: "Could not create user" });
  }
};

// ! For testing purposes only
// ! not real endpoint in the application
export const getUsersController = async (_req: Request, res: Response) => {
  try {
    const users = await db.select().from(usersTable);
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users from the database:", error);
    res.status(500).json({ error: "Could not fetch users" });
  }
};
