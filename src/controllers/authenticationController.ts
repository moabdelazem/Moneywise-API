import { Request, Response } from "express";
import { usersTable } from "../db/schema";
import { db } from "..";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

type NewUser = typeof usersTable.$inferInsert;

// getUserFromDB function
// - Fetch the user from the database using the email
// - Return the user if found
const getUserFromDB = async (email: string) => {
  try {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    return user;
  } catch (error) {
    console.error("Error fetching user from the database:", error);
    throw new Error("Could not fetch user");
  }
};

// registerUser function
// - Hash the user's password
// - Insert the user into the database
const registerUser = async (user: NewUser) => {
  try {
    // Hash the user's password
    const hashedPassword = await bcrypt.hash(user.password, 10);

    // Insert the user into the database
    const newUser = await db
      .insert(usersTable)
      .values({
        ...user,
        password: hashedPassword,
      })
      .returning();

    return newUser;
  } catch (error) {
    console.error("Error inserting user into the database:", error);
    throw new Error("Could not insert user");
  }
};

// createUserController function
// - Create a new user in the database
// - Respond with the created user
// - If the user already exists, return an error
export const createUserController = async (req: Request, res: Response) => {
  // Get the user data from the request body
  const { username, email, password, monthlyIncome } = req.body;

  // Check if the user already exists in the database
  const userExists = await getUserFromDB(email);

  // If the user already exists, return an error
  if (userExists.length > 0) {
    res.status(400).json({ error: "User already" });
  }

  // if the user does not exist, create a new user
  try {
    const newUser = await registerUser({
      username,
      email,
      password,
      monthlyIncome,
    });

    res.status(201).json({ user: newUser });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
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
