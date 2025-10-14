import { FileType } from "@/api/resolvers/files/file.resolver";

import { AgeCategories } from '@/api/resolvers/ageCategory/ageCategories.ts';

export interface DocumentsOutputDto {
  id: number;
  documentType: FileType;
  ageCategory: AgeCategories
  documentId: number;
  createdAt: string;
  verified: boolean | null;
  userId: number;
}
