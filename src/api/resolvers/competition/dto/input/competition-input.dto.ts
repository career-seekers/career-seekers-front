import {AgeCategories} from "@/api/resolvers/competition/competition.resolver";

export interface CompetenceInputDto {
    name: string;
    description: string;
    ageCategory: AgeCategories;
    userId: number;
    expertId: number;
}