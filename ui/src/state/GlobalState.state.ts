import {PersistedCheckins, PersistedSettings} from "../persistance/LocalstoragePersistor";
import {deepCloneObjectLiteral} from "@shared/utils/ObjectLiterals";

type StateEventTypes = {
    "change:settings": Settings|undefined
};

export type StateEvent = keyof StateEventTypes;
export type StateEventHandler<T extends StateEvent> = (context: StateEventTypes[T]) => void;

type StateEventsListeners = {
    [eventType in StateEvent]: Array<StateEventHandler<eventType>>
}

export class GlobalState {
    public static readonly INSTANCE = new GlobalState();

    private _listeners: StateEventsListeners = {
        "change:settings": []
    };

    private _localCheckins: Checkin[] = [];
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
        this._listeners[event].forEach(callback => callback(context));
    }

    public async init() {
        return Promise.all([
            PersistedCheckins.load().then(checkins => {
                this._localCheckins = checkins
            }),
            PersistedSettings.load().then(settings => {
                if(settings !== this._settings) {
                    this.updateSettings(settings);
                }
            })
        ])
    }

    public localCheckins() { return this._localCheckins; }
    public settings() { return this._settings; }

    public async addLocalCheckin(checkin: Checkin) {
        this._localCheckins.push(checkin);
        await PersistedCheckins.store(this._localCheckins);
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
        this.triggerEvent("change:settings", this._settings?deepCloneObjectLiteral(this._settings):undefined);
    }
}
