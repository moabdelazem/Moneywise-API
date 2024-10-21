import express, { Express, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import chalk from "chalk";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { db } from ".";
import { expensesRouter } from "./routes/expenses";
import { authRouter } from "./routes/auth";
import errorHandler from "./middlewares/errorHandler";

// swagger options
const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MoneyWise",
      version: "1.0.0",
      description: "MoneyWise API Documentation",
      contact: {
        name: "MoneyWise",
        email: "mabdelazemahmed@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:8080/api/v1",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

// swagger custom options
const customOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
  explorer: true,
};

// Create a new express application instance
export const app: Express = express();
// create a router for the api as base route
const apiRouter = express.Router();

// use the json parese middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// enable cors for all requests
app.use((_, res: Response, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// enable swagger for the api
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerJSDoc(swaggerOptions), customOptions)
);

// create logger middleware to log the request method and url
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime();

  res.on("finish", () => {
    // calculate the duration of the request
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = (seconds * 1e3 + nanoseconds / 1e6).toFixed(2); // Convert to milliseconds

    // color the request method based on the method
    let methodColor;
    switch (req.method) {
      case "GET":
        methodColor = chalk.green;
        break;
      case "POST":
        methodColor = chalk.blue;
        break;
      case "PUT":
        methodColor = chalk.yellow;
        break;
      case "DELETE":
        methodColor = chalk.red;
        break;
      default:
        methodColor = chalk.white;
    }

    // log the request method, url, status code and duration
    console.log(
      `${methodColor(req.method)} - ${chalk.red(req.ip)} ${chalk.green(
        req.originalUrl
      )} - ${chalk.yellow(res.statusCode.toString())} - ${chalk.magenta(
        duration + "ms"
      )}`
    );
  });

  next();
});

app.get("/", (_, res: Response) => {
  res.send(`
    <div style="text-align: center;">
      <h1>MoneyWise | This Service Is For Developers Only!</h1>
      <p>If You See This API Is Working!</p>
    </div>
    `);
});

// define a route handler for the api
// * this route is the base route for all the api routes
app.use("/api/v1", apiRouter);

// define a route handler for the default home page
// ? this route gives me 304 status code when I try to access it from the browser
// ? it works fine when I try to access it from postman
// ? I think it's because the response does not change so the browser caches it
apiRouter.get("/", (_, res: Response) => {
  const serverStatus = {
    status: "running",
    message: "Hello world!",
  };

  res.setHeader("Content-Type", "application/json");
  res.send(serverStatus);
});

// define a route handler for the health check
// returns the uptime of the server
apiRouter.get("/health-check", async (_, res: Response) => {
  const healthCheck = {
    upTime: process.uptime(),
    status: "Ok",
    date: new Date(),
    database: "Unknown",
  };

  try {
    // Perform a simple query to check database connection
    await db.execute("SELECT 1"); // Adjust the query to something supported by your DB

    // If successful, update database status
    healthCheck.database = "Connected";
    res.send(healthCheck);
  } catch (error) {
    console.error(chalk.bgRed((error as Error).message));

    // Update health status to reflect the error
    healthCheck.status = "Error";
    healthCheck.database = "Disconnected"; // Reflect DB issue if any

    res.status(503).send(healthCheck);
  }
});

// create error handler middleware
app.use(errorHandler);

// TODO: setting main routes
apiRouter.use("/expenses", expensesRouter);
// ! this route is for testing purposes only
// ! it should be removed in production
apiRouter.use("/auth", authRouter);

// define a route handler for the notfound
app.use((_, res: Response) => {
  res.status(404).send("Not found");
});
