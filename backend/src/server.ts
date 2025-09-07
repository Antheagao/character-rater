import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import sensible from "@fastify/sensible";
import { adminRoutes } from "./routes/adminRoutes.js";
import { characterRoutes } from "./routes/characters.js";
import { animeRoutes } from "./routes/animes.js";
import { mangaRoutes } from "./routes/mangas.js";
import searchRoutes from "./routes/search.js";
import authRoutes from "./routes/auth.js";
import commentRoutes from "./routes/comments.js";

const server = Fastify({ logger: true });

// Middleware
await server.register(cors, {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const allowed = [/^http:\/\/localhost:\d+$/, /^https:\/\/.*\.vercel\.app$/];
    if (allowed.some(re => re.test(origin))) cb(null, true);
    else cb(new Error("Not allowed by CORS"), false);
  },
  credentials: true // authentication
});
await server.register(helmet);
await server.register(sensible);
await server.register(adminRoutes);
await server.register(characterRoutes);
await server.register(animeRoutes);
await server.register(mangaRoutes);
server.register(searchRoutes, { prefix: '/api/search' });
server.register(authRoutes, { prefix: '/api/auth' });
server.register(commentRoutes, { prefix: '/api/comments' });

// Check health of server
server.get("/healthz", async () => ({ ok: true }));

const PORT = Number(process.env.PORT ?? 3001);
const HOST = "0.0.0.0";

// Start server
try {
  await server.listen({ port: PORT, host: HOST });
  server.log.info(`Server listening on http://localhost:${PORT}`);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
