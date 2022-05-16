
export function numberInputValue(eventTarget: EventTarget|null, fallbackValue: number): number {
    if(!eventTarget) {
        return fallbackValue;
    }
    const inputEl = eventTarget as HTMLInputElement;
    return isNaN(inputEl.valueAsNumber)?fallbackValue:inputEl.valueAsNumber;
}

export function inputValue(eventTarget: EventTarget|null, fallbackValue: string|undefined = undefined): string|undefined {
    if(!eventTarget) {
        return fallbackValue;
    }
    const inputEl = eventTarget as HTMLInputElement;
    return inputEl.value;
}
