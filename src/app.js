import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//CORS setting
app.use(
  cors({
    credentials: true,
    // origin: [
    //   "https://dahalnabaraj.com.np",
    //   "https://www.dahalnabaraj.com.np",
    //   "http://localhost:5173",
    // ],
    origin: "*",
  })
);
//JASTO KHAL KO NI DATA AAUNA SAK6 IN THE FORM OF FORM OR URL
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
//PDF HARU SAVE GARNA
app.use(express.static("public"));
app.use(cookieParser());

//IMPORT ROUTES
import userRouter from "./routes/user.routes.js";
import breakingNewsRouter from "./routes/breakingNews.routes.js";
import newsRouter from "./routes/news.routes.js";

//ROUTES DECLARATION
app.use("/api/v1/users", userRouter);
app.use("/api/v1/breakingNews", breakingNewsRouter);
app.use("/api/v1/news", newsRouter);

//HANDLING THE ROUTES THAT ARE NOT PRESENT
app.all("*", (req, res, next) => {
  return res.status(400).json({ message: "No routes found" });
});

export { app };
