import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.json({limit: '5mb'}));
  app.enableCors({
    origin: [ /localhost/ ],
    methods: ['DELETE', 'GET', 'PUT', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Content-Length', 'Authorization']
  });
  await app.listen(3000);
}
bootstrap();
