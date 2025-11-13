import { type ParticipantStatus, QueueStatuses } from '@/api/resolvers/childCompetencies/types.ts';

import { AgeCategories } from '@/api/resolvers/ageCategory/dto/types.d';

export interface AgeCategoryOutputDto {
  id: number;
  ageCategory: AgeCategories;
  maxParticipantsCount: number | null;
  currentParticipantsCount: number | null;
  participants: {
    id: number;
    childId: number;
    status: ParticipantStatus;
    queueStatus: QueueStatuses;
  }[];
  isDisabled: boolean;
}