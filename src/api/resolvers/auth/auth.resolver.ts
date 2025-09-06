import ApiResolver from "../../../utils/ApiResolver";
import {useRouter} from "vue-router";
import {PreRegisterInputDto} from "./dto/input/pre-register-input.dto";
import {CommonOutputDto} from "../../dto/common-output.dto";
import {LoginInputDto} from "./dto/input/login-input.dto";
import {JWTMessageOutputDto} from "./dto/output/jwt-message-output.dto";
import {UserRegistrationDto, UserWithChildRegistrationDto} from "@/api/resolvers/auth/dto/input/register-input.dto";

export class AuthResolver {
    private apiResolver = new ApiResolver()
    private router = useRouter()

    public async register(data: UserRegistrationDto | UserWithChildRegistrationDto){
        return await this
            .apiResolver
            .request<UserRegistrationDto | UserWithChildRegistrationDto,
                CommonOutputDto<JWTMessageOutputDto | string>>(
                    "users-service/v1/auth/register",
                "POST",
                data,
                null
            )
    }

    public async preRegister(data: PreRegisterInputDto) {
        return await this
            .apiResolver
            .request<PreRegisterInputDto, CommonOutputDto<string>>(
                "users-service/v1/auth/preRegister",
                "POST",
                data,
                null
            )
    }

    public async login(data: LoginInputDto) {
        return await this
            .apiResolver
            .request<LoginInputDto, CommonOutputDto<JWTMessageOutputDto | string>>(
                "users-service/v1/auth/login",
                "POST",
                data,
                null
            )
    }
}