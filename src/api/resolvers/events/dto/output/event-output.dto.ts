import { EventFormats, type EventTypes } from '@/api/resolvers/events/dto/types';

export interface EventOutputDto {
  id: number;
  name: string;
  shortDescription: string;
  eventType: EventTypes,
  eventFormat: EventFormats,
  startDateTime: string;
  endDateTime: string;
  eventVenue: string;
  verified: boolean | null;
  description: string | null;
  directionExpertId: number;
  directionTutorId: number;
  directionId: number;
  directionAgeCategoryId: number;
}