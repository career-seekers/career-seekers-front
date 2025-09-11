import { AgeCategories } from "@/api/resolvers/competence/competence.resolver";

export interface CompetenceInputDto {
  name: string;
  description: string;
  ageCategory: AgeCategories;
  userId: number;
  expertId: number;
}
