import ApiResolver from "@/utils/ApiResolver";
import type { CommonOutputDto } from "@/api/dto/common-output.dto.ts";
import type { CompetenceInputDto } from "@/api/resolvers/competence/dto/input/competence-input.dto.ts";
import type { CompetenceOutputDto } from "@/api/resolvers/competence/dto/output/competence-output.dto.ts";
import type { CompetencePlacesInputDto, UpdateCompetencePlacesInputDto } from "@/api/resolvers/competence/dto/input/competence-places-input.dto.ts";

export enum AgeCategories {
  EARLY_PRESCHOOL = "PRESCHOOL_1",
  PRESCHOOL = "PRESCHOOL_2",
  EARLY_SCHOOL = "SCHOOL_1",
  SCHOOL = "SCHOOL_2",
  HIGH_SCHOOL = "SCHOOL_3",
}

export class CompetenceResolver {
  private apiResolver = new ApiResolver("events-service/v1/directions");
  private token = localStorage.getItem("access_token");

  public async create(data: CompetenceInputDto) {
    return await this.apiResolver.request<
      CompetenceInputDto,
      CommonOutputDto<CompetenceOutputDto | string>
    >("", "POST", data, this.token ? this.token : undefined);
  }

  public async getAll() {
    return await this.apiResolver.request<
      null,
      CommonOutputDto<CompetenceOutputDto[] | string>
    >("", "GET", null, this.token ? this.token : undefined);
  }

  public async getByAgeCategory(category: AgeCategories) {
    return await this.apiResolver.request<
      null,
      CommonOutputDto<CompetenceOutputDto[] | string>
    >(
      `getByAgeCategory/${category}`,
      "GET",
      null,
      this.token ? this.token : undefined,
    );
  }

  public async getById(id: number) {
    return await this.apiResolver.request<
      null,
      CommonOutputDto<CompetenceOutputDto | string>
    >(id.toString(), "GET", null, this.token ? this.token : undefined);
  }

  public async getAllByUserId(id: number) {
    return await this.apiResolver.request<
      null,
      CommonOutputDto<CompetenceOutputDto[] | string>
    >(`getByUserId/${id.toString()}`, "GET", null, this.token ? this.token : undefined);
  }

  public async getAllByExpertId(id: number) {
    return await this.apiResolver.request<
      null,
      CommonOutputDto<CompetenceOutputDto[] | string>
    >(`getByExpertId/${id.toString()}`, "GET", null, this.token ? this.token : undefined);
  }

  public async update(data: CompetenceInputDto) {
    return await this.apiResolver.request<
      CompetenceInputDto,
      CommonOutputDto<string>
    >("", "PATCH", data, this.token ? this.token : undefined);
  }

  public async delete(id: number) {
    return await this.apiResolver.request<null, CommonOutputDto<string>>(
      id.toString(),
      "DELETE",
      null,
      this.token ? this.token : undefined,
    );
  }

  public async updateCompetencePlaces(data: UpdateCompetencePlacesInputDto) {
    return await this.apiResolver.request<
      UpdateCompetencePlacesInputDto,
      CommonOutputDto<string>
    >("places", "PUT", data, this.token ? this.token : undefined);
  }

  public async setCompetencePlace(data: CompetencePlacesInputDto) {
    return await this.apiResolver.request<
      CompetencePlacesInputDto,
      CommonOutputDto<string>
    >("place", "POST", data, this.token ? this.token : undefined);
  }
}
