import { Roles } from '@/state/UserState.types.ts';
import { jwtDecode } from 'jwt-decode';

export class JwtManager {
  public static decode(token: string): UserJwt {
    return jwtDecode<UserJwt>(token);
  }
}

interface UserJwt {
  id: number;
  email: string;
  role: Roles;
  iat: number;
  exp: number;
  header: {
    alg: string;
  }
}