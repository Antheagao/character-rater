import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + 
           "?connection_limit=5" +          // Conservative limit
           "&pool_timeout=0" +              // No timeout
           "&connect_timeout=30" +          // 30s connection timeout
           "&sslmode=require" +             // SSL required for Supabase
           "&application_name=your_app"     // Helpful for debugging
    }
  }
});
