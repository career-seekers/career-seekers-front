import ApiResolver from "@/utils/ApiResolver.ts";
import type {ExpertDocsInputDto} from "@/api/resolvers/expertDocuments/dto/input/expert-docs.input.dto.ts";
import type {ExpertDocsOutputDto} from "@/api/resolvers/expertDocuments/dto/output/expert-docs.output.dto.ts";
import type {CommonOutputDto} from "@/api/dto/common-output.dto.ts";

export class ExpertDocumentsResolver {
  private apiResolver = new ApiResolver("users-service/v1/expert-docs");
  private token = localStorage.getItem("access_token");

  public async create(data: ExpertDocsInputDto) {
    return await this.apiResolver.request<ExpertDocsInputDto, CommonOutputDto<ExpertDocsOutputDto>>(
      "/",
      "POST",
      data,
      this.token ? this.token : undefined,
    )
  }

  public async update(data: ExpertDocsInputDto) {
    return await this.apiResolver.request<ExpertDocsInputDto, CommonOutputDto<string>>(
      "/",
      "PATCH",
      data,
      this.token ? this.token : undefined,
    )
  }
}