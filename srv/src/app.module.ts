import { Module } from '@nestjs/common';
import {Db} from "./persistance/db";
import {FamiliesDAO} from "./persistance/families.dao";
import {FamiliesController} from "./controllers/families.controller";
import {AppService} from "./services/app.service";

@Module({
  imports: [],
  controllers: [FamiliesController],
  providers: [
      AppService,
      Db, FamiliesDAO
  ],
})
export class AppModule {}
