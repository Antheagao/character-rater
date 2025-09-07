import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../auth/middleware.js';

// Add interface for route parameters
interface LikeParams {
  characterId: string;
}

// Add interface for request body
interface LikeRequestBody {
  characterId: number;
  value: number;
}

export default async function likeRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();

  // Get user's likes and dislikes
  fastify.get('/', 
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;

      try {
        const likes = await prisma.like.findMany({
          where: { userId },
          include: {
            character: {
              select: {
                malId: true,
                name: true,
                imagesJson: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        return reply.send({ likes });
      } catch (error) {
        fastify.log.error('Get likes error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Like/Dislike a character - FIXED TYPING
  fastify.post<{ Body: LikeRequestBody }>('/', 
    { preHandler: [authenticate] },
    async (request: FastifyRequest<{ Body: LikeRequestBody }>, reply: FastifyReply) => {
      const { characterId, value } = request.body;
      const userId = (request as AuthenticatedRequest).user!.userId;

      // Validate input
      if (value !== 1 && value !== -1) {
        return reply.status(400).send({ error: 'Value must be 1 (like) or -1 (dislike)' });
      }

      if (!characterId || typeof characterId !== 'number') {
        return reply.status(400).send({ error: 'Valid characterId is required' });
      }

      try {
        // Check if character exists
        const character = await prisma.character.findUnique({
          where: { malId: characterId }
        });

        if (!character) {
          return reply.status(404).send({ error: 'Character not found' });
        }

        // Upsert like/dislike (update if exists, create if not)
        const like = await prisma.like.upsert({
          where: {
            userId_characterId: {
              userId,
              characterId
            }
          },
          update: {
            value
          },
          create: {
            userId,
            characterId,
            value
          },
          include: {
            character: {
              select: {
                malId: true,
                name: true
              }
            }
          }
        });

        return reply.send({ 
          message: value === 1 ? 'Character liked' : 'Character disliked',
          like 
        });
      } catch (error) {
        fastify.log.error('Like error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Remove like/dislike
  fastify.delete<{ Params: LikeParams }>('/:characterId', 
    { preHandler: [authenticate] },
    async (request: FastifyRequest<{ Params: LikeParams }>, reply: FastifyReply) => {
      const { characterId } = request.params;
      const userId = (request as AuthenticatedRequest).user!.userId;

      try {
        // Check if the like exists
        const existingLike = await prisma.like.findUnique({
          where: {
            userId_characterId: {
              userId,
              characterId: Number(characterId)
            }
          }
        });

        if (!existingLike) {
          return reply.status(404).send({ error: 'Like not found' });
        }

        // Delete the like
        await prisma.like.delete({
          where: {
            userId_characterId: {
              userId,
              characterId: Number(characterId)
            }
          }
        });

        return reply.send({ message: 'Like removed successfully' });
      } catch (error) {
        fastify.log.error('Delete like error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get like status for a specific character
  fastify.get<{ Params: LikeParams }>('/:characterId', 
    { preHandler: [authenticate] },
    async (request: FastifyRequest<{ Params: LikeParams }>, reply: FastifyReply) => {
      const { characterId } = request.params;
      const userId = (request as AuthenticatedRequest).user!.userId;

      try {
        const like = await prisma.like.findUnique({
          where: {
            userId_characterId: {
              userId,
              characterId: Number(characterId)
            }
          }
        });

        return reply.send({ 
          hasInteraction: !!like,
          like: like || null 
        });
      } catch (error) {
        fastify.log.error('Get like status error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );
}
