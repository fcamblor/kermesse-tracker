
export class Optional<T> {
    private constructor(private readonly _value: T|null, private readonly _isAbsent: boolean){}

    public isDefined(): boolean { return !this._isAbsent; }
    public isAbsent(): boolean { return this._isAbsent; }
    public whenDefined(callback: (value: T) => void) {
        if(this.isDefined()) {
            callback(this._value);
        }
    }

    public ensureDefinedThenGet(): T {
        if(this.isAbsent()) {
            throw new Error("Error when retrieving Optional value");
        }
        return this._value;
    }

    public map<U>(transformer: (v: T) => U): Optional<U> {
        return this.isDefined()?Optional.fromNullable(transformer(this._value)):Optional.absent<U>();
    }
    public flatMap<U>(transformer: (v: T) => Optional<U>): Optional<U> {
        return this.isDefined()?transformer(this._value):Optional.absent();
    }

    public orElse(value: T): T {
        return this.isDefined()?this._value:value;
    }
    public getOrElse(callback: () => T): T {
        return this.isDefined()?this._value:callback();
    }
    public orNull(): T|null {
        return this.isDefined()?this._value:null;
    }
    public mapIfAbsent(supplier: () => Optional<T>): Optional<T> {
        return this.isAbsent()?supplier():this;
    }
    public cast<U extends T>(): Optional<U> {
        return Optional.fromNullable<U>(this._value as U);
    }

    public consume<R1, R2>(successCallback: (value: T) => R1, errorCallback: () => R2 = () => { return null; }) {
        if(this.isDefined()) {
            return successCallback(this._value);
        } else {
            return errorCallback();
        }
    }

    public static of<T>(value: T) { return new Optional<T>(value, false); }
    public static absent<T>() { return new Optional<T>(null, true); }
    public static fromNullable<T>(value: T|null) { return new Optional<T>(value, value === null || value === undefined); }
}
