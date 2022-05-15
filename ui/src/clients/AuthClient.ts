import {ClientDatasource, DatasourceConfig} from "./ClientDatasource";


export class AuthClient {
    public static readonly INSTANCE = new AuthClient();

    public async verifyAuthValid(datasourceConfig: DatasourceConfig): Promise<boolean> {
        const datasource = new ClientDatasource().use(datasourceConfig)
        try {
            await datasource.query({
                method: 'GET',
                path: `/auth/check`
            })
            return true;
        }catch(e) {
            return false;
        }
    }
}
