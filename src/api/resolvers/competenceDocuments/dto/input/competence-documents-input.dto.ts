import { FileType } from "@/api/resolvers/files/file.resolver";


import { AgeCategories } from '@/api/resolvers/ageCategory/dto/types.d';

export interface CompetenceDocumentsInputDto {
  documentType: FileType;
  ageCategory: AgeCategories
  document: File;
  userId: number;
  directionId: number;
}
