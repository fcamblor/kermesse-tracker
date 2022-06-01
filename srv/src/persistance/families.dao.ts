import { Injectable } from '@nestjs/common';
import {Db, kyselyDb} from "./db";
import {Optional} from "@shared/utils/Optional";

@Injectable()
export class FamiliesDAO {
    constructor() {
    }

    async countYearCount(year: number): Promise<number> {
        return Number((
            await kyselyDb.selectFrom('families')
                .select(kyselyDb.fn.count<string>("id").as("cpt"))
                .where("year", "=", year)
                .executeTakeFirst()
        ).cpt);
    }

    async createFamiliesEntry(year: number, families: Family[]) {
        const uuid = Db.newUUID();
        await kyselyDb.insertInto('families').values({
            id: uuid,
            year,
            content: JSON.stringify(families)
        }).executeTakeFirstOrThrow()
    }

    async updateFamiliesEntry(year: number, families: Family[]) {
        await kyselyDb.updateTable('families')
            .where("year", "=", year)
            .set({ content: JSON.stringify(families) })
            .execute()
    }

    async findFamiliesByYear(year: number): Promise<Optional<Family[]>> {
        return Optional.fromNullable((await kyselyDb.selectFrom('families')
            .select('content')
            .where('year', '=', year)
            .executeTakeFirst())?.content as Family[]);
    }
}
