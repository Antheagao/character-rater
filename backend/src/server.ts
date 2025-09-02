import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';

const server = Fastify({ logger: true });

// CORS: allow localhost frontend & vercel-style previews
await server.register(cors, {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const allowed = [
      /^http:\/\/localhost:\d+$/,
      /^https:\/\/.*\.vercel\.app$/,
    ];
    if (allowed.some((re) => re.test(origin))) cb(null, true);
    else cb(new Error('Not allowed by CORS'), false);
  },
});

await server.register(helmet);
await server.register(sensible);

const PORT = Number(process.env.PORT ?? 3001);
const HOST = '0.0.0.0';

try {
  await server.listen({ port: PORT, host: HOST });
  server.log.info(`Server listening on http://localhost:${PORT}`);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
