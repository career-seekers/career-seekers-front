import {AgeCategories} from "@/api/resolvers/competence/competence.resolver";
import {DocumentsOutputDto} from "@/api/resolvers/competence/dto/output/documents-output.dto";

export interface CompetenceOutputDto {
    id: number;
    name: string;
    description: string;
    ageCategory: AgeCategories;
    iconId: number | null;
    userId: number;
    expertId: number;
    participantsCount: number;
    documents: DocumentsOutputDto[]
}