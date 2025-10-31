import ApiResolver from "@/utils/ApiResolver.ts";
import type {UsersStatisticsOutputDto} from "@/api/resolvers/statistic/dto/output/users-statistics-output.dto.ts";
import type {CommonOutputDto} from "@/api/dto/common-output.dto.ts";

export class UsersStatisticsResolver {
  private apiResolver = new ApiResolver("users-service/v1/statistics");
  private token = localStorage.getItem("access_token");

  async getTutorsInfo() {
    return await this.apiResolver.request<null, CommonOutputDto<UsersStatisticsOutputDto>>(
      "getTutorsInfo",
      "GET",
      null,
      this.token ? this.token : undefined
    )
  }

  async getExpertsInfo() {
    return await this.apiResolver.request<null, CommonOutputDto<UsersStatisticsOutputDto>>(
      "getExpertsInfo",
      "GET",
      null,
      this.token ? this.token : undefined
    )
  }

  async getMentorsInfo() {
    return await this.apiResolver.request<null, CommonOutputDto<UsersStatisticsOutputDto>>(
      "getMentorsInfo",
      "GET",
      null,
      this.token ? this.token : undefined
    )
  }

  async getUsersInfo() {
    return await this.apiResolver.request<null, CommonOutputDto<UsersStatisticsOutputDto>>(
      "getUsersInfo",
      "GET",
      null,
      this.token ? this.token : undefined
    )
  }

  async getChildrenCount() {
    return await this.apiResolver.request<null, CommonOutputDto<number>>(
      "getChildrenCount",
      "GET",
      null,
      this.token ? this.token : undefined
    )
  }
}