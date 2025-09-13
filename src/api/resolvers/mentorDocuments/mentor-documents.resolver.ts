import ApiResolver from "@/utils/ApiResolver";
import type { CommonOutputDto } from "@/api/dto/common-output.dto.ts";
import type { MentorDocsInputDto } from "@/api/resolvers/mentorDocuments/dto/input/mentor-docs-input.dto.ts";
import type { MentorDocsOutputDto } from "@/api/resolvers/mentorDocuments/dto/output/mentor-docs-output.dto.ts";

export class MentorDocumentsResolver {
  private apiResolver = new ApiResolver("users-service/v1/mentor-docs");
  private token = localStorage.getItem("access_token");

  public async create(data: MentorDocsInputDto) {
    return await this.apiResolver.request<
      FormData,
      CommonOutputDto<MentorDocsOutputDto | string>
    >(
      "",
      "POST",
      this.apiResolver.DTOToFormData(data as never),
      this.token ? this.token : undefined,
    );
  }
}
