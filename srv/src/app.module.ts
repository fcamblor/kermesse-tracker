import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {Db} from "./persistance/db";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
      AppService,
      Db
  ],
})
export class AppModule {}
