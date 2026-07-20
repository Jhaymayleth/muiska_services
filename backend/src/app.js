import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import statusRouter from "./routes/status.routes.js";
import publicationRouter from "./routes/publication.routes.js";
import authRouter from "./routes/auth.routes.js";
import categoryRouter from "./routes/category.routes.js";
import adminRouter from "./routes/admin.routes.js";
import favoriteRouter from "./routes/favorite.routes.js";
import verificationRouter from "./routes/verification.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import moderationRouter from "./routes/moderation.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", statusRouter);
app.use("/api", publicationRouter);
app.use("/api", authRouter);
app.use("/api", categoryRouter);
app.use("/api", adminRouter);
app.use("/api/favorites", favoriteRouter);
app.use("/api/verificaciones", verificationRouter);
app.use("/api/notificaciones", notificationRouter);
app.use("/api", moderationRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
