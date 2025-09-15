import { Roles } from "@/state/UserState.types";
import type { UserOutputTutorDocsDto } from "@/api/resolvers/user/dto/output/user-output-tutor-docs.dto.ts";
import type { UserOutputExpertDocsDto } from "@/api/resolvers/user/dto/output/user-output-expert-docs.dto.ts";

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
  avatarId: number | null;
  verified: boolean;
  isMentor: boolean;
  tutorId: number | null;
  userDocuments: null;
  expertDocuments: UserOutputExpertDocsDto | null;
  tutorDocuments: UserOutputTutorDocsDto | null;
  mentorDocuments: null;
  menteeChildren: [];
  children: [];
  telegramLink: {
    id: number;
    tgLink: string;
  } | null;
}
