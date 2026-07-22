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
import healthRouter from "./routes/health.routes.js";
import chatRouter from "./routes/chat.routes.js";
import barrioRouter from "./routes/barrio.routes.js";
import userRouter from "./routes/user.routes.js";
import reviewRouter from "./routes/review.routes.js";
import pushRouter from "./routes/push.routes.js";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error.middleware.js";
import { createRequestLogger } from "./config/logger.js";
import { apiLimiter } from "./middlewares/rateLimit.middleware.js";

import { config } from "./config/index.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors({ origin: config.cors.origin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(createRequestLogger);
app.use(apiLimiter);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", statusRouter);
app.use("/api", publicationRouter);
app.use("/api", authRouter);
app.use("/api", categoryRouter);
app.use("/api", adminRouter);
app.use("/api/favorites", favoriteRouter);
app.use("/api/verifications", verificationRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api", moderationRouter);
app.use("/api", chatRouter);
app.use("/api", healthRouter);
app.use("/api", barrioRouter);
app.use("/api", userRouter);
app.use("/api", reviewRouter);
app.use("/api", pushRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
