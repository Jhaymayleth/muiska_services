import express from "express";
import dotenv from "dotenv";
import statusRouter from "./routes/status.routes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", statusRouter);

export default app;
