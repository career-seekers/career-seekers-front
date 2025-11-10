import { EventFormats, type EventTypes, SortFields } from '@/api/resolvers/events/dto/types';
import type { AgeCategories } from '@/api/resolvers/ageCategory/ageCategories.ts';

export interface EventsUrlParamsInputDto {
  page: number | null;
  size: number | null;
  sort: SortFields | null;
  desc: boolean | null;
  name: string | null;
  eventType: EventTypes | null;
  eventFormat: EventFormats | null;
  verified: boolean | null;
  startDateTime: string | null;
  endDateTime: string | null;
  directionName: string | null;
  ageCategory: AgeCategories | null;
}