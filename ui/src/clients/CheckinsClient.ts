import {ClientDatasource} from "./ClientDatasource";


export class CheckinsClient {
    public static readonly INSTANCE = new CheckinsClient();

    public async synchronizeCheckins(year: number, checkins: Checkin[]): Promise<Checkin[]> {
        return await ClientDatasource.INSTANCE.query({
            method: 'POST',
            path: `/checkins/${year}`,
            data: checkins
        })
    }
}
