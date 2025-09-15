import type {UserOutputDto} from "@/api/resolvers/user/dto/output/user-output.dto.ts";

export interface ExpertDocsOutputDto {
  id: number;
  user: UserOutputDto;
  institution: string;
  post: string;
}