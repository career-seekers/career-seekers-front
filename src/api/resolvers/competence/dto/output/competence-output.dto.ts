import type { DocumentsOutputDto } from "@/api/resolvers/competence/dto/output/documents-output.dto.ts";
import type {AgeCategoryOutputDto} from "@/api/resolvers/ageCategory/age-category-output.dto.ts";

export interface CompetenceOutputDto {
  id: number;
  name: string;
  description: string;
  ageCategories: AgeCategoryOutputDto[];
  iconId: number | null;
  userId: number;
  expertId: number;
  participantsCount: number;
  eventsCount: number;
  documents: DocumentsOutputDto[];
}
