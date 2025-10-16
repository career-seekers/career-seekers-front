import { FileType } from '@/api/resolvers/files/file.resolver.ts';

export const useDocumentTypes = [
  { label: "Конкурсное задание отборочного этапа", value: FileType.TASK },
  { label: "Критерии оценок отборочного этапа", value: FileType.CRITERIA },
  { label: "Итоговая ведомость отборочного этапа", value: FileType.STATEMENT },
  { label: "Конкурсное задание финала", value: FileType.FINAL_TASK },
  { label: "Критерии оценок финала", value: FileType.FINAL_CRITERIA },
  { label: "Итоговая ведомость", value: FileType.FINAL_STATEMENT },
  { label: "Полное описание компетенции", value: FileType.DESCRIPTION },
  { label: "Итоговый список участников компетенции отбора", value: FileType.TOTAL_PARTICIPANTS_QUALIFYING },
  { label: "Итоговый список участников компетенции финала", value: FileType.TOTAL_PARTICIPANTS_FINAL },
  { label: "Лист регистрации отбора", value: FileType.REGISTRATION_LIST_QUALIFYING },
  { label: "Лист регистрации финала", value: FileType.REGISTRATION_LIST_FINAL },
]