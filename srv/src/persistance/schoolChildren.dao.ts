import { Injectable } from '@nestjs/common';
import {Db, kyselyDb} from "./db";
import {Optional} from "@shared/utils/Optional";

@Injectable()
export class SchoolChildrenDAO {
    constructor() {
    }

    async countYearCount(year: number): Promise<number> {
        return Number((await kyselyDb.selectFrom("school_children")
            .select(kyselyDb.fn.count("id").as("count"))
            .where("year", "=", year)
            .executeTakeFirst()).count)
    }

    async createSchoolChildrenEntry(year: number, schoolChildren: SchoolChild[]) {
        const uuid = Db.newUUID();
        await kyselyDb.insertInto("school_children")
            .values({
                id: uuid,
                year,
                content: JSON.stringify(schoolChildren)
            }).execute();
    }

    async updateSchoolChildrenEntry(year: number, schoolChildren: SchoolChild[]) {
        await kyselyDb.updateTable("school_children")
            .where("year", "=", year)
            .set({ content: JSON.stringify(schoolChildren) })
            .execute();
    }

    async findSchoolChildrenByYear(year: number): Promise<Optional<SchoolChild[]>> {
        return Optional.fromNullable(
            (await kyselyDb.selectFrom("school_children")
                .select("content")
                .where("year", "=", year)
                .executeTakeFirst()
            )?.content as SchoolChild[]
        )
    }
}
