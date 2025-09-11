import ApiResolver from "../../../utils/ApiResolver";
import { PreRegisterInputDto } from "./dto/input/pre-register-input.dto";
import { CommonOutputDto } from "../../dto/common-output.dto";
import { LoginInputDto } from "./dto/input/login-input.dto";
import { JWTMessageOutputDto } from "./dto/output/jwt-message-output.dto";
import {
  UserRegistrationDto,
  UserWithChildRegistrationDto,
} from "@/api/resolvers/auth/dto/input/register-input.dto";
import { TokensInputDto } from "@/api/resolvers/auth/dto/input/tokens-input.dto";

export class AuthResolver {
  private apiResolver = new ApiResolver("users-service/v1/auth");

  public async register(
    data: UserRegistrationDto | UserWithChildRegistrationDto,
  ) {
    return await this.apiResolver.request<
      UserRegistrationDto | UserWithChildRegistrationDto,
      CommonOutputDto<JWTMessageOutputDto | string>
    >("register", "POST", data, null);
  }

  public async preRegister(data: PreRegisterInputDto) {
    return await this.apiResolver.request<
      PreRegisterInputDto,
      CommonOutputDto<string>
    >("preRegister", "POST", data, null);
  }

  public async login(data: LoginInputDto) {
    return await this.apiResolver.request<
      LoginInputDto,
      CommonOutputDto<JWTMessageOutputDto | string>
    >("login", "POST", data, null);
  }

  public async updateTokens(data: TokensInputDto) {
    return await this.apiResolver.request<
      TokensInputDto,
      CommonOutputDto<JWTMessageOutputDto | string>
    >("updateTokens", "POST", data, null);
  }
}
