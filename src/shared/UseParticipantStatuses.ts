import { ParticipantStatus } from '@/api/resolvers/childCompetencies/types.ts';

export const useParticipantStatuses = [
  { label: "Не указан", value: ParticipantStatus.NOT_STATED },
  { label: "Участник", value: ParticipantStatus.PARTICIPANT },
  { label: "Финалист", value: ParticipantStatus.FINALIST },
  { label: "Призёр", value: ParticipantStatus.PRIZEWINNER },
  { label: "Победитель", value: ParticipantStatus.WINNER },
]