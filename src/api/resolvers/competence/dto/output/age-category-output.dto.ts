import type {AgeCategories} from "@/api/resolvers/competence/competence.resolver.ts";
import type {ChildOutputDto} from "@/api/resolvers/child/dto/output/child-output.dto.ts";

export interface AgeCategoryOutputDto {
  id: number;
  ageCategory: AgeCategories;
  maxParticipantsCount: number | null;
  currentParticipantsCount: number | null;
  participants: ChildOutputDto[];
}