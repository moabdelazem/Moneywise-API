import { Request, Response } from "express";
import { usersTable } from "../db/schema";
import { db } from "..";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";

// Infer the type of the user object from the usersTable
type NewUser = typeof usersTable.$inferInsert;

/**
 * ! This function is not yet correct. There is something wrong with the way it behave.
 * ? we need to fix this function to make it work correctly
 * Retrieves a user from the database based on the provided username.
 *
 * @param username - The username of the user to retrieve.
 * @returns A promise that resolves to the user object if found, or an Error if the user is not found.
 */
const getUserFromDB = async (username: string) => {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  return user.length ? user[0] : new Error("User not found");
};

/**
 * Registers a new user by hashing their password and inserting their details into the database.
 *
 * @param user - An object containing the new user's details, including their password.
 * @returns A promise that resolves to the newly created user.
 * @throws An error if the user could not be inserted into the database.
 */
const registerUser = async (user: NewUser) => {
  try {
    // Hash the user's password
    const hashedPassword = await bcrypt.hash(user.password, 10);

    // Insert the new user into the database
    const newUser = await db
      .insert(usersTable)
      .values({
        ...user,
        password: hashedPassword,
      })
      .returning();

    return newUser;
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error registering user:", error);

    // Enhance the error message
    (error as Error).message = "Could not register user";

    // Pass the error to the middleware
    throw error;
  }
};

/**
 * Controller to handle user creation.
 *
 * @param req - Express request object containing user details in the body.
 * @param res - Express response object to send back the appropriate response.
 *
 * @remarks
 * This function checks if a user already exists in the database. If the user exists,
 * it responds with a 409 status code and an error message. If the user does not exist,
 * it registers the new user and responds with a 201 status code and the new user details.
 *
 * @throws Will respond with a 500 status code and an error message if an unexpected error occurs.
 */
export const createUserController = async (req: Request, res: Response) => {
  try {
    // Extract the user details from the request body
    const { username, email, password, monthlyIncome } = req.body;

    // Check if the user already exists in the database
    const userExists = await getUserFromDB(username);

    // Check if the email already exists in the database
    const emailExists = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    // If the email already exists, return a 409 Conflict
    if (emailExists.length) {
      res.status(StatusCodes.CONFLICT).json({ error: "Email already exists" });
      return;
    }

    // If the user already exists, return a 409 Conflict response
    if (typeof userExists !== "undefined" && !(userExists instanceof Error)) {
      res.status(StatusCodes.CONFLICT).json({ error: "User already exists" });
      return;
    }

    // Register the new user
    const newUser = await registerUser({
      username,
      email,
      password,
      monthlyIncome,
    });

    // Return a 201 Created response with the new user object
    res.status(StatusCodes.CREATED).json({ user: newUser });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: (error as Error).message });
  }
};

/**
 * Controller function to handle user login.
 *
 * @param req - The request object containing the username and password in the body.
 * @param res - The response object used to send back the appropriate HTTP response.
 * @returns A promise that resolves to void.
 *
 * This function performs the following steps:
 * 1. Extracts the username and password from the request body.
 * 2. Fetches the user from the database based on the provided username.
 * 3. If the user does not exist, returns a 401 Unauthorized response.
 * 4. Compares the provided password with the hashed password stored in the database.
 * 5. If the passwords do not match, returns a 401 Unauthorized response.
 * 6. If the passwords match, returns a 200 OK response with the user object.
 */
export const loginUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Extract the username and password from the request body
  const { username, password } = req.body;

  // Fetch the user from the database
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  // If the user does not exist, return a 401 Unauthorized response
  if (!user.length) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid credentials" });
    return;
  }

  // Compare the password from the request body with the hashed password from the database
  const isPasswordValid = await bcrypt.compare(password, user[0].password);

  // If the passwords do not match, return a 401 Unauthorized response
  if (!isPasswordValid) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid credentials" });
    return;
  }

  // Return a 200 OK response with the user object
  res.status(StatusCodes.OK).json({ user: user[0] });
};

/**
 * Controller to handle fetching users from the database.
 * ! This controller is for testing purposes only and should not be used in a production application.
 *
 * @param _req - The request object (not used in this controller).
 * @param res - The response object used to send the result back to the client.
 *
 * @returns A JSON response with the list of users or an error message.
 *
 * @throws Will return a 500 status code and an error message if there is an issue fetching users from the database.
 */
export const getUsersController = async (_req: Request, res: Response) => {
  try {
    const users = await db.select().from(usersTable);
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users from the database:", error);
    res.status(500).json({ error: "Could not fetch users" });
  }
};
