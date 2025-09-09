import ApiResolver from "@/utils/ApiResolver";

export enum AgeCategories {
    EARLY_PRESCHOOL = "PRESCHOOL_1",
    PRESCHOOL = "PRESCHOOL_2",
    EARLY_SCHOOL = "SCHOOL_1",
    SCHOOL = "SCHOOL_2",
    HIGH_SCHOOL = "SCHOOL_3",
}

export class CompetitionResolver {
    private apiResolver = new ApiResolver()
    private token = localStorage.getItem('access_token')
}