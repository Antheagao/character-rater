import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from './utils.js';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    userId: string;
    email: string;
    username: string;
  };
}

export async function authenticate(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    request.user = decoded;
  } catch (error) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}
