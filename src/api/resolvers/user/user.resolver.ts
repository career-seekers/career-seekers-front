import ApiResolver from "@/utils/ApiResolver";
import {UserOutputDto} from "@/api/resolvers/auth/dto/output/user-output.dto";

export class UserResolver {
    private apiResolver = new ApiResolver("users-service/v1/users");
    private token = localStorage.getItem("access_token");

    public async getById(id: number) {
        return await this
            .apiResolver
            .request<number, UserOutputDto>(
                `${id}`,
                "GET",
                null,
                this.token ? this.token : undefined
            )
    }
}