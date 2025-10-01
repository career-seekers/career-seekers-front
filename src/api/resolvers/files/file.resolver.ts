import ApiResolver from '@/utils/ApiResolver.ts';
import type { DocsInputFormDataDto } from '@/api/resolvers/files/dto/input/docs-input-form-data.dto.ts';
import type { DocsOutputFileUploadDto } from '@/api/resolvers/files/dto/output/docs-output-file-upload.dto.ts';
import type { CommonOutputDto } from '@/api/dto/common-output.dto.ts';


export enum FileType {
  TASK = "TASK",
  CRITERIA = "CRITERIA",
  STATEMENT = "STATEMENT",
  FINAL_TASK = "FINAL_TASK",
  FINAL_CRITERIA = "FINAL_CRITERIA",
  FINAL_STATEMENT = "FINAL_STATEMENT",
  DESCRIPTION = "DESCRIPTION",
  AVATAR = "AVATAR",
  SNILS = "SNILS",
  STUDYING_CERTIFICATE = "STUDYING_CERTIFICATE",
  ADDITIONAL_STUDYING_CERTIFICATE = "ADDITIONAL_STUDYING_CERTIFICATE",
  CONSENT_TO_CHILD_PDP = "CONSENT_TO_CHILD_PDP",
  CONSENT_TO_MENTOR_PDP = "CONSENT_TO_MENTOR_PDP",
  CONSENT_TO_TUTOR_PDP = "CONSENT_TO_TUTOR_PDP",
  CONSENT_TO_EXPERT_PDP = "CONSENT_TO_EXPERT_PDP",
  BIRTH_CERTIFICATE = "BIRTH_CERTIFICATE",
  DIRECTION_ICON = "DIRECTION_ICON",
}

export class FileResolver {
  private apiResolver = new ApiResolver("file-service/v1/files");
  private token = localStorage.getItem("access_token");

  public async uploadCompetenceDocument(
    data: DocsInputFormDataDto,
    endpoint: FileEndpoints,
  ) {
    return await this.apiResolver.request<
      FormData,
      DocsOutputFileUploadDto | CommonOutputDto<string>
    >(
      endpoint,
      "POST",
      this.apiResolver.DTOToFormData(data as never),
      this.token ? this.token : undefined,
    );
  }

  public async viewById(id: number) {
    return await this.apiResolver.request<null, Blob | CommonOutputDto<string>>(
      `view/${id.toString()}`,
      "GET",
      null,
      this.token ? this.token : undefined,
    );
  }

  public async getById(id: number) {
    return await this.apiResolver.request<
      null,
      DocsOutputFileUploadDto | CommonOutputDto<string>
    >(
      id.toString(),
      "GET",
      null,
      this.token ? this.token : undefined,
    )
  }

  public async getAll() {
    return await this.apiResolver.request<
      null,
      CommonOutputDto<string> | DocsOutputFileUploadDto[]
    >(
      "",
      "GET",
      null,
      this.token ? this.token : undefined,
    )
  }

  public async verify(id: number, status: boolean) {
    return await this.apiResolver.request<
      null,
      CommonOutputDto<string>
    >(
      `verify/${id.toString()}/${status.toString()}`,
      "PATCH",
      null,
      this.token ? this.token : undefined,
    )
  }

  public async deleteById(id: number) {
    return await this.apiResolver.request<
      null,
      CommonOutputDto<string>
    >(
      id.toString(),
      "DELETE",
      null,
      this.token ? this.token : undefined,
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
  PLATFORM_CERTIFICATE = "uploadAdditionalStudyingCertificate",
}
