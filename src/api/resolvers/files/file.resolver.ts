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



    public async upload(data: CommonInputFormDataDto, endpoint: FileEndpoints) {
        return await this
            .apiResolver
            .request<FormData, CommonOutputFileUploadDto | CommonOutputDto<string>>(
                endpoint,
                "POST",
                this.DTOToFormData(data),
                this.token ? this.token : undefined
            )
    }
}

export enum FileEndpoints {
    CONSENT_TUTOR = "uploadConsentToTutorPDP",
    CONSENT_MENTOR = "uploadConsentToMentorPDP",
    CONSENT_EXPERT = "uploadConsentToExpertPDP",
    CONSENT_CHILD = "uploadConsentToChildPDP",
    SNILS_CHILD = "uploadSnils",
    BIRTH_CHILD_CERTIFICATE = "uploadBirthCertificate",
    SCHOOL_CERTIFICATE = "uploadStudyingCertificate",
    PLATFORM_CERTIFICATE = "uploadAdditionalStudyingCertificate"
}