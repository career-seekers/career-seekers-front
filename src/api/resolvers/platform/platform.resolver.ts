import ApiResolver from "@/utils/ApiResolver";
import {CommonOutputDto} from "@/api/dto/common-output.dto";
import {PlatformOutputDto} from "@/api/resolvers/platform/dto/output/platform-output.dto";

export class PlatformResolver {
    private apiResolver = new ApiResolver("events-service/v1/platforms");
    private token = localStorage.getItem("access_token")

    public async getByUserId(id: number) {
        return await this
            .apiResolver
            .request<null, CommonOutputDto<PlatformOutputDto>>(
                `getByUserId/${id}`,
                "GET",
                null,
                this.token ? this.token : undefined
            )
    }
}