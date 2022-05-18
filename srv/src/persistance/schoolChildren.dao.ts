import { Injectable } from '@nestjs/common';
import {Db} from "./db";
import {Optional} from "@shared/utils/Optional";

@Injectable()
export class SchoolChildrenDAO {
    constructor(private readonly db: Db) {
    }

    async countYearCount(year: number): Promise<number> {
        return (await this.db.query(`
          SELECT count(*) as count FROM school_children WHERE year = $1
        `, ...[
            year
        ])).rows.map(row =>
            Number(row['count'])
        )[0];
    }

    async createSchoolChildrenEntry(year: number, schoolChildren: SchoolChild[]) {
        const uuid = Db.newUUID();
        await this.db.query(`
            INSERT INTO school_children (id, year, content)
            VALUES ($1, $2, $3)
        `, ...[
            uuid, year, JSON.stringify(schoolChildren)
        ])
    }

    async updateSchoolChildrenEntry(year: number, schoolChildren: SchoolChild[]) {
        await this.db.query(`
                UPDATE school_children SET content = $1 WHERE year = $2
            `, ...[
            JSON.stringify(schoolChildren), year
        ])
    }

    async findSchoolChildrenByYear(year: number): Promise<Optional<SchoolChild[]>> {
        return Optional.fromNullable((await this.db.query(`
            SELECT content FROM school_children WHERE year = $1
        `, ...[ year ])).rows.map(row =>
            row["content"] as SchoolChild[]
        )[0])
    }
}
