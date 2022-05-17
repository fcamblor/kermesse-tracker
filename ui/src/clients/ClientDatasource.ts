import {stripEnd, stripStart} from "@shared/utils/Text";


export type DatasourceConfig = {
    baseUrl: string;
    authToken: string;
}

export type QueryConfig<T, R> = {
    path: string
    headers?: Record<string, string>,
    queryParams?: Record<string, string>,
    dataTransformer?: (respPayload: any) => R
} & (
    { method: "GET"|"DELETE" }
    | {method: "POST"|"PUT", data: T }
);

export class ClientDatasource {
    public static readonly INSTANCE = new ClientDatasource();
    private config: DatasourceConfig|undefined = undefined;

    public isConfigured(): boolean {
        return !!this.config;
    }

    public use(config: DatasourceConfig): this {
        this.config = { ...config, baseUrl: stripEnd(config.baseUrl, "/") };
        return this;
    }

    public async query<T, R = void>(opts: QueryConfig<T, R>): Promise<R> {
        if(!this.config) {
            throw new Error(`No config defined for ClientDatasource: call use() on it first !`)
        }

        const url = this.config.baseUrl
            + '/'
            + stripStart(opts.path, "/")
            + (opts.queryParams?`?${new URLSearchParams(opts.queryParams)}`:"");

        const resp = await fetch(url, {
            method: opts.method,
            headers: {
                ...opts.headers,
                'Authorization': this.config.authToken,
            },
            body: (opts.method==='PUT'||opts.method==='POST')?JSON.stringify(opts.data):undefined,
        });

        if(resp.status < 200 || resp.status >= 300) {
            throw new Error(`Error while calling ${opts.method} ${url} => status=${resp.status} ${await resp.text()}`)
        }

        const resultBeforeTransformation = await resp.json();
        const transformer = opts.dataTransformer || ((res: R) => res)
        return transformer(resultBeforeTransformation);
    }
}
