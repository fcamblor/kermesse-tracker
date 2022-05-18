import {Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Post, Res} from '@nestjs/common';
import { Response } from 'express';
import {AppService} from "../services/app.service";

@Controller("schoolChildren")
export class SchoolChildrenController {
  constructor(private readonly appService: AppService) {}

  @Post("/:year")
  async createOrUpdateSchoolChildren(@Param("year", ParseIntPipe) year: number, @Body() schoolChildren: SchoolChild[]): Promise<void> {
    await this.appService.createOrUpdateSchoolChildren(year, schoolChildren);
  }

  @Get("/:year")
  async getSchoolChildrenByYear(@Param("year", ParseIntPipe) year: number, @Res() resp: Response): Promise<void> {
    (await this.appService.findSchoolChildrenByYear(year)).consume(
        (schoolChildren) => resp.status(HttpStatus.OK).json(schoolChildren),
        () => resp.status(HttpStatus.NOT_FOUND).send()
    );
  }
}
