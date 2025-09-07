import ApiResolver from "@/utils/ApiResolver";
import {CommonInputFormDataDto} from "@/api/resolvers/files/dto/input/common-input-form-data.dto";
import {CommonOutputFileUploadDto} from "@/api/resolvers/files/dto/output/common-output-file-upload.dto";
import {CommonOutputDto} from "@/api/dto/common-output.dto";

export class FileResolver {
    private apiResolver = new ApiResolver("file-service/v1/files");
    private token = localStorage.getItem("access_token");

    private DTOToFormData(dto: any) {
        const formData = new FormData();
        Object.keys(dto).forEach(key => {
            formData.append(key, dto[key]);
        })
        return formData
    }


    public async uploadConsentToTutor(data: CommonInputFormDataDto) {
        return await this
            .apiResolver
            .request<FormData, CommonOutputFileUploadDto | CommonOutputDto<string>>(
                "uploadConsentToTutorPDP",
                "POST",
                this.DTOToFormData(data),
                this.token ? this.token : undefined
            )
    }
}