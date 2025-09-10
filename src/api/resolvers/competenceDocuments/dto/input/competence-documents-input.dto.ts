import {FileType} from "@/api/resolvers/files/file.resolver";

export interface CompetenceDocumentsInputDto {
    documentType: FileType;
    document: File;
    userId: number;
    directionId: number;
}