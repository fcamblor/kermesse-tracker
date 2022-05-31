import {PersistedLocalCheckins, PersistedSettings} from "../persistance/LocalstoragePersistor";
import {deepCloneObjectLiteral} from "@shared/utils/ObjectLiterals";
import {CheckinsClient} from "../clients/CheckinsClient";

type StateEventTypes = {
    "change:settings": Settings|undefined,
    "change:checkins": Checkin[],
    "change:localCheckins": Checkin[]
};

export type StateEvent = keyof StateEventTypes;
export type StateEventHandler<T extends StateEvent> = (context: StateEventTypes[T]) => Promise<void>;

type StateEventsListeners = {
    [eventType in StateEvent]: Array<StateEventHandler<eventType>>
}

export class GlobalState {
    public static readonly INSTANCE = new GlobalState();

    private _listeners: StateEventsListeners = {
        "change:settings": [],
        "change:checkins": [],
        "change:localCheckins": [],
    };

    private _localCheckins: Checkin[] = [];
    private _checkins: Checkin[] = [];
    private _settings: Settings|undefined = undefined;

    public subscribe<E extends StateEvent>(event: E, callback: StateEventHandler<E>): () => void {
        this._listeners[event].push(callback);

        const cleaner = () => {
            const index = this._listeners[event].findIndex(c => c === callback);
            if(index !== -1) {
                this._listeners[event].splice(index, 1);
            }
        }
        return cleaner;
    }

    private triggerEvent<E extends StateEvent>(event: E, context: StateEventTypes[E]) {
        return Promise.all(
            this._listeners[event].map(callback => callback(context))
        );
    }

    public async init() {
        return await Promise.all([
            (async () => {
                this._localCheckins = await PersistedLocalCheckins.load();
                this.subscribe("change:localCheckins", async () => await PersistedLocalCheckins.store(this._localCheckins) )
            })(),
            (async () => {
                const settings = await PersistedSettings.load();
                if(settings !== this._settings) {
                    await this.updateSettings(settings);
                }
            })()
        ])
    }

    public checkins() { return this._checkins; }
    public localCheckins() { return this._localCheckins; }
    public everyCheckins() { return this._checkins.concat(this._localCheckins); }
    public settings() { return this._settings; }

    public async addLocalCheckin(checkin: Checkin) {
        this._localCheckins.push(checkin);
        await this.triggerEvent("change:localCheckins", this._localCheckins)
    }

    public async updateSettings(settings: Settings|undefined, skipStoring: boolean = false) {
        if(!skipStoring) {
            if(settings) {
                await PersistedSettings.store(settings);
            } else {
                await PersistedSettings.delete();
            }
        }
        this._settings = settings;
        await this.triggerEvent("change:settings", this._settings?deepCloneObjectLiteral(this._settings):undefined);
    }

    public async synchronizeCheckins() {
        await Promise.all([
            (async () => {
                this._checkins = await CheckinsClient.INSTANCE.synchronizeCheckins(new Date().getFullYear(), this._localCheckins)
                await this.triggerEvent("change:checkins", this._checkins)
            })(),
            (async () => {
                this._localCheckins = [];
                await this.triggerEvent("change:localCheckins", this._localCheckins)
            })()
        ])
    }
}
