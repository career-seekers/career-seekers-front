import type { DocumentsOutputDto } from "@/api/resolvers/competence/dto/output/documents-output.dto.ts";
import type {AgeCategoryOutputDto} from "@/api/resolvers/competence/dto/output/age-category-output.dto.ts";

export interface CompetenceOutputDto {
  id: number;
  name: string;
  description: string;
  ageCategories: AgeCategoryOutputDto[];
  iconId: number | null;
  userId: number;
  expertId: number;
  participantsCount: number;
  documents: DocumentsOutputDto[];
}
