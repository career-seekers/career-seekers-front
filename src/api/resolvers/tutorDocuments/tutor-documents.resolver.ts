import ApiResolver from "@/utils/ApiResolver";
import {TutorDocsInputDto} from "@/api/resolvers/tutorDocuments/dto/input/tutor-docs-input.dto";
import {CommonOutputDto} from "@/api/dto/common-output.dto";
import {TutorDocsOutputDto} from "@/api/resolvers/tutorDocuments/dto/output/tutor-docs-output.dto";

export class TutorDocumentsResolver {
    private apiResolver = new ApiResolver("users-service/v1/tutor-docs")
    private token = localStorage.getItem("access_token");

    public async create(data: TutorDocsInputDto) {
        return await this
            .apiResolver
            .request<FormData, CommonOutputDto<TutorDocsOutputDto>>(
                "",
                "POST",
                this.apiResolver.DTOToFormData(data),
                this.token ? this.token : undefined
            )
    }
}