import { Roles } from "../../../../../../state/UserState.types";

export interface TelegramLinkOutputDto {
  id: number;
  tgLink: string;
  user: {
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
  };
}
