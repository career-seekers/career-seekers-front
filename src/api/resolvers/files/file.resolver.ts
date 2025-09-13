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
    return await this.apiResolver.request<null, Blob>(
      `view/${id}`,
      "GET",
      null,
      this.token ? this.token : undefined,
    );
  }

  public async downloadById(documentId: number) {
    try {
      const response = await this.apiResolver.request<null, Blob>(
        `download/${documentId}`,
        "GET",
        null,
        this.token ? this.token : undefined,
      );
      const blob = new Blob([response]);
      const fileURL = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", `document-${documentId}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error("Download error:", error);
    }
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
