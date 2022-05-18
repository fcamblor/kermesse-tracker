import {Body, Controller, Param, ParseIntPipe, Post,} from '@nestjs/common';
import {AppService} from "../services/app.service";

@Controller("checkins")
export class CheckinsController {
  constructor(private readonly appService: AppService) {}

  @Post("/:year")
  async createThenGetAllCheckins(@Param("year", ParseIntPipe) year: number, @Body() checkins: Checkin[]): Promise<Checkin[]> {
    const persistedCheckins =  await this.appService.createThenGetAllCheckins(year, checkins);
    return persistedCheckins;
  }
}
