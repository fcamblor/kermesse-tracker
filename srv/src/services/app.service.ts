import { Injectable } from '@nestjs/common';
import {FamiliesDAO} from "../persistance/families.dao";
import {Optional} from "@shared/utils/Optional";
import {CheckinsDAO} from "../persistance/checkins.dao";
import {SchoolChildrenDAO} from "../persistance/schoolChildren.dao";

@Injectable()
export class AppService {
  constructor(
      private readonly familiesDao: FamiliesDAO,
      private readonly schoolChildrenDao: SchoolChildrenDAO,
      private readonly checkinsDao: CheckinsDAO
  ) {
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

    async createThenGetAllCheckins(year: number, checkins: Checkin[]) {
      if(checkins.length) {
          await this.checkinsDao.createOrUpdateCheckinsForYear(year, checkins);
      }
      return await this.checkinsDao.fetchAllCheckinsForYear(year);
    }

    async createOrUpdateSchoolChildren(year: number, schoolChildren: SchoolChild[]) {
        const yearCount = await this.schoolChildrenDao.countYearCount(year);

        if(yearCount === 0) {
            await this.schoolChildrenDao.createSchoolChildrenEntry(year, schoolChildren);
        } else {
            await this.schoolChildrenDao.updateSchoolChildrenEntry(year, schoolChildren);
        }
    }

    async findSchoolChildrenByYear(year: number) {
        return await this.schoolChildrenDao.findSchoolChildrenByYear(year);
    }
}
