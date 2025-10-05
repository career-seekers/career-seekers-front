import type {AgeCategories} from "@/api/resolvers/competence/competence.resolver.ts";
import { type ParticipantStatus, QueueStatuses } from '@/api/resolvers/childCompetencies/types.ts';

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
}