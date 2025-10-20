import { AgeCategories } from '@/api/resolvers/ageCategory/ageCategories.ts';

export interface CompetenceUpdateInputDto {
  id: number | null;
  name: string | null;
  description: string | null;
  ageCategory: AgeCategories[] | null;
  userId: number | null;
  expertId: number | null;
}
