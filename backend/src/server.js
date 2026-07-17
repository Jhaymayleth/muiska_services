import app from "./app.js";
import { initializeDatabase } from "./db/init.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Backend MUISKA ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar el backend:", error);
    process.exit(1);
  }
};

startServer();
