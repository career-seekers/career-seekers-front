import { EventFormats, type EventTypes } from '@/api/resolvers/events/dto/types';

export interface EventInputDto {
  name: string;
  shortDescription: string;
  eventType: EventTypes;
  eventFormat: EventFormats;
  startDateTime: string;
  eventVenue: string | null;
  description: string | null;
  directionId: number;
  directionAgeCategoryId: number;
}