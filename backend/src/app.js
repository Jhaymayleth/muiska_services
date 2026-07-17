import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import statusRouter from "./routes/status.routes.js";
import publicationRouter from "./routes/publication.routes.js";
import authRouter from "./routes/auth.routes.js";
import categoryRouter from "./routes/category.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";

dotenv.config();

// Configuración de express
const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos para subir imágenes
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rutas de la API
app.use("/api", statusRouter, publicationRouter, authRouter, categoryRouter);

// Middlewares de error (al final)
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
