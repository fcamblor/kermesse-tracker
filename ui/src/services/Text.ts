
export function toFullTextNormalized(value: string) {
    // /!\ important note : this method is shared between the communes-import.ts tooling file
    // and Autocomplete.ts. The Commune lists are hence pre-computed and then fetched using
    // normalized prefixes that were created using this method.
    // Hence its extraction into a reusable/shareable mjs file
    return value.toLowerCase().trim()
        .replace(/[-\s']/gi, "_")
        .replace(/[èéëêêéè]/gi, "e")
        .replace(/[áàâäãåâà]/gi, "a")
        .replace(/[çç]/gi, "c")
        .replace(/[íìîï]/gi, "i")
        .replace(/[ñ]/gi, "n")
        .replace(/[óòôöõô]/gi, "o")
        .replace(/[úùûüûù]/gi, "u")
        .replace(/[œ]/gi, "oe");
}

export function numberInputValue(eventTarget: EventTarget|null, fallbackValue: number): number {
    if(!eventTarget) {
        return fallbackValue;
    }
    const inputEl = eventTarget as HTMLInputElement;
    return isNaN(inputEl.valueAsNumber)?fallbackValue:inputEl.valueAsNumber;
}
