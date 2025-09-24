import { FileType } from '@/api/resolvers/files/file.resolver.ts';

export const useDocumentTypes = [
  { label: "Конкурсное задание отборочного этапа", value: FileType.TASK },
  { label: "Критерии оценок отборочного этапа", value: FileType.CRITERIA },
  { label: "Итоговая ведомость отборочного этапа", value: FileType.STATEMENT },
  { label: "Конкурсное задание финала", value: FileType.FINAL_TASK },
  { label: "Критерии оценок финала", value: FileType.FINAL_CRITERIA },
  { label: "Итоговая ведомость", value: FileType.FINAL_STATEMENT },
  { label: "Полное описание компетенции", value: FileType.DESCRIPTION }
]