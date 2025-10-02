import { Roles } from "@/state/UserState.types";
import type { UserOutputTutorDocsDto } from "@/api/resolvers/user/dto/output/user-output-tutor-docs.dto.ts";
import type { UserOutputExpertDocsDto } from "@/api/resolvers/user/dto/output/user-output-expert-docs.dto.ts";
import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';

export interface UserOutputDto {
  id: number;
  firstName: string;
  lastName: string;
  patronymic: string;
  dateOfBirth: string;
  email: string;
  mobileNumber: string;
  password: string;
  role: Roles;
  avatarId: number;
  verified: boolean;
  isMentor: boolean;
  tutorId: number | null;
  expertDocuments: UserOutputExpertDocsDto | null;
  tutorDocuments: UserOutputTutorDocsDto | null;
  mentorDocuments: null;
  menteeChildren: ChildOutputDto[];
  children: ChildOutputDto[];
  telegramLink: {
    id: number;
    tgLink: string;
  } | null;
  linkBiscuits?: never; // Добавляем поле linkBiscuits
}
