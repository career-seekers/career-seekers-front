import { Roles } from "../../../../../../state/UserState.types";

export interface UserRegistrationDto {
  type: "UserRegistrationDto" | "UserWithChildRegistrationDto";
  verificationCode: string;
  lastName: string;
  firstName: string;
  patronymic: string;
  dateOfBirth: string;
  email: string;
  mobileNumber: string;
  password: string;
  role: Roles;
  uuid: string;
}

export interface UserWithChildRegistrationDto extends UserRegistrationDto {
  type: "UserWithChildRegistrationDto";
  mentorEqualsUser: boolean;
  childFirstName: string;
  childLastName: string;
  childPatronymic: string;
  childDateOfBirth: string;
  mentorId?: number | null;
}
