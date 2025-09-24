import ApiResolver from "@/utils/ApiResolver";
import type { CommonOutputDto } from "@/api/dto/common-output.dto.ts";
import type { PlatformOutputDto } from "@/api/resolvers/platform/dto/output/platform-output.dto.ts";
import type { PlatformInputDto } from "@/api/resolvers/platform/dto/input/platform-input.dto.ts";

export class PlatformResolver {
  private apiResolver = new ApiResolver("events-service/v1/platforms");
  private token = localStorage.getItem("access_token");

  public async getByUserId(id: number) {
    return await this.apiResolver.request<
      null,
      CommonOutputDto<PlatformOutputDto>
    >(`getByUserId/${id.toString()}`, "GET", null, this.token ? this.token : undefined);
  }

  public async create(data: PlatformInputDto) {
    return await this.apiResolver.request<
      PlatformInputDto,
      CommonOutputDto<PlatformOutputDto>
    >("", "POST", data, this.token ? this.token : undefined);
  }

  public async update(data: PlatformOutputDto) {
    return await this.apiResolver.request<
      PlatformOutputDto,
      CommonOutputDto<string>
    >("", "PATCH", data, this.token ? this.token : undefined);
  }

  public async updatePlatformVerification(id: number) {
    return await this.apiResolver.request<null, CommonOutputDto<string>>(
      `verify/${id.toString()}`,
      "PATCH",
      null,
      this.token ? this.token : undefined,
    );
  }

  public async delete(id: number) {
    return await this.apiResolver.request<null, CommonOutputDto<string>>(
      id.toString(),
      "DELETE",
      null,
      this.token ? this.token : undefined,
    );
  }

  public async getAll() {
    return await this.apiResolver.request<
      null,
      CommonOutputDto<string | PlatformOutputDto[]>
    >(
      "",
      "GET",
      null,
      this.token ? this.token : undefined,
    )
  }
}
