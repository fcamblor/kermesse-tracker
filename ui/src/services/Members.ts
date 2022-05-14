import {toFullTextNormalized} from "./Text";


export function membersMatch(member1: Member, member2: Member): boolean {
    return toFullTextNormalized(member1.lastName).toLowerCase() === toFullTextNormalized(member2.lastName).toLowerCase()
        && toFullTextNormalized(member1.firstName).toLowerCase() === toFullTextNormalized(member2.firstName).toLowerCase();
}

export function memberKey(member: Member): string {
    return `${member.lastName.toUpperCase()} ${member.firstName}`;
}