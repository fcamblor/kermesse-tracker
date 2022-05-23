import {membersMatch} from "./Members";
import {Optional} from "../utils/Optional";

export function findFamilyContaining(families: Family[], member: Member): Optional<Family> {
    const matchingFamily = families.find(family => {
        const members = familyMembers(family);
        return members.reduce((memberFound, candidate) => {
            return memberFound || membersMatch(member, candidate);
        }, false as boolean);
    })

    if(matchingFamily) {
        return Optional.of(matchingFamily);
    }

    // console.error(`Family matching ${JSON.stringify(member)} not found !`);
    return Optional.absent();
}

export function familyMembers(family: Family): Member[] {
    return family.members.concat(family.schoolChildren);
}

export function familiesMembers(families: Family[]): Member[] {
    return families.flatMap(familyMembers);
}
