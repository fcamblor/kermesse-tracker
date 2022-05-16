
declare type Member = {
    firstName: string;
    lastName: string;
    isSchoolChild: boolean;
}

declare type FirstAndLastMemberName = Pick<Member, "firstName"|"lastName">;

declare type SchoolChild = Member & {
    className: string;
    isSchoolChild: true;
}

declare type Family = {
    lastName: string;
    members: Member[];
    schoolChildren: SchoolChild[];
    plannedCounts: {
        adults: number;
        schoolChildren: number;
        nonSchoolChildren: number;
    }
}

declare type Checkin = {
    isoDate: string;
    members: Member[];
    familyLastName?: string;
    counts: {
        adults: number;
        schoolChildren: number;
        nonSchoolChildren: number;
    }
}

declare type FamilyWithCheckins = {
    family: Family;
    pastCheckins: Checkin[];
}

declare type Settings = {
    baseUrl: string;
    authToken: string;
    deviceName: string;
}

declare type JSONValue =
    | string
    | number
    | boolean
    | { [x: string]: JSONValue }
    | Array<JSONValue>;
