import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from "../db/prisma.js";

interface SearchQuery {
  q: string;
}

interface SearchResult {
  malId: number;
  name: string;
  type: string;
  imageUrl?: string;
}

// Helper function for safe error handling
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

export default async function searchRoutes(fastify: FastifyInstance) {
  // Search endpoint
  fastify.get<{
    Querystring: SearchQuery
  }>('/', async (request: FastifyRequest<{ Querystring: SearchQuery }>, reply: FastifyReply) => {
    const { q } = request.query;

    if (!q || q.trim() === '') {
      return reply.status(400).send({ error: 'Query parameter is required' });
    }

    try {
      fastify.log.info(`Searching for: ${q}`);
      
      // Search across characters, anime, and manga
      const [characters, anime, manga] = await Promise.all([
        // Search characters
        prisma.character.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { nameKanji: { contains: q, mode: 'insensitive' } },
            ]
          },
          take: 5,
          select: {
            malId: true,
            name: true,
            nameKanji: true,
            imagesJson: true
          }
        }),
        
        // Search anime
        prisma.anime.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { titleEnglish: { contains: q, mode: 'insensitive' } },
              { titleJapanese: { contains: q, mode: 'insensitive' } }
            ]
          },
          take: 5,
          select: {
            malId: true,
            title: true,
            imagesJson: true
          }
        }),
        
        // Search manga
        prisma.manga.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { titleEnglish: { contains: q, mode: 'insensitive' } },
              { titleJapanese: { contains: q, mode: 'insensitive' } }
            ]
          },
          take: 5,
          select: {
            malId: true,
            title: true,
            imagesJson: true
          }
        })
      ]);

      fastify.log.info(`Search results - Characters: ${characters.length}, Anime: ${anime.length}, Manga: ${manga.length}`);

      // Helper function to extract image URL from imagesJson
      const getImageUrl = (imagesJson: any): string | undefined => {
        try {
          if (imagesJson && typeof imagesJson === 'object') {
            return imagesJson.jpg?.image_url || imagesJson.webp?.image_url;
          }
          return undefined;
        } catch (error) {
          //fastify.log.error('Error parsing imagesJson:', error);
          return undefined;
        }
      };

      // Format character results
      const characterResults: SearchResult[] = characters.map(c => ({
        malId: c.malId,
        name: c.nameKanji ? `${c.name} (${c.nameKanji})` : c.name,
        type: 'characters',
        imageUrl: getImageUrl(c.imagesJson)
      }));

      // Format anime results
      const animeResults: SearchResult[] = anime.map(a => ({
        malId: a.malId,
        name: a.title,
        type: 'anime',
        imageUrl: getImageUrl(a.imagesJson)
      }));

      // Format manga results
      const mangaResults: SearchResult[] = manga.map(m => ({
        malId: m.malId,
        name: m.title,
        type: 'manga',
        imageUrl: getImageUrl(m.imagesJson)
      }));

      // Combine all results
      const results = [...characterResults, ...animeResults, ...mangaResults];

      return { results };
    } catch (error) {
      //fastify.log.error('Search error details:', error);
      
      // Use the helper functions to safely access error properties
      const errorMessage = getErrorMessage(error);
      const errorStack = process.env.NODE_ENV === 'development' ? getErrorStack(error) : undefined;
      
      return reply.status(500).send({ 
        error: 'Internal server error', 
        message: errorMessage,
        stack: errorStack
      });
    }
  });
}
