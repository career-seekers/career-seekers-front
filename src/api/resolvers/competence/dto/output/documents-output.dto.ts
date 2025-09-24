import { FileType } from "@/api/resolvers/files/file.resolver";
import type { AgeCategories } from '@/api/resolvers/competence/competence.resolver.ts';

export interface DocumentsOutputDto {
  id: number;
  documentType: FileType;
  ageCategory: AgeCategories
  documentId: number;
  createdAt: string;
  verified: boolean | null;
  userId: number;
}
