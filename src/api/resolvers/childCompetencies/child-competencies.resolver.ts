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

  private getToken(): string | undefined {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.warn('Токен авторизации не найден в localStorage');
      return undefined;
    }
    return token;
  }

  public async getByChildId(id: number) {
    console.log(`Запрос компетенций для ребенка ID: ${id}`);
    return this.apiResolver.request<
      null,
      CommonOutputDto<ChildCompetenciesOutputDto[] | string>
    >(
      `getByChildId/${id.toString()}`,
      "GET",
      null,
      this.getToken()
    )
  }

  public async create(data: ChildCompetenciesInputDto) {
    return this.apiResolver.request<
      ChildCompetenciesInputDto,
      CommonOutputDto<ChildCompetenciesOutputDto | string>
    >(
      ``,
      "POST",
      data,
      this.getToken()
    )
  }

  public async update(data: ChildCompetenciesInputDto) {
    return this.apiResolver.request<
      ChildCompetenciesInputDto,
      CommonOutputDto<string>
    >(
      ``,
      "PATCH",
      data,
      this.token ? this.token : undefined
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
      this.token ? this.token : undefined
    )
  }
}
