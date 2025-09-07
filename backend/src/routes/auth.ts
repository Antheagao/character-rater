import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { hashPassword, verifyPassword, generateToken, JWTPayload } from '../auth/utils.js';
import { authenticate, AuthenticatedRequest } from '../auth/middleware.js';
import { prisma } from '../db/prisma.js'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export default async function authRoutes(fastify: FastifyInstance) {
  // Register endpoint
  fastify.post<{ Body: RegisterRequest }>('/register', async (request: FastifyRequest<{ Body: RegisterRequest }>, reply: FastifyReply) => {
    const { email, username, password } = request.body;

    // Validation
    if (!email || !username || !password) {
      return reply.status(400).send({ error: 'Email, username, and password are required' });
    }

    if (password.length < 6) {
      return reply.status(400).send({ error: 'Password must be at least 6 characters long' });
    }

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });

      if (existingUser) {
        return reply.status(409).send({ error: 'User with this email or username already exists' });
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      
      const user = await prisma.user.create({
        data: {
          email,
          username,
          passwordHash
        },
        select: {
          id: true,
          email: true,
          username: true,
          avatar: true,
          bio: true,
          createdAt: true
        }
      });

      // Generate token
      const tokenPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        username: user.username
      };

      const token = generateToken(tokenPayload);

      return reply.status(201).send({
        message: 'User created successfully',
        user,
        token
      });
    } catch (error) {
      fastify.log.error('Registration error: %s', getErrorMessage(error));
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Login endpoint
  fastify.post<{ Body: LoginRequest }>('/login', async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
    const { email, password } = request.body;

    // Validation
    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          passwordHash: true,
          avatar: true,
          bio: true
        }
      });

      if (!user) {
        return reply.status(401).send({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      
      if (!isValidPassword) {
        return reply.status(401).send({ error: 'Invalid email or password' });
      }

      // Generate token
      const tokenPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        username: user.username
      };

      const token = generateToken(tokenPayload);

      // Return user info (excluding password)
      const { passwordHash, ...userWithoutPassword } = user;

      return reply.send({
        message: 'Login successful',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      fastify.log.error('Login error: %s', getErrorMessage(error));
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get current user info
  fastify.get('/me', { preHandler: [authenticate] }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: request.user!.userId },
        select: {
          id: true,
          email: true,
          username: true,
          avatar: true,
          bio: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return reply.send({
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        }
      });
    } catch (error) {
      fastify.log.error('Get user error: %s', getErrorMessage(error));
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
