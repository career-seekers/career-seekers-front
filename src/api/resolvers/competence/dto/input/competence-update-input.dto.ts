import { AgeCategories } from '@/api/resolvers/ageCategory/ageCategories.ts';

export interface CompetenceUpdateInputDto {
  id: number | null;
  name: string;
  description: string;
  ageCategory: AgeCategories[] | null;
  userId: number;
  expertId: number;
}
