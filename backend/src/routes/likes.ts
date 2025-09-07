import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate, AuthenticatedRequest } from '../auth/middleware.js';
import { prisma } from "../db/prisma.js";

// Interfaces for request body and parameters
interface LikeRequestBody {
  characterId?: number;
  animeId?: number;
  mangaId?: number;
  value: number;
}

interface ItemParams {
  id: string;
  type: string;
}

interface LikeParams {
  id: string;
}

export default async function likeRoutes(fastify: FastifyInstance) {
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
            },
            anime: {
              select: {
                malId: true,
                title: true,
                imagesJson: true
              }
            },
            manga: {
              select: {
                malId: true,
                title: true,
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
        return reply.status(500).send({ 
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        });
      }
    }
  );

  // Like/Dislike an item (character, anime, or manga)
  fastify.post<{ Body: LikeRequestBody }>('/', 
    { preHandler: [authenticate] },
    async (request: FastifyRequest<{ Body: LikeRequestBody }>, reply: FastifyReply) => {
      const { characterId, animeId, mangaId, value } = request.body;
      const userId = (request as AuthenticatedRequest).user!.userId;

      // Validate input
      const idCount = [characterId, animeId, mangaId].filter(Boolean).length;
      if (idCount !== 1) {
        return reply.status(400).send({ error: 'Exactly one of characterId, animeId, or mangaId must be provided' });
      }

      if (value !== 1 && value !== -1) {
        return reply.status(400).send({ error: 'Value must be 1 (like) or -1 (dislike)' });
      }

      try {
        let whereUnique: any;
        let createData: any = { userId, value };
        let itemType = '';

        if (characterId) {
          // Check if character exists
          const character = await prisma.character.findUnique({ where: { malId: characterId } });
          if (!character) return reply.status(404).send({ error: 'Character not found' });
          
          whereUnique = {
            userId_characterId: {
              userId,
              characterId
            }
          };
          createData.characterId = characterId;
          itemType = 'character';
        } else if (animeId) {
          // Check if anime exists
          const anime = await prisma.anime.findUnique({ where: { malId: animeId } });
          if (!anime) return reply.status(404).send({ error: 'Anime not found' });
          
          whereUnique = {
            userId_animeId: {
              userId,
              animeId
            }
          };
          createData.animeId = animeId;
          itemType = 'anime';
        } else if (mangaId) {
          // Check if manga exists
          const manga = await prisma.manga.findUnique({ where: { malId: mangaId } });
          if (!manga) return reply.status(404).send({ error: 'Manga not found' });
          
          whereUnique = {
            userId_mangaId: {
              userId,
              mangaId
            }
          };
          createData.mangaId = mangaId;
          itemType = 'manga';
        }

        // Upsert like/dislike
        const like = await prisma.like.upsert({
          where: whereUnique,
          update: { value },
          create: createData,
        });

        return reply.send({ 
          message: value === 1 ? `${itemType} liked` : `${itemType} disliked`,
          like 
        });
      } catch (error) {
        fastify.log.error('Like error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({ 
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        });
      }
    }
  );

  // Remove like/dislike
  fastify.delete<{ Params: LikeParams }>('/:id', 
    { preHandler: [authenticate] },
    async (request: FastifyRequest<{ Params: LikeParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const userId = (request as AuthenticatedRequest).user!.userId;

      try {
        // Check if the like exists
        const existingLike = await prisma.like.findUnique({
          where: { id }
        });

        if (!existingLike) {
          return reply.status(404).send({ error: 'Like not found' });
        }

        if (existingLike.userId !== userId) {
          return reply.status(403).send({ error: 'You can only delete your own likes' });
        }

        // Delete the like
        await prisma.like.delete({
          where: { id }
        });

        return reply.send({ message: 'Like removed successfully' });
      } catch (error) {
        fastify.log.error('Delete like error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({ 
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        });
      }
    }
  );

  // Get like counts for a specific item
  fastify.get<{ Params: ItemParams }>('/count/:type/:id', 
    async (request: FastifyRequest<{ Params: ItemParams }>, reply: FastifyReply) => {
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

        const likes = await prisma.like.count({ 
          where: { ...whereCondition, value: 1 } 
        });
        const dislikes = await prisma.like.count({ 
          where: { ...whereCondition, value: -1 } 
        });

        return reply.send({ likes, dislikes });
      } catch (error) {
        fastify.log.error('Get like counts error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({ 
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        });
      }
    }
  );

  // Get user's like status for a specific item
  fastify.get<{ Params: ItemParams }>('/status/:type/:id', 
    { preHandler: [authenticate] },
    async (request: FastifyRequest<{ Params: ItemParams }>, reply: FastifyReply) => {
      const { type, id } = request.params;
      const itemId = parseInt(id);
      const userId = (request as AuthenticatedRequest).user!.userId;

      try {
        let whereUnique: any;

        switch (type) {
          case 'characters':
            whereUnique = {
              userId_characterId: {
                userId,
                characterId: itemId
              }
            };
            break;
          case 'anime':
            whereUnique = {
              userId_animeId: {
                userId,
                animeId: itemId
              }
            };
            break;
          case 'manga':
            whereUnique = {
              userId_mangaId: {
                userId,
                mangaId: itemId
              }
            };
            break;
          default:
            return reply.status(400).send({ error: 'Invalid type. Use characters, anime, or manga' });
        }

        const like = await prisma.like.findUnique({
          where: whereUnique
        });

        return reply.send({ 
          userInteraction: like ? like.value : 0, // 0 = none, 1 = like, -1 = dislike
        });
      } catch (error) {
        fastify.log.error('Get like status error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({ 
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        });
      }
    }
  );

  // Get all likes for a specific item
  fastify.get<{ Params: ItemParams }>('/:type/:id', 
    async (request: FastifyRequest<{ Params: ItemParams }>, reply: FastifyReply) => {
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

        const likes = await prisma.like.findMany({
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

        return reply.send({ likes });
      } catch (error) {
        fastify.log.error('Get item likes error: %s', error instanceof Error ? error.message : String(error));
        return reply.status(500).send({ 
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        });
      }
    }
  );
}
