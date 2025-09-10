import ApiResolver from "@/utils/ApiResolver";
import {
    CompetenceDocumentsInputDto
} from "@/api/resolvers/competenceDocuments/dto/input/competence-documents-input.dto";
import {CommonOutputDto} from "@/api/dto/common-output.dto";
import {
    CompetenceDocumentsOutputDto
} from "@/api/resolvers/competenceDocuments/dto/output/competence-documents-output.dto";

export class CompetenceDocumentsResolver {
    private apiResolver = new ApiResolver("events-service/v1/direction-docs");
    private token = localStorage.getItem("access_token");

    public async create(data: CompetenceDocumentsInputDto) {
        return this
            .apiResolver
            .request<FormData, CommonOutputDto<CompetenceDocumentsOutputDto | string>>(
                "",
                "POST",
                this.apiResolver.DTOToFormData(data),
                this.token ? this.token : undefined
            )
    }
}