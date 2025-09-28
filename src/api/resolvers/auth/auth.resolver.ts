import ApiResolver from "../../../utils/ApiResolver";
import type {
  UserRegistrationDto,
  UserWithChildRegistrationDto,
} from '@/api/resolvers/auth/dto/input/register-input.dto.ts';
import type { CommonOutputDto } from '@/api/dto/common-output.dto.ts';
import type { JWTMessageOutputDto } from '@/api/resolvers/auth/dto/output/jwt-message-output.dto.ts';
import type { PreRegisterInputDto } from '@/api/resolvers/auth/dto/input/pre-register-input.dto.ts';
import type { LoginInputDto } from '@/api/resolvers/auth/dto/input/login-input.dto.ts';
import type { TokensInputDto } from '@/api/resolvers/auth/dto/input/tokens-input.dto.ts';
import type { ForgotPasswordInputDto, VerifyCodeInputDto, ResetPasswordInputDto } from '@/api/resolvers/auth/dto/input/forgot-password-input.dto.ts';


export class AuthResolver {
  private apiResolver = new ApiResolver("users-service/v1/auth");

  public async register(
    data: UserRegistrationDto | UserWithChildRegistrationDto,
  ) {
    return await this.apiResolver.request<
      UserRegistrationDto | UserWithChildRegistrationDto,
      CommonOutputDto<JWTMessageOutputDto | string>
    >("register", "POST", data, undefined);
  }

  public async preRegister(data: PreRegisterInputDto) {
    return await this.apiResolver.request<
      PreRegisterInputDto,
      CommonOutputDto<string>
    >("preRegister", "POST", data, undefined);
  }

  public async login(data: LoginInputDto) {
    return await this.apiResolver.request<
      LoginInputDto,
      CommonOutputDto<JWTMessageOutputDto | string>
    >("login", "POST", data, undefined);
  }

  public async updateTokens(data: TokensInputDto) {
    return await this.apiResolver.request<
      TokensInputDto,
      CommonOutputDto<JWTMessageOutputDto | string>
    >("updateTokens", "POST", data, undefined);
  }

  public async forgotPassword(data: ForgotPasswordInputDto) {
    return await this.apiResolver.request<
      ForgotPasswordInputDto,
      CommonOutputDto<string>
    >("forgotPassword", "POST", data, undefined);
  }

  public async verifyCode(data: VerifyCodeInputDto) {
    return await this.apiResolver.request<
      VerifyCodeInputDto,
      CommonOutputDto<string>
    >("verifyCode", "POST", data, undefined);
  }

  public async resetPassword(data: ResetPasswordInputDto) {
    return await this.apiResolver.request<
      ResetPasswordInputDto,
      CommonOutputDto<string>
    >("resetPassword", "POST", data, undefined);
  }
}
