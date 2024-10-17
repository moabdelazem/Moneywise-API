import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import chalk from "chalk";

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config();

// Create a new express application instance
const app: Express = express();
// The port the express app will listen on
const port: number = parseInt(process.env.PORT as string, 10) || 3000;

// use the json parese middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// create logger middleware to log the request method and url
app.use((req: Request, res: Response, next) => {
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

// define a route handler for the default home page
// ? this route gives me 304 status code when I try to access it from the browser
// ? it works fine when I try to access it from postman
// ? I think it's because the response does not change so the browser caches it
app.get("/", (_, res: Response) => {
  const serverStatus = {
    status: "running",
    message: "Hello world!",
  };

  res.setHeader("Content-Type", "application/json");
  res.send(serverStatus);
});

// define a route handler for the health check
// returns the uptime of the server
app.get("/api/v1/health", async (_, res: Response) => {
  const healthCheck = {
    upTime: process.uptime(),
    status: "Ok",
    date: new Date(),
  };

  try {
    res.send(healthCheck);
  } catch (error) {
    healthCheck.status = "Error";
    res.status(503).send(healthCheck);
  }
});

// create error handler middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(chalk.bgRed(err.message));
  res.status(req.statusCode || 500).json({
    status: "error",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// define a route handler for the notfound
app.use((_, res: Response) => {
  res.status(404).send("Not found");
});

app.listen(port, () => {
  console.log(
    chalk.black.magenta(`
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
