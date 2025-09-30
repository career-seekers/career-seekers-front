import type {AgeCategories} from "@/api/resolvers/competence/competence.resolver.ts";

export interface CompetenceUpdateInputDto {
  id: number | null;
  name: string;
  description: string;
  ageCategory: AgeCategories[] | null;
  userId: number;
  expertId: number;
}
