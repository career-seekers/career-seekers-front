export interface ChildDocumentsUpdateInputDto {
  id: number;
  snilsNumber: string;
  snilsFile: File | null;
  studyingPlace: string;
  studyingCertificateFile: File | null;
  learningClass: number;
  trainingGround: string;
  additionalStudyingCertificateFile: File | null;
  parentRole: string;
  consentToChildPdpFile: File | null;
  birthCertificateFile: File | null;
}