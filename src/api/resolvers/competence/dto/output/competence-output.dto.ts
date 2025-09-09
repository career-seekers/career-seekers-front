import {AgeCategories} from "@/api/resolvers/competence/competence.resolver";

export interface CompetenceOutputDto {
    id: number;
    name: string;
    description: string;
    ageCategory: AgeCategories;
    iconId: number | null;
    userId: number;
    expertId: number;
    participantsCount: number;
}