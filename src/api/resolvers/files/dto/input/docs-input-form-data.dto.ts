import {FileType} from "@/api/resolvers/files/file.resolver";

export interface DocsInputFormDataDto {
    file: File;
    type: FileType;
}