import { FileType } from "@/api/resolvers/files/file.resolver";
import type { AgeCategoryOutputDto } from '@/api/resolvers/competence/dto/output/age-category-output.dto.ts';

export interface CompetenceDocumentsOutputDto {
  id: number;
  documentType: FileType;
  documentId: number;
  createdAt: string;
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
