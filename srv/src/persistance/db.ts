import {Injectable} from "@nestjs/common";
import {Pool} from "pg";
import * as crypto from 'crypto';

@Injectable()
export class Db {
    private readonly pool: Pool;
    constructor() {
        const ssl = process.env.DEV_MODE==='true' ? false : { rejectUnauthorized: false } // Only enable TLS/SSL connections for Heroku.
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl,
        });

        // The pool with emit an error on behalf of any idle clients it contains if a backend error or network partition happens.
        this.pool.on("error", (err) => {
            console.error('Unexpected error on idle client "DATABASE" class: ', err);
            process.exit(-1);
        });
    }

    async query(query: string, ...values: any[]) {
        const client = await this.pool.connect();
        try {
            return await client.query(query, values);
        } finally {
            client.release();
        }
    }

    async associate<ADDITIONNAL_COLUMN_NAMES extends string>(
        tableDesc: { tableName: string, mainColumnName: string, associationColumnName: string, additionnalColumnNames?: ADDITIONNAL_COLUMN_NAMES[] },
        mainColumnValue: string, associationEntries: ({ _val: string } & {[columnName in ADDITIONNAL_COLUMN_NAMES]: any})[]
    ) {
        const results = await this.query(`SELECT ${tableDesc.associationColumnName} FROM ${tableDesc.tableName} WHERE ${tableDesc.mainColumnName} = $1`, mainColumnValue)
        const persistedAssociationValues = results.rows.map(values => values[tableDesc.associationColumnName])

        const associationValues = associationEntries.map(v => v._val);

        const associationValuesToRemove = persistedAssociationValues.filter(value => !associationValues.includes(value));
        const associationEntriesToInject = associationEntries.filter(entry => !persistedAssociationValues.includes(entry._val));

        if(associationValuesToRemove.length) {
            await this.query(
                `DELETE FROM ${tableDesc.tableName} WHERE ${tableDesc.mainColumnName} = $1 AND ${tableDesc.associationColumnName} IN ($2)`,
                mainColumnValue,
                associationValuesToRemove
            )
        }

        if(associationEntriesToInject.length) {
            const paramValues = [], queryValues = [];
            associationEntriesToInject.forEach((associationEntryToInject, index) => {
                paramValues.push(mainColumnValue)
                paramValues.push(associationEntryToInject._val)
                let queryParams = `($${(index * (tableDesc.additionnalColumnNames.length+2))+1},$${(index * (tableDesc.additionnalColumnNames.length+2))+2}`
                tableDesc.additionnalColumnNames.forEach((addColName, addColIndex) => {
                    paramValues.push(associationEntryToInject[addColName])
                    queryParams += `, $${(index * (tableDesc.additionnalColumnNames.length+2))+3+addColIndex}`
                })
                queryParams += ')';
                queryValues.push(queryParams)
            })
            await this.query(
                `
                    INSERT INTO ${tableDesc.tableName} (
                       ${tableDesc.mainColumnName}, ${tableDesc.associationColumnName} ${tableDesc.additionnalColumnNames.map(colName => ", "+colName).join("")} 
                    ) VALUES ${queryValues.join(", ")}
                `, ...paramValues
            )
        }

        return {
            removed: associationValuesToRemove,
            added: associationEntriesToInject.map(val => val._val)
        }
    }

    static newUUID() {
        return crypto.randomUUID();
    }
}
