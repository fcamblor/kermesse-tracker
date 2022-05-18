import { Injectable } from '@nestjs/common';
import {Db} from "./db";

@Injectable()
export class CheckinsDAO {
    constructor(private readonly db: Db) {
    }

    async createOrUpdateCheckinsForYear(year: number, checkins: Checkin[]) {
        await Promise.all(
            checkins.map(async checkin => {
                const {creator, isoDate, ...otherCheckinFields} = checkin

                const uuid = Db.newUUID();
                await this.db.query(`
                INSERT INTO checkins(id, inserted_at, recorded_at, recorded_by, year, content)
                VALUES($1, $2, $3, $4, $5, $6)
                ON CONFLICT ON CONSTRAINT checkins_recorded_at_recorded_by_key
                DO NOTHING
            `, ...[
                    uuid, new Date(), isoDate, creator, year, JSON.stringify(otherCheckinFields)
                ]);
            })
        )
    }

    async fetchAllCheckinsForYear(year: number): Promise<Checkin[]> {
        return (await this.db.query(`
          SELECT 
              recorded_by as creator,
              recorded_at as isodate,
              content as content
          FROM checkins WHERE year = $1
        `, ...[
            year
        ])).rows.map(row => {
            const content = row['content'] as Omit<Checkin, "creator"|"isoDate">;
            return {
                creator: row['creator'],
                isoDate: row['isodate'],
                ...content
            };
        })
    }
}
