import {
  EventFormats,
  type EventTypes,
  EventVerifications,
  SortFields,
} from '@/api/resolvers/events/dto/types';

import { AgeCategories } from '@/api/resolvers/ageCategory/dto/types.d';

export interface EventsUrlParamsInputDto {
  page: number | null;
  size: number | null;
  sort: SortFields | null;
  desc: boolean | null;
  name: string | null;
  eventType: EventTypes | null;
  eventFormat: EventFormats | null;
  verified: EventVerifications | null;
  startDateTime: string | null;
  endDateTime: string | null;
  directionName: string | null;
  ageCategory: AgeCategories | null;
}