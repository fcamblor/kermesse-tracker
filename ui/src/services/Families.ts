import {membersMatch} from "./Members";

export function findFamilyContaining(families: Family[], member: Member): Family {
    const matchingFamily = families.find(family => {
        const members = familyMembers(family);
        return members.reduce((memberFound, candidate) => {
            return memberFound || membersMatch(member, candidate);
        }, false as boolean);
    })

    if(matchingFamily) {
        return matchingFamily;
    }

    throw new Error(`Family matching ${JSON.stringify(member)} not found !`);
}

export function familyMembers(family: Family): Member[] {
    return family.members.concat(family.schoolChildren);
}

export function familiesMembers(families: Family[]): Member[] {
    return families.flatMap(familyMembers);
}
