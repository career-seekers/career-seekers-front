import { EventFormats, type EventTypes } from '@/api/resolvers/events/dto/types';

export interface EventUpdateInputDto {
  name: string | null;
  shortDescription: string | null;
  eventType: EventTypes | null;
  eventFormat: EventFormats | null;
  startDateTime: string | null;
  endDateTime: string | null;
  eventVenue: string | null;
  description: string | null;
  directionId: number | null;
  directionAgeCategoryId: number | null;
}