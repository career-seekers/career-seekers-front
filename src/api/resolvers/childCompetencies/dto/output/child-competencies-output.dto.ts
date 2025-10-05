import { ParticipantStatus, type QueueStatuses } from '@/api/resolvers/childCompetencies/types.ts';
import type { AgeCategories } from '@/api/resolvers/competence/competence.resolver.ts';

export interface ChildCompetenciesOutputDto {
  id: number;
  childId: number;
  status: ParticipantStatus;
  queueStatus: QueueStatuses;
  direction: {
    id: number;
    name: string;
    description: string;
    iconId: null | number;
    userId: number;
    expertId: number;
    participantsCount: number;
  };
  directionAgeCategory: {
    id: number;
    ageCategory: AgeCategories;
    maxParticipantsCount: number;
    currentParticipantsCount: number;
  };
}