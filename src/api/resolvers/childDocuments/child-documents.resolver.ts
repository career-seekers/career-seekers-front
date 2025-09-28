import ApiResolver from '@/utils/ApiResolver.ts';
import type { CommonOutputDto } from '@/api/dto/common-output.dto.ts';
import type { ChildDocumentsInputDto } from '@/api/resolvers/childDocuments/dto/input/child-documents-input.dto.ts';
import type { ChildDocumentsOutputDto } from '@/api/resolvers/childDocuments/dto/output/child-documents-output.dto.ts';

export class ChildDocumentsResolver {
  private apiResolver = new ApiResolver("users-service/v1/child-docs");
  private token = localStorage.getItem("access_token");

  public async create(data: ChildDocumentsInputDto) {
    return this.apiResolver.request<
      FormData,
      CommonOutputDto<ChildDocumentsOutputDto | string>
    >(
      "",
      "POST",
      this.apiResolver.DTOToFormData(data as never),
      this.token ? this.token : undefined,
    )
  }
}