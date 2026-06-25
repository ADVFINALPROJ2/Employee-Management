import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Global API Prefix (All endpoints will start with /api)
  app.setGlobalPrefix('api');

  // 2. Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 3. Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Dynamic Port Binding: Checks process.env.PORT provided by Docker Compose
  const port = process.env.PORT || 5000;
  await app.listen(port,'0.0.0.0');
  
  console.log(`🚀 Backend application is running on: http://localhost:${port}/api`);
}
bootstrap();