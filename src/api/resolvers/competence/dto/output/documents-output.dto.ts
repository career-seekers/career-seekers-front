import { FileType } from "@/api/resolvers/files/file.resolver";

export interface DocumentsOutputDto {
  id: number;
  documentType: FileType;
  documentId: string;
  createdAt: string;
  userId: number;
}
