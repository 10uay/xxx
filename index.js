import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
// import path from "path";
import authRoutes from "./routes/auth.route.js";
import eventRoutes from "./routes/event.route.js";
import { connectDB } from "./db/connectDB.js";

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;
// const __dirname = path.resolve();

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
  connectDB();
});

app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(cookieParser()); // allows us to parse incoming cookies
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type", "Authorization"],
  })
);
// app.use("/", (req, res) => {
//   res.status(200).send("the server is running well!");
// });
app.use("/api/auth", authRoutes);
app.use("/api/event", eventRoutes)
