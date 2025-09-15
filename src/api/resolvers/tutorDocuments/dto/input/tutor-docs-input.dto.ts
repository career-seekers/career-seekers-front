export interface TutorDocsInputDto {
  userId: number;
  institution: string;
  post: string;
  consentToTutorPdp: File | null;
}
