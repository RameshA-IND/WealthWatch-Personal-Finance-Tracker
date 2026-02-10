
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🚀 WEALTHWATCH BACKEND V2.0 STARTING...');
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Allow requests from React frontend
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`✅ Application is running on port: ${port}`);
}
bootstrap();
