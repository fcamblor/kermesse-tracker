
declare type Member = {
    firstName: string;
    lastName: string;
    isSchoolChild: boolean;
}

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
