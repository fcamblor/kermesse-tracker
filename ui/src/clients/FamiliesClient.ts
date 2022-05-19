import {ClientDatasource} from "./ClientDatasource";
import {MemoizeExpiring} from "typescript-memoize";
import { membersMatch } from "@shared/domain/Members";


export class FamiliesClient {
    public static readonly INSTANCE = new FamiliesClient();

    @MemoizeExpiring(1000*60*60, (year: number) => year)
    public async fetchFamilies(year: number): Promise<Family[]> {
        return await ClientDatasource.INSTANCE.query({
            method: 'GET',
            path: `/families/${year}`,
            dataTransformer: (payload: Family[]) => payload.map((f: Family) => ({
                ...f,
                schoolChildren: f.schoolChildren.map((sc: Omit<SchoolChild, "isSchoolChild">) => ({...sc, isSchoolChild: true})),
                members: f.members.map((m: Omit<Member, "isSchoolChild">) => ({...m, isSchoolChild: false})),
            }))
        })
    }

    @MemoizeExpiring(1000*60*60, (year: number) => year)
    public async fetchSchoolChildren(year: number): Promise<SchoolChild[]> {
        return await ClientDatasource.INSTANCE.query({
            method: 'GET',
            path: `/schoolChildren/${year}`,
        })
    }

    @MemoizeExpiring(1000*60*60, (year: number) => year)
    public async fetchComputedFamilies(year: number): Promise<Family[]> {
        const [ families, schoolChildren ] = await Promise.all([
            this.fetchFamilies(year),
            this.fetchSchoolChildren(year)
        ])

        const familySchoolChildren = families.flatMap(f => f.schoolChildren);
        const schoolChildrenNotBeingPartOfAFamily = schoolChildren.filter(sc => !familySchoolChildren.find(fsc => membersMatch(fsc, sc)))
        return families.concat(schoolChildrenNotBeingPartOfAFamily.map(sc => ({
            schoolChildren: [sc],
            members: [],
            lastName: sc.lastName,
            plannedCounts: {
                adults: 0,
                nonSchoolChildren: 0,
                schoolChildren: 1
            }
        })));
    }
}
