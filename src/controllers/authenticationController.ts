import { Request, Response } from "express";
import { usersTable } from "../db/schema";
import { db } from "..";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

// Infer the type of the user object from the usersTable
type NewUser = typeof usersTable.$inferInsert;

/**
 * Checks if a user with the given username and email exists in the database.
 *
 * @param username - The username to check for.
 * @param email - The email to check for.
 * @returns A promise that resolves to the user object if found, or an error if the user is not found.
 */
const checkIfUserExists = async (username: string, email: string) => {
  const user = await db
    .select()
    .from(usersTable)
    .where(or(eq(usersTable.username, username), eq(usersTable.email, email)));

  return user.length > 0;
};

/**
 * Checks if a user exists with the given username.
 *
 * @param username - The username to check for existence.
 * @returns A promise that resolves to a boolean indicating whether the user exists.
 */
const checkIfUserExistsWithUsername = async (username: string) => {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));

  return user;
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
    // hash the user's password and then insert the user into the database
    const [newUser] = await db
      .insert(usersTable)
      .values({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      })
      .returning();
    return newUser;
  } catch (error) {
    console.error("Error registering user:", error);
    throw new Error("Could not register user");
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
  // Extract the user details from the request body
  const { username, email, password, monthlyIncome } = req.body;

  try {
    // Validate input fields
    if (!username || !email || !password || !monthlyIncome) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "All fields are required" });
      return;
    }

    // Check if the user already exists
    const userExists = await checkIfUserExists(username, email);

    // If the user already exists, return a 409 Conflict response
    if (userExists) {
      res.status(StatusCodes.CONFLICT).json({ error: "User already exists" });
      return;
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user object
    const newUser: NewUser = {
      username,
      email,
      password: hashedPassword,
      monthlyIncome,
    };

    // Register the new user
    const user = await registerUser(newUser);

    // Generate a JWT token for the user
    const userToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Respond with the new user and token
    res.status(StatusCodes.CREATED).json({ user, token: userToken });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Could not create user" });
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
  const { username, password } = req.body;

  try {
    // Check if the user exists
    const user = await checkIfUserExistsWithUsername(username);
    if (!user) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Invalid username or password" });
      return;
    }

    // Check if the passowrd is correct
    const passwordMatch = await bcrypt.compare(password, user[0].password);

    // If the password does not match, return a 401 Unauthorized response
    if (!passwordMatch) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Invalid username or password" });
      return;
    }

    // Generate a JWT token for the user
    const userToken = jwt.sign(
      { userId: user[0].id, username: user[0].username },
      process.env.JWT_SECRET as string
    );

    // Respond with the new user and token
    res.status(StatusCodes.CREATED).json({ user, token: userToken });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Could not log in user",
    });
  }
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
