import { FileType } from "@/api/resolvers/files/file.resolver";
import type { AgeCategoryOutputDto } from '@/api/resolvers/ageCategory/age-category-output.dto.ts';

import { AgeCategories } from '@/api/resolvers/ageCategory/ageCategories.ts';

export interface CompetenceDocumentsOutputDto {
  id: number;
  documentType: FileType;
  ageCategory: AgeCategories;
  documentId: number;
  createdAt: string;
  verified: boolean | null;
  userId: number;
  direction: {
    id: number;
    name: string;
    description: string;
    ageCategories: AgeCategoryOutputDto[];
    iconId: number | null;
    userId: number;
  };
}
