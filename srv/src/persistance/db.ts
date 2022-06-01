import {Pool} from "pg";
import * as crypto from 'crypto';
import {Kysely, PostgresDialect} from "kysely";
import {DB} from "kysely-codegen";

export class Db {
    static newUUID() {
        return crypto.randomUUID();
    }
}

export const kyselyDb = new Kysely<DB>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.DEV_MODE==='true' ? false : { rejectUnauthorized: false } // Only enable TLS/SSL connections for Heroku.
        })
    })
})
