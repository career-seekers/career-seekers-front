import ApiResolver from "@/utils/ApiResolver.ts";
import type {AgeCategoryOutputDto} from "@/api/resolvers/ageCategory/age-category-output.dto.ts";
import type {CommonOutputDto} from "@/api/dto/common-output.dto.ts";

export class AgeCategoriesResolver {
  private apiResolver = new ApiResolver("events-service/v1/ageCategories");
  private token = localStorage.getItem("access_token");

  public async getByDirectionId(id: number) {
    return this.apiResolver.request<null, CommonOutputDto<AgeCategoryOutputDto[]>>(
      `getByDirectionId/${id.toString()}`,
      "GET",
      null,
      this.token ? this.token : undefined,
    )
  }
}