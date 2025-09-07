import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../auth/middleware.js';
import { prisma } from "../db/prisma.js";

// Interface for request body
interface CommentRequestBody {
  content: string;
  characterId?: number;
  animeId?: number;
  mangaId?: number;
}

// Interface for route parameters
interface CommentParams {
  id: string;
}

// Interface for type/id parameters
interface TypeIdParams {
  type: string;
  id: string;
}

export default async function commentRoutes(fastify: FastifyInstance) {
  // Get user's comments
  fastify.get('/', 
    { preHandler: [authenticate] },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const userId = request.user!.userId;

      try {
        const comments = await prisma.comment.findMany({
          where: { userId },
          include: {
            character: {
              select: {
                malId: true,
                name: true
              }
            },
            anime: {
              select: {
                malId: true,
                title: true
              }
            },
            manga: {
              select: {
                malId: true,
                title: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        return reply.send({ comments });
      } catch (error) {
        fastify.log.error('Get user comments error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Get comments for a specific item
  fastify.get<{ Params: TypeIdParams }>('/:type/:id', 
    async (request: FastifyRequest<{ Params: TypeIdParams }>, reply: FastifyReply) => {
      const { type, id } = request.params;
      const itemId = parseInt(id);

      try {
        let whereCondition: any = {};

        switch (type) {
          case 'characters':
            whereCondition.characterId = itemId;
            break;
          case 'anime':
            whereCondition.animeId = itemId;
            break;
          case 'manga':
            whereCondition.mangaId = itemId;
            break;
          default:
            return reply.status(400).send({ error: 'Invalid type. Use characters, anime, or manga' });
        }

        const comments = await prisma.comment.findMany({
          where: whereCondition,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        return reply.send({ comments });
      } catch (error) {
        fastify.log.error('Get comments error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Create a new comment
  fastify.post<{ Body: CommentRequestBody }>('/', 
    { preHandler: [authenticate] },
    async (request: FastifyRequest<{ Body: CommentRequestBody }>, reply: FastifyReply) => {
      const { content, characterId, animeId, mangaId } = request.body;
      const userId = (request as AuthenticatedRequest).user!.userId;

      // Validate that exactly one ID is provided
      const idCount = [characterId, animeId, mangaId].filter(Boolean).length;
      if (idCount !== 1) {
        return reply.status(400).send({ error: 'Exactly one of characterId, animeId, or mangaId must be provided' });
      }

      if (!content || content.trim().length === 0) {
        return reply.status(400).send({ error: 'Comment content is required' });
      }

      if (content.length > 1000) {
        return reply.status(400).send({ error: 'Comment must be less than 1000 characters' });
      }

      try {
        const comment = await prisma.comment.create({
          data: {
            content: content.trim(),
            userId,
            characterId,
            animeId,
            mangaId
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        });

        return reply.status(201).send({ comment });
      } catch (error) {
        fastify.log.error('Create comment error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Delete a comment
  fastify.delete<{ Params: CommentParams }>('/:id', 
    { preHandler: [authenticate] },
    async (request: FastifyRequest<{ Params: CommentParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const userId = (request as AuthenticatedRequest).user!.userId;

      try {
        // Check if comment exists and belongs to user
        const comment = await prisma.comment.findUnique({
          where: { id }
        });

        if (!comment) {
          return reply.status(404).send({ error: 'Comment not found' });
        }

        if (comment.userId !== userId) {
          return reply.status(403).send({ error: 'You can only delete your own comments' });
        }

        await prisma.comment.delete({
          where: { id }
        });

        return reply.send({ message: 'Comment deleted successfully' });
      } catch (error) {
        fastify.log.error('Delete comment error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );
}
