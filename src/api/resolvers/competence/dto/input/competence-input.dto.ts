import { AgeCategories } from "@/api/resolvers/competence/competence.resolver";

export interface CompetenceInputDto {
  id: number | null;
  name: string;
  description: string;
  ageCategory: AgeCategories;
  userId: number;
  expertId: number;
}
