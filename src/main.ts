import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('GLIMMER')
    .setDescription('Glimmer API documentation')
    .setVersion('1.0')
    .addTag('Base URL: N/A')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.use(morgan('dev'));
  app.enableCors({
    origin: [
      'https://admin.glimmer.com.pk',
      'https://www.admin.glimmer.com.pk',
      'http://localhost:3001', // Optional: for local dev
      'http://localhost:5173', // Optional: for local dev

      'https://api.glimmer.com.pk',
      'https://www.api.glimmer.com.pk',

      'https://glimmer.com.pk',
      'https://www.glimmer.com.pk',
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
