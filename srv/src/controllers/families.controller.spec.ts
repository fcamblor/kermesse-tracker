import { Test, TestingModule } from '@nestjs/testing';
import {FamiliesController} from "./families.controller";
import {AppService} from "../services/app.service";

describe('FamiliesController', () => {
  let familiesController: FamiliesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FamiliesController],
      providers: [AppService],
    }).compile();

    familiesController = app.get<FamiliesController>(FamiliesController);
  });

  describe('root', () => {
    // it('should return "Hello World!"', () => {
    //   expect(familiesController.getHello()).toBe('Hello World!');
    // });
  });
});
