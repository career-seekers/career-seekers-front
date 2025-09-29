import ApiResolver from '@/utils/ApiResolver.ts';
import type { CommonOutputDto } from '@/api/dto/common-output.dto.ts';
import type {
  ChildCompetenciesOutputDto
} from '@/api/resolvers/childCompetencies/dto/output/child-competencies-output.dto.ts';

export class ChildCompetenciesResolver {
  private apiResolver = new ApiResolver("users-service/v1/childToDirection");
  private token = localStorage.getItem("access_token");

  public async getByChildId(id: number) {
    return this.apiResolver.request<
      null,
      CommonOutputDto<ChildCompetenciesOutputDto[] | string>
    >(
      `getByChildId/${id.toString()}`,
      "GET",
      null,
      this.token ? this.token : undefined
    )
  }
}
