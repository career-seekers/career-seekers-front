import { EventFormats, type EventTypes } from '@/api/resolvers/events/dto/types';

export interface EventUpdateInputDto {
  id: number;
  name?: string;
  shortDescription?: string;
  eventType?: EventTypes;
  eventFormat?: EventFormats;
  startDateTime?: string;
  endDateTime?: string;
  eventVenue?: string | null;
  description?: string | null;
  directionId?: number;
  directionAgeCategoryId?: number;
  isDraft?: boolean | null;
}