import { FileType } from "@/api/resolvers/files/file.resolver";
import type { AgeCategories } from '@/api/resolvers/competence/competence.resolver.ts';

export interface CompetenceDocumentsInputDto {
  documentType: FileType;
  ageCategory: AgeCategories
  document: File;
  userId: number;
  directionId: number;
}
