import {AgeCategories} from "@/api/resolvers/competition/competition.resolver";

export interface CompetitionOutputDto {
    id: number;
    name: string;
    description: string;
    ageCategory: AgeCategories;
    iconId: number | null;
    userId: number;
    participantsCount: number;
}