import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';

export interface ChildDocumentsOutputDto {
  id: number;
  child: ChildOutputDto;
  snilsNumber: string,
  snilsId: number,
  studyingPlace: string,
  studyingCertificateId: number,
  learningClass: number,
  trainingGround: string,
  additionalStudyingCertificateId: number,
  parentRole: string,
  consentToChildPdpId: number,
  birthCertificateId: number
}