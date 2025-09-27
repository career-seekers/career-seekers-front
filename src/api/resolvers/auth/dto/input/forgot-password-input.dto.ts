export interface ForgotPasswordInputDto {
  email: string;
}

export interface VerifyCodeInputDto {
  email: string;
  code: string;
}

export interface ResetPasswordInputDto {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}
