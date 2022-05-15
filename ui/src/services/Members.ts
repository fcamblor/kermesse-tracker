import {toFullTextNormalized} from "./Text";

export type FirstAndLastMemberName = Pick<Member, "firstName"|"lastName">;

export function membersMatch(member1: FirstAndLastMemberName, member2: FirstAndLastMemberName): boolean {
    return toFullTextNormalized(member1.lastName).toLowerCase() === toFullTextNormalized(member2.lastName).toLowerCase()
        && toFullTextNormalized(member1.firstName).toLowerCase() === toFullTextNormalized(member2.firstName).toLowerCase();
}

export function memberKey(member: Member): string {
    return `${member.lastName.toUpperCase()} ${member.firstName}`;
}

export function encodeMemberToUrlParam(member: Member): string {
    return btoa(JSON.stringify({
        lastName: member.lastName,
        firstName: member.firstName
    }));
}

export function decodeMemberUrlParam(members: Member[], param: string): Member {
    const firstAndLastName: FirstAndLastMemberName = JSON.parse(atob(param));
    const member = members.find(m => membersMatch(m, firstAndLastName));
    if(member) {
        return member;
    }

    throw new Error(`No member found matching ${JSON.stringify(firstAndLastName)}`);
}
