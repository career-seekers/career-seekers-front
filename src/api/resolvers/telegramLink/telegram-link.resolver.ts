import ApiResolver from "@/utils/ApiResolver";
import type { CommonOutputDto } from "@/api/dto/common-output.dto.ts";
import type { TelegramLinkInputDto } from "@/api/resolvers/telegramLink/dto/input/telegram-link-input.dto.ts";
import type { TelegramLinkOutputDto } from "@/api/resolvers/telegramLink/dto/output/telegram-link-output.dto.ts";

export class TelegramLinkResolver {
  private apiResolver = new ApiResolver("users-service/v1/telegram-links");
  private token = localStorage.getItem("access_token");

  public async create(data: TelegramLinkInputDto) {
    return await this.apiResolver.request<
      TelegramLinkInputDto,
      CommonOutputDto<TelegramLinkOutputDto | string>
    >("", "POST", data, this.token ? this.token : undefined);
  }
}
