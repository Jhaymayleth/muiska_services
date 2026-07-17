import app from "./app.js";

const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Backend MUISKA ejecutándose en http://localhost:${PORT}`);
});