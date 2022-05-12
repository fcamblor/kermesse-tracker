
declare type Member = {
    firstName: string;
    lastName: string;
    type: 'adult'|'child'|'schoolchild'
}

declare type SchoolChild = Member & {
    className: string;
    type: 'schoolchild'
}

declare type Family = {
    lastName: string;
    members: Member[];
    schoolChildren: SchoolChild[];
}

declare type Checkin = {
    isoDate: string;
    members: Member[];
    familyLastName?: string;
}
