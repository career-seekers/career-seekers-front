import { AgeCategories } from '@/api/resolvers/ageCategory/dto/types.d';

export interface CompetenceInputDto {
  id: number | null;
  name: string;
  description: string;
  ageCategory: AgeCategories[];
  userId: number;
  expertId: number;
}
