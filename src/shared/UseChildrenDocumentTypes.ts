import { FileType } from '@/api/resolvers/files/file.resolver.ts';

export const useChildrenDocumentTypes = [
  { label: "Скан даты рождения", value: FileType.BIRTH_CERTIFICATE },
  { label: "Скан СНИЛС", value: FileType.SNILS },
  { label: "Скан справки из ОУ", value: FileType.STUDYING_CERTIFICATE },
  { label: "Скан справки из площадки подготовки", value: FileType.ADDITIONAL_STUDYING_CERTIFICATE },
  { label: "Скан согласия на ОПД", value: FileType.CONSENT_TO_CHILD_PDP },
]