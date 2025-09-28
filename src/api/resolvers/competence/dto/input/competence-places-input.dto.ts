import type { AgeCategories } from "@/api/resolvers/competence/competence.resolver.ts";

export interface CompetencePlacesInputDto {
  competenceId: number;
  ageCategory: AgeCategories;
  maxPlaces: number;
}

export interface UpdateCompetencePlacesInputDto {
  competenceId: number;
  ageCategoriesPlaces: {
    ageCategory: AgeCategories;
    maxPlaces: number;
  }[];
}
