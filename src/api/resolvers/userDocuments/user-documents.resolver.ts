import ApiResolver from "@/utils/ApiResolver";
import {CommonOutputDto} from "@/api/dto/common-output.dto";
import {UserDocsOutputDto} from "@/api/resolvers/userDocuments/dto/output/user-docs-output.dto";
import {UserDocsInputDto} from "@/api/resolvers/userDocuments/dto/input/user-docs-input.dto";

export class UserDocumentsResolver {
    private apiResolver = new ApiResolver("users-service/v1/user-docs")
    private token = localStorage.getItem("access_token");

    public async create(data: UserDocsInputDto) {
        return await this
            .apiResolver
            .request<FormData, CommonOutputDto<UserDocsOutputDto>>(
                "",
                "POST",
                this.apiResolver.DTOToFormData(data),
                this.token ? this.token : undefined
            )
    }
}