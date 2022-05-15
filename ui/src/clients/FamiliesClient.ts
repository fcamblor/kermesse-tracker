import {ClientDatasource} from "./ClientDatasource";
import {MemoizeExpiring} from "typescript-memoize";


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
}
