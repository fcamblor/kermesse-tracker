import { Module } from '@nestjs/common';
import {FamiliesDAO} from "./persistance/families.dao";
import {FamiliesController} from "./controllers/families.controller";
import {AppService} from "./services/app.service";
import {AuthController} from "./controllers/auth.controller";
import {CheckinsController} from "./controllers/checkins.controller";
import {CheckinsDAO} from "./persistance/checkins.dao";
import {SchoolChildrenDAO} from "./persistance/schoolChildren.dao";
import {SchoolChildrenController} from "./controllers/schoolchildren.controller";

@Module({
  imports: [],
  controllers: [FamiliesController, SchoolChildrenController, AuthController, CheckinsController],
  providers: [
      AppService,
      FamiliesDAO, SchoolChildrenDAO, CheckinsDAO
  ],
})
export class AppModule {}
