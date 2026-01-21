import { ParticipantStatus, type QueueStatuses } from '@/api/resolvers/childCompetencies/types.ts';


import { AgeCategories } from '@/api/resolvers/ageCategory/dto/types.d';

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
    eventsCount: number;
    participantsCount: number;
  };
  directionAgeCategory: {
    id: number;
    ageCategory: AgeCategories;
    maxParticipantsCount: number;
    currentParticipantsCount: number;
    eventsCount: number;
  };
  teacherName: string | null;
  institution: string | null;
  post: string | null;
}