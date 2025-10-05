import { QueueStatuses } from '@/api/resolvers/childCompetencies/types.ts';

export const useQueueStatuses = [
  { label: "В очереди", value: QueueStatuses.IN_QUEUE },
  { label: "Участвует", value: QueueStatuses.PARTICIPATES },
]