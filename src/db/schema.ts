import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Email regex pattern for basic validation (RFC 5322 compliant)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dateRestriction = /^\d{4}-\d{2}-\d{2}$/; // date format: YYYY-MM-DD

/* 
    !!!!!
        TODO: Still Creating the schema to assure the database is created correctly and being normalized
    !!!!!
*/

/**
 * Defines the schema for the "users" table in the database.
 *
 * The table includes the following columns:
 * - `id`: A unique identifier for each user, generated using the `uuid_generate_v4()` function.
 * - `username`: A unique username for the user, with a maximum length of 50 characters.
 * - `email`: A unique email address for the user, with a maximum length of 255 characters.
 * - `hashed_password`: The hashed password for the user, with a maximum length of 255 characters.
 * - `created_at`: The timestamp when the user was created, with a default value of the current time.
 */
const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  hashedPassword: varchar("hashed_password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  monthlyIncome: numeric("monthly_income", {
    precision: 10,
    scale: 2,
  }).notNull(),
});

// create zod schema for the user
// ? zod is a validation library that helps you validate data
// * we use it to validate the data before inserting it into the database (request body)
export const createUserSchema = createInsertSchema(usersTable, {
  username: z.string().min(1).max(50),
  email: z.string().email().max(255).regex(emailRegex),
  hashedPassword: z.string().min(1).max(255),
});

/**
 * Defines the schema for the "expenses" table in the database.
 *
 * The table includes the following columns:
 * - `id`: A unique identifier for each expense, generated randomly by default.
 * - `userId`: A foreign key referencing the `id` column in the `usersTable`. This field is required and has a cascading delete rule.
 * - `categoryId`: A foreign key referencing the `id` column in the `categoriesTable`. This field is required and has a cascading delete rule.
 * - `amount`: The amount of the expense, with a precision of 10 and a scale of 2. This field is required.
 * - `description`: A brief description of the expense, with a maximum length of 255 characters. This field is required.
 * - `date`: The date of the expense. This field is required.
 */
const expensesTable = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  // * onDelete: "cascade" means that when the user is deleted, all the expenses related to that user will be deleted as well
  // ? i am not sure if this is the best approach, but it is a good approach to keep the database normalized
  // ? i thought about enums instead of the category table, but i think it is better to have a separate table for the categories
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categoriesTable.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// create zod schema for the expense object
export const createExpenseSchema = createInsertSchema(expensesTable, {
  userId: z.string().uuid(),
  categoryId: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string().min(1).max(255),
  date: z.string().regex(dateRestriction), // date format: YYYY-MM-DD
});

/**
 * Represents the schema for the budgets table in the database.
 *
 * The `budgetsTable` includes the following fields:
 * - `id`: A unique identifier for the budget, generated randomly by default.
 * - `userId`: A foreign key referencing the `id` field in the `usersTable`. This field is not nullable and has a cascade delete rule.
 * - `limitAmount`: A numeric value representing the budget limit amount with a precision of 10 and a scale of 2. This field is not nullable.
 * - `categoryId`: A foreign key referencing the `id` field in the `categoriesTable`. This field is not nullable and has a cascade delete rule.
 * - `createdAt`: A timestamp indicating when the budget was created, with a default value of the current time.
 */
const budgetsTable = pgTable("budget", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  limitAmount: numeric("limit_amount", { precision: 10, scale: 2 }).notNull(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categoriesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// create zod schema for the budget object
export const createBudgetSchema = createInsertSchema(budgetsTable, {
  userId: z.string().uuid(),
  limitAmount: z.number().positive(),
  categoryId: z.string().uuid(),
});

/**
 * Represents the schema definition for the "categories" table in the database.
 *
 * The table has the following columns:
 * - `id`: A unique identifier for each category, generated randomly by default.
 * - `categoryName`: The name of the category, which is a non-nullable string with a maximum length of 50 characters. This field is also unique.
 * - `createdAt`: The timestamp indicating when the category was created, with a default value of the current time.
 */
export const categoriesTable = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryName: varchar("category_name", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// create zod schema for the category object
export const createCategorySchema = createInsertSchema(categoriesTable, {
  categoryName: z.string().min(1).max(50),
});

/**
 * Represents the schema for the payments table in the database.
 *
 * The table contains the following columns:
 * - `id`: A unique identifier for each payment, generated randomly.
 * - `userId`: A foreign key referencing the `id` column in the `usersTable`.
 *   This field is not nullable and has a cascade delete rule.
 * - `categoryId`: A foreign key referencing the `id` column in the `categoriesTable`.
 *   This field is not nullable and has a cascade delete rule.
 * - `payment`: A varchar field with a maximum length of 50 characters, representing the payment description.
 *   This field is not nullable and must be unique.
 * - `createdAt`: A timestamp indicating when the payment was created.
 *   Defaults to the current time.
 * - `dueDate`: A timestamp indicating the due date of the payment.
 *   This field is not nullable.
 */
const paymentsTable = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categoriesTable.id, { onDelete: "cascade" }),
  payment: varchar("payment", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").default(sql`now()`),
  dueDate: timestamp("due_date").notNull(),
});

// create zod schema for the payment object
export const createPaymentSchema = createInsertSchema(paymentsTable, {
  userId: z.string().uuid(),
  categoryId: z.string().uuid(),
  payment: z.string().min(1).max(50),
  dueDate: z.string().regex(dateRestriction),
});
