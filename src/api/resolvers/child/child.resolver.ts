import ApiResolver from '@/utils/ApiResolver.ts';
import type { CommonOutputDto } from '@/api/dto/common-output.dto.ts';
import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';
import type { ChildInputDto } from '@/api/resolvers/child/dto/input/child-input.dto.ts';

export class ChildResolver {
  private apiResolver = new ApiResolver("users-service/v1/children");
  private token = localStorage.getItem("access_token");

  public async create(data: ChildInputDto){
    return this.apiResolver.request<
      ChildInputDto,
      CommonOutputDto<ChildOutputDto | string>
    >(
      "",
      "POST",
      data,
      this.token ? this.token : undefined,
    )
  }

  public async getByUserId(id: number) {
    return this.apiResolver.request<
      null,
      CommonOutputDto<ChildOutputDto[] | string>
    >(
      `getByUserId/${id.toString()}`,
      "GET",
      null,
      this.token ? this.token : undefined,
    )
  }
}