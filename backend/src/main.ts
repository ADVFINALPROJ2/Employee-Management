import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Global API Prefix (All endpoints will start with /api)
  app.setGlobalPrefix('api');

  // 2. Global Validation (Handles incoming frontend request data parsing automatically)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away unauthorized data sent by users
      transform: true, // Automatically converts types (e.g., string id to integer/uuid)
    }),
  );

  // 3. Enable CORS (Crucial so Next.js frontend can fetch data without blocking)
  app.enableCors({
    origin: true, // In production, replace with your frontend URL
    credentials: true,
  });

  // Listen on port 5000 (standard for backend API to avoid port conflicts with Next.js on 3000)
  await app.listen(5000);
  console.log(`🚀 Backend application is running on: http://localhost:5000/api`);
}
bootstrap();