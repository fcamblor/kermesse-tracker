import { Injectable } from '@nestjs/common';
import {Db, kyselyDb} from "./db";

@Injectable()
export class CheckinsDAO {
    constructor() {
    }

    async createOrUpdateCheckinsForYear(year: number, checkins: Checkin[]) {
        await Promise.all(
            checkins.map(async checkin => {
                const {creator, isoDate, ...otherCheckinFields} = checkin

                const uuid = Db.newUUID();

                await kyselyDb.insertInto("checkins").values({
                    id: uuid,
                    inserted_at: new Date(),
                    recorded_at: isoDate,
                    recorded_by: creator,
                    year,
                    content: JSON.stringify(otherCheckinFields)
                }).onConflict(oc => oc.constraint("checkins_recorded_at_recorded_by_key").doNothing())
                .executeTakeFirstOrThrow()
            })
        )
    }

    async fetchAllCheckinsForYear(year: number): Promise<Checkin[]> {
        return (await kyselyDb.selectFrom("checkins")
            .select(["recorded_by as creator", "recorded_at as isodate", "content"])
            .where("year", "=", year)
            .execute()).map(row => ({
                creator: row.creator as string,
                isoDate: row.isodate as string,
                ...(row.content as Omit<Checkin, "creator"|"isoDate">)
            }))
    }
}
