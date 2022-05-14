import {padLeft} from "./Text";


export function formatTime(isoDateStr: string) {
    const date = new Date(Date.parse(isoDateStr))
    return `${padLeft(""+date.getHours(), 2, "0")}:${padLeft(""+date.getMinutes(), 2, "0")}`
}
