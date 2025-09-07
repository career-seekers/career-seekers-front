import ApiResolver from "@/utils/ApiResolver";
import {UserOutputDto} from "@/api/resolvers/auth/dto/output/user-output.dto";
import {CommonOutputDto} from "@/api/dto/common-output.dto";

export class UserResolver {
    private apiResolver = new ApiResolver("users-service/v1/users");
    private token = localStorage.getItem("access_token");

    public async getById(id: number) {
        return await this
            .apiResolver
            .request<number, CommonOutputDto<UserOutputDto | string>>(
                `${id}`,
                "GET",
                null,
                this.token ? this.token : undefined
            )
    }
}