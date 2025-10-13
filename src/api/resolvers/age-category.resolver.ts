import ApiResolver from '@/utils/ApiResolver.ts';
import type { ToggleInputDto } from '@/api/resolvers/ageCategory/dto/input/toggle-input.dto.ts';
import type { CommonOutputDto } from '@/api/dto/common-output.dto.ts';

export class AgeCategoryResolver {
  private apiResolver = new ApiResolver("events-service/v1/ageCategories");
  private token = localStorage.getItem("access_token");

  public async toggle(data: ToggleInputDto) {
    return this.apiResolver.request<
      ToggleInputDto,
      CommonOutputDto<string>
    >(
      "updatePublicity",
      "PATCH",
      data,
      this.token ? this.token : undefined,
    )
  }

}