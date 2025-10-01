import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';

export interface MentorLinkOutputDto {
  id: number;
  biscuit: string;
  user: UserOutputDto;
}
