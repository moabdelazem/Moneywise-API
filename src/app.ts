import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

// Create a new express application instance
const app: Express = express();
// The port the express app will listen on
const port: number = parseInt(process.env.PORT as string, 10) || 3000;

// use the json parese middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function startApp() {
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
  });
}

startApp();
