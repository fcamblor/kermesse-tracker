

class Persistor<T> {
    constructor(private readonly storeName: string, private readonly fallbackValueFactory: () => T) {
    }

    store(obj: T) {
        localStorage.setItem(this.storeName, JSON.stringify(obj));
        return Promise.resolve();
    }

    load(): Promise<T> {
        const persistedStr = localStorage.getItem(this.storeName);
        const obj: T = persistedStr?JSON.parse(persistedStr):this.fallbackValueFactory();
        return Promise.resolve(obj);
    }
}

export const PersistedCheckins = new Persistor<Checkin[]>("checkins", () => [])
