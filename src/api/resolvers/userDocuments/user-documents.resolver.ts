import ApiResolver from "@/utils/ApiResolver";
import type { CommonOutputDto } from "@/api/dto/common-output.dto.ts";
import type { UserDocsOutputDto } from "@/api/resolvers/userDocuments/dto/output/user-docs-output.dto.ts";
import type { UserDocsInputDto } from "@/api/resolvers/userDocuments/dto/input/user-docs-input.dto.ts";

export class UserDocumentsResolver {
  private apiResolver = new ApiResolver("users-service/v1/user-docs");
  private token = localStorage.getItem("access_token");

  public async create(data: UserDocsInputDto) {
    return await this.apiResolver.request<
      FormData,
      CommonOutputDto<UserDocsOutputDto | string>
    >(
      "",
      "POST",
      this.apiResolver.DTOToFormData(data as never),
      this.token ? this.token : undefined,
    );
  }
}
