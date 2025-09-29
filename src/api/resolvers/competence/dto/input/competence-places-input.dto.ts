export interface CompetencePlacesInputDto {
  id: number;
  maxParticipantsCount: number | null;
  currentParticipantsCount: number | null;
}

export interface UpdateCompetencePlacesInputDto {
  id: number;
  maxParticipantsCount: number | null;
  currentParticipantsCount: number | null;
}
