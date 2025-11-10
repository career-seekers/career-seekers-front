import type { EventOutputDto } from '@/api/resolvers/events/dto/output/event-output.dto.ts';

export interface EventsOutputDto {
  content: EventOutputDto[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
    }
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
}