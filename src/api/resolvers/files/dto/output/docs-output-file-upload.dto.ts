import type { FileType } from '@/api/resolvers/files/file.resolver.ts';

export interface DocsOutputFileUploadDto {
  id: number;
  originalFilename: string;
  storedFilename: string;
  contentType: string;
  fileType: FileType;
  filePath: string;
  createdAt: string;
  updatedAt: string;
  verified: boolean | null;
}
