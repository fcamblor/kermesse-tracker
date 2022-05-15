import {Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Post, Res} from '@nestjs/common';
import { Response } from 'express';
import {AppService} from "../services/app.service";

@Controller("families")
export class FamiliesController {
  constructor(private readonly appService: AppService) {}

  @Post("/:year")
  async createScrapEntry(@Param("year", ParseIntPipe) year: number, @Body() families: Family[]): Promise<void> {
    await this.appService.createOrUpdateFamily(year, families);
  }

  @Get("/:year")
  async getFamiliesByYear(@Param("year", ParseIntPipe) year: number, @Res() resp: Response): Promise<void> {
    (await this.appService.findFamiliesByYear(year)).consume(
        (families) => resp.status(HttpStatus.OK).json(families),
        () => resp.status(HttpStatus.NOT_FOUND).send()
    );
  }
}
