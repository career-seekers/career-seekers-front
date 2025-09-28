import ApiResolver from '@/utils/ApiResolver.ts';
import type { CommonOutputDto } from '@/api/dto/common-output.dto.ts';
import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';
import type { ChildInputDto } from '@/api/resolvers/child/dto/input/child-input.dto.ts';
import type { ChildUpdateInputDto } from '@/api/resolvers/child/dto/input/child-update-input.dto.ts';

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

  public async update(data: ChildUpdateInputDto){
    return this.apiResolver.request<
      ChildUpdateInputDto,
      CommonOutputDto<string>
    >(
      "",
      "PATCH",
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

  public async deleteById(id: number) {
    return this.apiResolver.request<
      null,
      CommonOutputDto<string>
    >(
      id.toString(),
      "DELETE",
      null,
      this.token ? this.token : undefined,
    )
  }
}