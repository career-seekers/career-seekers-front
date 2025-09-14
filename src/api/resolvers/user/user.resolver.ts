import ApiResolver from "@/utils/ApiResolver";
import type { UserOutputDto } from "@/api/resolvers/user/dto/output/user-output.dto.ts";
import type { CommonOutputDto } from "@/api/dto/common-output.dto.ts";
import type { Roles } from "@/state/UserState.types";
import type { UserInputDto } from "@/api/resolvers/user/dto/input/user-input.dto.ts";
import type { UpdateUserInputDto } from "@/api/resolvers/user/dto/input/update-user-input.dto.ts";

export class UserResolver {
  private apiResolver = new ApiResolver("users-service/v1/users");
  private token = localStorage.getItem("access_token");

  public async getById(id: number) {
    return await this.apiResolver.request<
      null,
      CommonOutputDto<UserOutputDto | string>
    >(`${id}`, "GET", null, this.token ? this.token : undefined);
  }

  public async getAllByRole(role: Roles) {
    return await this.apiResolver.request<
      null,
      CommonOutputDto<UserOutputDto[] | string>
    >(`getByRole/${role}`, "GET", null, this.token ? this.token : undefined);
  }

  public async getAllByTutorId(id: number) {
    return await this.apiResolver.request<
      null,
      CommonOutputDto<UserOutputDto[] | string>
    >(`getByTutorId/${id}`, "GET", null, this.token ? this.token : undefined);
  }

  public async getAll() {
    return await this.apiResolver.request<
      null,
      CommonOutputDto<UserOutputDto[] | string>
    >("", "GET", null, this.token ? this.token : undefined);
  }

  public async create(data: UserInputDto) {
    return await this.apiResolver.request<
      UserInputDto,
      CommonOutputDto<UserOutputDto>
    >("", "POST", data, this.token ? this.token : undefined);
  }

  public async update(data: UpdateUserInputDto) {
    return await this.apiResolver.request<
      UpdateUserInputDto,
      CommonOutputDto<string>
    >("", "PATCH", data, this.token ? this.token : undefined);
  }

  public async delete(id: number) {
    return await this.apiResolver.request<null, CommonOutputDto<string>>(
      `${id}`,
      "DELETE",
      null,
      this.token ? this.token : undefined,
    );
  }
}
