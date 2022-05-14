import {membersMatch} from "./Members";

export function findPastCheckinsMatchingFamily(checkins: Checkin[], family: Family): Checkin[] {
    return checkins.filter(c => c.familyLastName?.toUpperCase() === family.lastName.toUpperCase());
}

export function findFamilyMembersNeverCheckedIn(family: Family, pastCheckins: Checkin[]) {
    const familyMembersNeverCheckedIn = family.members.filter(fm =>
        !pastCheckins.find(pc => !!pc.members.find(m => membersMatch(m, fm)))
    )
    return familyMembersNeverCheckedIn;
}

export function pastCheckinMembers(pastCheckins: Checkin[]): Member[] {
    return pastCheckins.flatMap(pc => pc.members);
}
