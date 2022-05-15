import {Controller, Get, HttpStatus, Res} from '@nestjs/common';
import {AppService} from "../services/app.service";
import {Response} from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly appService: AppService) {}

  @Get("/check")
  async createScrapEntry(@Res() resp: Response) {
    resp.status(HttpStatus.OK).json(JSON.stringify({status: "OK"}))
  }
}
