import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import {AuthenticationHeaderInterceptor} from "./auth.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.json({limit: '5mb'}));
  app.enableCors({
    origin: [ /localhost/ ],
    methods: ['DELETE', 'GET', 'PUT', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Content-Length', 'Authorization']
  });
  app.useGlobalInterceptors(new AuthenticationHeaderInterceptor())
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
