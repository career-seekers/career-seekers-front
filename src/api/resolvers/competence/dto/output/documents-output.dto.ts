import { FileType } from "@/api/resolvers/files/file.resolver";

export interface DocumentsOutputDto {
  id: number;
  documentType: FileType;
  documentId: number;
  createdAt: string;
  userId: number;
}
