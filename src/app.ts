import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

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
        `${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`
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

app.listen(port);
