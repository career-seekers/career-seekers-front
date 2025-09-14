import { Roles } from "@/state/UserState.types";

export interface UserDocsOutputDto {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    patronymic: string;
    dateOfBirth: string;
    email: string;
    mobileNumber: string;
    role: Roles.USER;
    avatarId: number;
  };
  snilsNumber: number;
  snilsId: number;
  studyingPlace: string;
  studyingCertificateId: number;
  learningClass: number;
  trainingGround: string;
  additionalStudyingCertificateId: number;
  parentRole: string;
  consentToChildPdpId: number;
}
