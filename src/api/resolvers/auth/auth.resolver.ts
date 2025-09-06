import ApiResolver from "../../../utils/ApiResolver";
import {useRouter} from "vue-router";
import {PreRegisterInputDto} from "./dto/input/pre-register-input.dto";
import {CommonOutputDto} from "../../dto/common-output.dto";
import {LoginInputDto} from "./dto/input/login-input.dto";
import {LoginMessageOutputDto} from "./dto/output/login-message-output.dto";

export class AuthResolver {
    private apiResolver = new ApiResolver()
    private router = useRouter()

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
            .request<LoginInputDto, CommonOutputDto<LoginMessageOutputDto | string>>(
                "users-service/v1/auth/login",
                "POST",
                data,
                null
            ).catch(e => {
                return {
                    status: e.name,
                    message: e.message,
                }
            })
    }
}