import { Roles } from "../../../../../../state/UserState.types";

export interface MentorDocsOutputDto {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    patronymic: string;
    dateOfBirth: string;
    email: string;
    mobileNumber: string;
    role: Roles;
    avatarId: number;
    verified: boolean;
  };
  institution: string;
  post: string;
  consentToMentorPdpId: number;
}
