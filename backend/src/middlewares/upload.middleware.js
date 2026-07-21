import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp"
];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(new Error(`Extensión no permitida: ${ext}. Use jpg, jpeg, png, gif o webp.`), false);
    }

    if (!ALLOWED_MIME_TYPES.includes(mime)) {
        return cb(new Error(`Tipo MIME no permitido: ${mime}`), false);
    }

    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5
    },
});

export const handleUploadError = (err, _req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ success: false, code: "FILE_TOO_LARGE", message: "La imagen no puede superar los 5MB" });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({ success: false, code: "TOO_MANY_FILES", message: "Máximo 5 imágenes por publicación" });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({ success: false, code: "UNEXPECTED_FIELD", message: "Campo de archivo inesperado" });
        }
        return res.status(400).json({ success: false, code: err.code, message: err.message });
    }
    if (err) {
        return res.status(400).json({ success: false, code: "UPLOAD_ERROR", message: err.message });
    }
    next();
};
