import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import {AuthenticationHeaderInterceptor} from "./auth.interceptor";
import { join } from 'path';
import {NestExpressApplication} from "@nestjs/platform-express";
import {PublicAssetNotFoundFilter} from "./public-assets.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(bodyParser.json({limit: '5mb'}));
  app.enableCors({
    origin: [ /localhost/ ],
    methods: ['DELETE', 'GET', 'PUT', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Content-Length', 'Authorization']
  });
  app.useGlobalFilters(new PublicAssetNotFoundFilter())
  app.useGlobalInterceptors(new AuthenticationHeaderInterceptor())
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/'
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
