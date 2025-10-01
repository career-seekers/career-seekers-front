import ApiResolver from '@/utils/ApiResolver';
import type { CommonOutputDto } from '@/api/dto/common-output.dto';
import type { CreateMentorLinkInputDto } from './dto/input/create-mentor-link-input.dto';
import type { MentorLinkOutputDto } from './dto/output/mentor-link-output.dto';

export class MentorLinksResolver {
  private apiResolver = new ApiResolver("users-service/v1/mentor-links");
  private token = localStorage.getItem("access_token");

  public async create(data: CreateMentorLinkInputDto) {
    return await this.apiResolver.request<
      CreateMentorLinkInputDto,
      CommonOutputDto<MentorLinkOutputDto | string>
    >("", "POST", data, this.token ? this.token : undefined);
  }

  public async getByUserId(userId: number) {
    return await this.apiResolver.request<
      null,
      CommonOutputDto<MentorLinkOutputDto | string>
    >(`getByUserId/${userId.toString()}`, "GET", null, this.token ? this.token : undefined);
  }

  public async getByBiscuit(biscuit: string) {
    return await this.apiResolver.request<
      null,
      CommonOutputDto<MentorLinkOutputDto | string>
    >(`getByBiscuit/${biscuit}`, "GET", null, this.token ? this.token : undefined);
  }

  public async assignMentorToParent(data: { parentId: number; mentorId: number }) {
    return await this.apiResolver.request<
      { parentId: number; mentorId: number },
      CommonOutputDto<string>
    >("assign", "POST", data, this.token ? this.token : undefined);
  }

  public async getParentMentors(parentId: number) {
    return await this.apiResolver.request<
      null,
      CommonOutputDto<MentorLinkOutputDto[] | string>
    >(`parent/${parentId.toString()}/mentors`, "GET", null, this.token ? this.token : undefined);
  }

  public async removeMentorFromParent(data: { parentId: number; mentorId: number }) {
    return await this.apiResolver.request<
      { parentId: number; mentorId: number },
      CommonOutputDto<string>
    >("remove", "DELETE", data, this.token ? this.token : undefined);
  }
}
