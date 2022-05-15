import {PersistedCheckins} from "../persistance/LocalstoragePersistor";

export class GlobalState {
    public static readonly INSTANCE = new GlobalState();

    private _localCheckins: Checkin[] = [];

    public async init() {
        return Promise.all([
            PersistedCheckins.load().then(checkins => {
                this._localCheckins = checkins
            })
        ])
    }

    public localCheckins() {
        return this._localCheckins;
    }

    public async addLocalCheckin(checkin: Checkin) {
        this._localCheckins.push(checkin);
        await PersistedCheckins.store(this._localCheckins);
    }
}
