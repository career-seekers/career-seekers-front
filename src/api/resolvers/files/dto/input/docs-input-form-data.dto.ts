import type { FileType } from '@/api/resolvers/files/file.resolver.js';

export interface DocsInputFormDataDto {
  file: File;
  type: FileType;
}
