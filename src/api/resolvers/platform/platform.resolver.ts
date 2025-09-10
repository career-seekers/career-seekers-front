import ApiResolver from "@/utils/ApiResolver";
import {CommonOutputDto} from "@/api/dto/common-output.dto";
import {PlatformOutputDto} from "@/api/resolvers/platform/dto/output/platform-output.dto";
import {CompetenceInputDto} from "@/api/resolvers/competence/dto/input/competence-input.dto";

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

    public async update(data: PlatformOutputDto) {
        return await this
            .apiResolver
            .request<PlatformOutputDto, CommonOutputDto<string>>(
                "",
                "PATCH",
                data,
                this.token ? this.token : undefined
            )
    }

    public async delete(id: number) {
        return await this
            .apiResolver
            .request<null, CommonOutputDto<string>>(
                `${id}`,
                "DELETE",
                null,
                this.token ? this.token : undefined
            )
    }
}