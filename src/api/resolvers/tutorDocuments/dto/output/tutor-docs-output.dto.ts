import { Roles } from "../../../../../../state/UserState.types";

export interface TutorDocsOutputDto {
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
  consentToTutorPdpId: number;
}
