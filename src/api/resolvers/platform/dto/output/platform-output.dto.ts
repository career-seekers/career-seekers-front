export interface PlatformOutputDto {
  id: number;
  fullName: string;
  shortName: string;
  address: string;
  email: string;
  website: string | null;
  verified: boolean;
  userId: number;
}
