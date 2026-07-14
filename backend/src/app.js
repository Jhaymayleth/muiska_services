import express from "express";
import dotenv from "dotenv";
import statusRouter from "./routes/status.routes.js";
import publicationRouter from "./routes/publication.routes.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", statusRouter);
app.use("/api", publicationRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
