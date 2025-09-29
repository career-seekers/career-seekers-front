import ApiResolver from '@/utils/ApiResolver.ts';
import type { CommonOutputDto } from '@/api/dto/common-output.dto.ts';
import type {
  ChildCompetenciesOutputDto
} from '@/api/resolvers/childCompetencies/dto/output/child-competencies-output.dto.ts';
import type {
  ChildCompetenciesInputDto
} from '@/api/resolvers/childCompetencies/dto/input/child-competencies-input.dto.ts';

export class ChildCompetenciesResolver {
  private apiResolver = new ApiResolver("events-service/v1/childToDirection");
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

  public async create(data: ChildCompetenciesInputDto) {
    return this.apiResolver.request<
      ChildCompetenciesInputDto,
      CommonOutputDto<string>
    >(
      ``,
      "POST",
      data,
      this.token ? this.token : undefined
    )
  }
}
