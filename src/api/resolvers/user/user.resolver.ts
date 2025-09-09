import ApiResolver from "@/utils/ApiResolver";
import {UserOutputDto} from "@/api/resolvers/auth/dto/output/user-output.dto";
import {CommonOutputDto} from "@/api/dto/common-output.dto";
import {Roles} from "../../../../state/UserState.types";
import {UserInputDto} from "@/api/resolvers/user/dto/input/user-input-dto";
import {UpdateUserInputDto} from "@/api/resolvers/user/dto/input/update-user-input.dto";

export class UserResolver {
    private apiResolver = new ApiResolver("users-service/v1/users");
    private token = localStorage.getItem("access_token");

    public async getById(id: number) {
        return await this
            .apiResolver
            .request<number, CommonOutputDto<UserOutputDto | string>>(
                id,
                "GET",
                null,
                this.token ? this.token : undefined
            )
    }

    public async getAllByRole(role: Roles) {
        return await this
            .apiResolver
            .request<null, CommonOutputDto<UserOutputDto[]>>(
                `getByRole/${role}`,
                "GET",
                null,
                this.token ? this.token : undefined
            )
    }

    public async create(data: UserInputDto) {
        return await this
            .apiResolver
            .request<UserInputDto, CommonOutputDto<UserOutputDto>>(
                "",
                "POST",
                data,
                this.token ? this.token : undefined
            )
    }

    public async update(data: UpdateUserInputDto) {
        return await this
            .apiResolver
            .request<UpdateUserInputDto, CommonOutputDto<string>>(
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
                id,
                "DELETE",
                null,
                this.token ? this.token : undefined
            )
    }
}