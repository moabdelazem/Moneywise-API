import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import chalk from "chalk";

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config();

// Create a new express application instance
const app: Express = express();
// create a router for the api as base route
const apiRouter = express.Router();
// The port the express app will listen on
const port: number = parseInt(process.env.PORT as string, 10) || 3000;

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

// create logger middleware to log the request method and url
app.use((req: Request, res: Response, next: NextFunction) => {
  try {
    const time = new Date();
    req.on("close", () => {
      // *calculate the duration of the request
      const duration = new Date().getTime() - time.getTime();
      console.log(
        `${chalk.blue(req.method)} ${chalk.green(req.url)} - ${chalk.yellow(
          res.statusCode.toString()
        )} - ${chalk.magenta(duration + "ms")}`
      );
    });
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/", (_, res: Response) => {
  res.send("Hello world!");
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
apiRouter.get("/health", async (_, res: Response) => {
  const healthCheck = {
    upTime: process.uptime(),
    status: "Ok",
    date: new Date(),
  };

  try {
    res.send(healthCheck);
  } catch (error) {
    console.error(chalk.bgRed((error as Error).message));
    healthCheck.status = "Error";
    res.status(503).send(healthCheck);
  }
});

// create error handler middleware
app.use((err: Error, _req: Request, res: Response) => {
  console.error(chalk.bgRed(err.message));
  res.status(500).send("Internal server error");
});

// define a route handler for the notfound
app.use((_, res: Response) => {
  res.status(404).send("Not found");
});

// start the Express server
// * listen on the port defined in the .env file
app.listen(port, () => {
  console.log(
    chalk.black.blueBright(`
 _____ ______   ________  ________   _______       ___    ___ ___       __   ___  ________  _______      
|\\   _ \\  _   \\|\\   __  \\|\\   ___  \\|\\  ___ \\     |\\  \\  /  /|\\  \\     |\\  \\|\\  \\|\\   ____\\|\\  ___ \\     
\\ \\  \\\\\\__\\ \\  \\ \\  \\|\\  \\ \\  \\\\ \\  \\ \\   __/|    \\ \\  \\/  / \\ \\  \\    \\ \\  \\ \\  \\ \\  \\___|\\ \\   __/|    
 \\ \\  \\\\|__| \\  \\ \\  \\\\\\  \\ \\  \\\\ \\  \\ \\  \\_|/__   \\ \\    / / \\ \\  \\  __\\ \\  \\ \\  \\ \\_____  \\ \\  \\_|/__  
  \\ \\  \\    \\ \\  \\ \\  \\\\\\  \\ \\  \\\\ \\  \\ \\  \\_|\\ \\   \\/  /  /   \\ \\  \\|\\__\\_\\  \\ \\  \\|____|\\  \\ \\  \\_|\\ \\ 
   \\ \\__\\    \\ \\__\\ \\_______\\ \\__\\\\ \\__\\ \\_______\\__/  / /      \\ \\____________\\ \\__\\____\\_\\  \\ \\_______\\
    \\|__|     \\|__|\\|_______|\\|__| \\|__|\\|_______|\\___/ /        \\|____________|\\|__|\\_________\\|_______|
                                                 \\|___|/                            \\|_________|         `)
  );

  console.log(
    chalk.green("App is running in ") +
      chalk.yellow(process.env.NODE_ENV) +
      chalk.magenta(" mode")
  );
  console.log(
    chalk.green(`Server started at `) + chalk.bgGrey(`http://localhost:${port}`)
  );
});
