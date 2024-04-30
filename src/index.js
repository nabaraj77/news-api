import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/dbConnection.js";
dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error:", error);
      throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running in port: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongo DB connection failed !!!", error);
    throw error;
  });
