
export class PersistedCheckins {
    static store(checkins: Checkin[]) {
        localStorage.setItem("checkins", JSON.stringify(checkins));
        return Promise.resolve();
    }

    static load(): Promise<Checkin[]> {
        const checkins: Checkin[] = JSON.parse(localStorage.getItem("checkins") || "[]");
        return Promise.resolve(checkins);
    }
}
