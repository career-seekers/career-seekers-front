import type { ParticipantStatus } from '@/api/resolvers/childCompetencies/types.ts';

export interface ParticipantStatusUpdateInputDto {
  id: number;
  status: ParticipantStatus;
}