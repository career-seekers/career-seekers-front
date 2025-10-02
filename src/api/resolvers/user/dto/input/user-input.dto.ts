import { Roles } from "@/state/UserState.types";

export interface UserInputDto {
  firstName: string;
  lastName: string;
  patronymic: string | null;
  dateOfBirth: string;
  email: string | null;
  mobileNumber: string;
  password: string | null;
  role: Roles;
  tutorId: number | null;
  avatarId: number | null;
}
