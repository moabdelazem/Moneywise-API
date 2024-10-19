import { app } from "./app";
import { drizzle } from "drizzle-orm/node-postgres";
import chalk from "chalk";
import dotenv from "dotenv";

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config();

// create a new instance of the drizzle ORM with the connection string
export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
    ssl: false,
  },
});

// The port the express app will listen on
const port: number = parseInt(process.env.PORT as string, 10) || 3000;

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
    chalk.blueBright("App is running in ") +
      chalk.yellow(process.env.NODE_ENV) +
      chalk.blueBright(" mode")
  );
  console.log(
    chalk.blueBright(`Server started at `) +
      chalk.bgBlueBright(`http://127.0.0.1:${port}`)
  );

  // Log the environment mode for the server
  if (process.env.NODE_ENV === "development") {
    console.log(chalk.greenBright("Development mode: Hot reloading enabled"));
  } else if (process.env.NODE_ENV === "production") {
    console.log(
      chalk.redBright("Production mode: Performance optimizations enabled")
    );
  } else {
    console.log(chalk.magentaBright(`Unknown mode: ${process.env.NODE_ENV}`));
  }
});
