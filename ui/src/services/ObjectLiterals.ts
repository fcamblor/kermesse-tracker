

export function deepCloneObjectLiteral<T extends JSONValue>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}
