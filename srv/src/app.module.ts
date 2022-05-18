import { Module } from '@nestjs/common';
import {Db} from "./persistance/db";
import {FamiliesDAO} from "./persistance/families.dao";
import {FamiliesController} from "./controllers/families.controller";
import {AppService} from "./services/app.service";
import {AuthController} from "./controllers/auth.controller";
import {CheckinsController} from "./controllers/checkins.controller";
import {CheckinsDAO} from "./persistance/checkins.dao";

@Module({
  imports: [],
  controllers: [FamiliesController, AuthController, CheckinsController],
  providers: [
      AppService,
      Db, FamiliesDAO, CheckinsDAO
  ],
})
export class AppModule {}
