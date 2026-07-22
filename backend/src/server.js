import http from "http";
import app from "./app.js";
import { migrate } from "./db/migrate.js";
import { seed } from "./db/seed.js";
import { setupSocket } from "./config/socket.js";

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
setupSocket(server);

async function start() {
    await migrate();
    await seed();
    server.listen(PORT, () => {
        console.log(`Backend MUISKA running at http://localhost:${PORT}`);
    });
}

start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
