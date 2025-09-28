import type {AgeCategories} from "@/api/resolvers/competence/competence.resolver.ts";

export interface AgeCategoryOutputDto {
  id: number;
  ageCategory: AgeCategories;
  maxPlaces?: number;
}