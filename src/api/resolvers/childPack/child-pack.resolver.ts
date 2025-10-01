import ApiResolver from '@/utils/ApiResolver.ts';
import type { ChildPackInputDto } from '@/api/resolvers/childPack/dto/input/child-pack-input.dto.ts';
import type { CommonOutputDto } from '@/api/dto/common-output.dto.ts';
import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';

export class ChildPackResolver {
  private apiResolver = new ApiResolver("users-service/v2/children");
  private token = localStorage.getItem("access_token");

  public async create(data: ChildPackInputDto) {
    return this.apiResolver.request<
      FormData,
      CommonOutputDto<ChildOutputDto | string>
    >(
      "createChildPack",
      "POST",
      this.apiResolver.DTOToFormData(data as never),
      this.token ? this.token : undefined,
    )
  }
}