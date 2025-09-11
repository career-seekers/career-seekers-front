import { UserInputDto } from "@/api/resolvers/user/dto/input/user-input.dto";

export interface UpdateUserInputDto extends UserInputDto {
  id: number;
}
