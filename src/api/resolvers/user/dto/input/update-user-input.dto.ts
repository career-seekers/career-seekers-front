import type { UserInputDto } from "@/api/resolvers/user/dto/input/user-input.dto.ts";

export interface UpdateUserInputDto extends UserInputDto {
  id: number;
}
