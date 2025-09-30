import type { UserInputDto } from "@/api/resolvers/user/dto/input/user-input.dto.ts";

export interface UpdateUserInputDto extends UserInputDto {
  id: number;
  firstName: string | null;
  lastName: string | null;
  patronymic: string | null;
  dateOfBirth: string | null;
  email: string | null;
  mobileNumber: string | null;
}
