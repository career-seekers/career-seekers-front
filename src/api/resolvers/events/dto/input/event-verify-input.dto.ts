import type { EventVerifications } from '@/api/resolvers/events/dto/types';

export interface EventVerifyInputDto {
  id: number;
  verified: EventVerifications;
}