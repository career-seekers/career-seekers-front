import ApiResolver from "@/utils/ApiResolver";
import {CommonOutputDto} from "@/api/dto/common-output.dto";
import {TelegramLinkInputDto} from "@/api/resolvers/telegramLink/dto/input/telegram-link-input.dto";
import {TelegramLinkOutputDto} from "@/api/resolvers/telegramLink/dto/output/telegram-link-output.dto";

export class TelegramLinkResolver {
    private apiResolver = new ApiResolver("users-service/v1/telegram-links")
    private token = localStorage.getItem("access_token");

    public async create(data: TelegramLinkInputDto) {
        return await this
            .apiResolver
            .request<TelegramLinkInputDto, CommonOutputDto<TelegramLinkOutputDto | string>>(
                "",
                "POST",
                data,
                this.token ? this.token : undefined
            )
    }
}