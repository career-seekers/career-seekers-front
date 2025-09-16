import ApiResolver from "@/utils/ApiResolver";
import type { TutorDocsInputDto } from "@/api/resolvers/tutorDocuments/dto/input/tutor-docs-input.dto.ts";
import type { CommonOutputDto } from "@/api/dto/common-output.dto.ts";
import type { TutorDocsOutputDto } from "@/api/resolvers/tutorDocuments/dto/output/tutor-docs-output.dto.ts";
import type { TutorUpdateDocsInputDto } from '@/api/resolvers/tutorDocuments/dto/input/tutor-update-docs-input.dto.ts';

export class TutorDocumentsResolver {
  private apiResolver = new ApiResolver("users-service/v1/tutor-docs");
  private token = localStorage.getItem("access_token");

  public async create(data: TutorDocsInputDto) {
    return await this.apiResolver.request<
      TutorDocsInputDto,
      CommonOutputDto<TutorDocsOutputDto | string>
    >(
      "",
      "POST",
      data,
      this.token ? this.token : undefined,
    );
  }

  public async update(data: TutorUpdateDocsInputDto) {
    return await this.apiResolver.request<
      TutorUpdateDocsInputDto,
      CommonOutputDto<TutorDocsOutputDto | string>
    >(
      "",
      "PATCH",
      data,
      this.token ? this.token : undefined,
    );
  }
}
