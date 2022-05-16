import { Injectable } from '@nestjs/common';
import {FamiliesDAO} from "../persistance/families.dao";
import {Optional} from "@shared/utils/Optional";

@Injectable()
export class AppService {
  constructor(private readonly familiesDao: FamiliesDAO) {
  }

  async createOrUpdateFamily(year: number, families: Family[]) {
      const yearCount = await this.familiesDao.countYearCount(year);

      if(yearCount === 0) {
          await this.familiesDao.createFamiliesEntry(year, families);
      } else {
          await this.familiesDao.updateFamiliesEntry(year, families);
      }
  }

    async findFamiliesByYear(year: number): Promise<Optional<Family[]>> {
        return await this.familiesDao.findFamiliesByYear(year);
    }
}
