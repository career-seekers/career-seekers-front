import ApiResolver from '@/utils/ApiResolver.ts';
import type { EventInputDto } from '@/api/resolvers/events/dto/input/event-input.dto.ts';
import type { CommonOutputDto } from '@/api/dto/common-output.dto.ts';
import type { EventsUrlParamsInputDto } from '@/api/resolvers/events/dto/input/events-url-params-input.dto.ts';
import type { EventsOutputDto } from '@/api/resolvers/events/dto/output/events-output.dto.ts';
import type { EventOutputDto } from '@/api/resolvers/events/dto/output/event-output.dto.ts';
import type { EventUpdateInputDto } from '@/api/resolvers/events/dto/input/event-update-input.dto.ts';
import type { EventVerifyInputDto } from '@/api/resolvers/events/dto/input/event-verify-input.dto.ts';

export class EventResolver {
  private apiResolver = new ApiResolver("events-service/v1/events");
  private token = localStorage.getItem("access_token");

  public async create(data: EventInputDto) {
    return this.apiResolver.request<
      EventInputDto,
      CommonOutputDto<string>
    >(
      "",
      "POST",
      data,
      this.token ? this.token : undefined,
    )
  }

  public async update(data: EventUpdateInputDto) {
    return this.apiResolver.request<
      EventUpdateInputDto,
      CommonOutputDto<string>
    >(
      "",
      "PATCH",
      data,
      this.token ? this.token : undefined,
    )
  }

  public async getAll(params: EventsUrlParamsInputDto | null) {
    return this.apiResolver.request<
      null,
      CommonOutputDto<EventsOutputDto | string>
    >(
      params !== null
        ? `?${this.apiResolver.DTOToURLSearchParams(params as never)}`
        : '',
      "GET",
      null,
      this.token ? this.token : undefined,
    )
  }

  public async getById(id: number) {
    return this.apiResolver.request<
      null,
      CommonOutputDto<EventOutputDto | string>
    >(
      id.toString(),
      "GET",
      null,
      this.token ? this.token : undefined,
    )
  }

  public async verify(data: EventVerifyInputDto) {
    return this.apiResolver.request<
      EventVerifyInputDto,
      CommonOutputDto<string>
    >(
      "verify",
      "PATCH",
      data,
      this.token ? this.token : undefined,
    )
  }
}