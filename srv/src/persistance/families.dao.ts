import { Injectable } from '@nestjs/common';
import {Db} from "./db";
import {Optional} from "@shared/utils/Optional";

@Injectable()
export class FamiliesDAO {
    constructor(private readonly db: Db) {
    }

    async countYearCount(year: number): Promise<number> {
        return (await this.db.query(`
          SELECT count(*) as count FROM families WHERE year = $1
        `, ...[
            year
        ])).rows.map(row =>
            Number(row['count'])
        )[0];
    }

    async createFamiliesEntry(year: number, families: Family[]) {
        const uuid = Db.newUUID();
        await this.db.query(`
            INSERT INTO families (id, year, content)
            VALUES ($1, $2, $3)
        `, ...[
            uuid, year, JSON.stringify(families)
        ])
    }

    async updateFamiliesEntry(year: number, families: Family[]) {
        await this.db.query(`
                UPDATE families SET content = $1 WHERE year = $2
            `, ...[
            JSON.stringify(families), year
        ])
    }

    async findFamiliesByYear(year: number): Promise<Optional<Family[]>> {
        return Optional.fromNullable((await this.db.query(`
            SELECT content FROM families WHERE year = $1
        `, ...[ year ])).rows.map(row =>
            row["content"] as Family[]
        )[0])
    }
}
