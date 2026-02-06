import { EventFormats, type EventTypes } from '@/api/resolvers/events/dto/types';
import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';

import type { AgeCategoryOutputDto } from '@/api/resolvers/ageCategory/age-category-output.dto.ts';

export interface EventFormNullable {
  name: string,
  shortDescription: string,
  eventType: EventTypes | null,
  eventFormat: EventFormats | null,
  startDateTime: Date | null,
  competence: CompetenceOutputDto | null | string,
  ageCategory: Omit<AgeCategoryOutputDto, 'label'> & {
    label: string
  } | null,
  eventVenue: string | null,
  description: string | null,
  isDraft: boolean | null,
}

export interface EventForm {
  name: string,
  shortDescription: string,
  eventType: EventTypes,
  eventFormat: EventFormats,
  startDateTime: string,
  competence: CompetenceOutputDto,
  ageCategory: AgeCategoryOutputDto,
  eventVenue: string | null,
  description: string | null,
  isDraft: boolean | null,
}