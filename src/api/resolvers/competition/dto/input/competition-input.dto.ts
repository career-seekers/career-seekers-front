import {AgeCategories} from "@/api/resolvers/competition/competition.resolver";

export interface CompetitionInputDto {
    name: string;
    description: string;
    ageCategory: AgeCategories;
    userId: number;
    expertId: number;
}