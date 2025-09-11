import { FileType } from "@/api/resolvers/files/file.resolver";
import { AgeCategories } from "@/api/resolvers/competence/competence.resolver";

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
    ageCategory: AgeCategories;
    iconId: number | null;
    userId: number;
  };
}
