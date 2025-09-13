import ApiResolver from "@/utils/ApiResolver";
import type { CompetenceDocumentsInputDto } from "@/api/resolvers/competenceDocuments/dto/input/competence-documents-input.dto.ts";
import type { CommonOutputDto } from "@/api/dto/common-output.dto.ts";
import type { CompetenceDocumentsOutputDto } from "@/api/resolvers/competenceDocuments/dto/output/competence-documents-output.dto.ts";

export class CompetenceDocumentsResolver {
  private apiResolver = new ApiResolver("events-service/v1/direction-docs");
  private token = localStorage.getItem("access_token");

  public async create(data: CompetenceDocumentsInputDto) {
    return this.apiResolver.request<
      FormData,
      CommonOutputDto<CompetenceDocumentsOutputDto | string>
    >(
      "",
      "POST",
      this.apiResolver.DTOToFormData(data as never),
      this.token ? this.token : undefined,
    );
  }

  public async delete(id: number) {
    return await this.apiResolver.request<
      null,
      CommonOutputDto<CompetenceDocumentsOutputDto | string>
    >(`${id}`, "DELETE", null, this.token ? this.token : undefined);
  }
}
