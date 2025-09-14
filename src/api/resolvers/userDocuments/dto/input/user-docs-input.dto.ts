export interface UserDocsInputDto {
  userId: number;
  snilsNumber: string;
  snilsFile: File;
  studyingPlace: string;
  studyingCertificateFile: File;
  learningClass: number;
  trainingGround: string;
  additionalStudyingCertificateFile: File;
  parentRole: string;
  consentToChildPdpFile: File;
  birthCertificateFile: File;
}
