import {membersMatch} from "@shared/domain/Members";

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
