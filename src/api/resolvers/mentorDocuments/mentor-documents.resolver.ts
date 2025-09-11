import ApiResolver from "@/utils/ApiResolver";
import { CommonOutputDto } from "@/api/dto/common-output.dto";
import { MentorDocsInputDto } from "@/api/resolvers/mentorDocuments/dto/input/mentor-docs-input.dto";
import { MentorDocsOutputDto } from "@/api/resolvers/mentorDocuments/dto/output/mentor-docs-output.dto";

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
      this.apiResolver.DTOToFormData(data),
      this.token ? this.token : undefined,
    );
  }
}
