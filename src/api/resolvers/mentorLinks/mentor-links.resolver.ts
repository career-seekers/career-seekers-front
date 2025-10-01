import ApiResolver from '@/utils/ApiResolver';
import type {CommonOutputDto} from '@/api/dto/common-output.dto';
import type {MentorLinkOutputDto} from '@/api/resolvers/mentorLinks/dto/output/mentor-link-output.dto.ts';
import type {CreateMentorLinkInputDto} from "@/api/resolvers/mentorLinks/dto/input/create-mentor-link-input.dto.ts";

export class MentorLinksResolver {
  private apiResolver = new ApiResolver("users-service/v1/mentor-links");
  private token = localStorage.getItem("access_token");

  public async getAll() {
    return this.apiResolver.request<
      null,
      CommonOutputDto<MentorLinkOutputDto[]>
    >(
      "/",
      "GET",
      null,
      this.token ? this.token : undefined
    );
  }

  public async getById(id: number) {
    return this.apiResolver.request<
      null,
      CommonOutputDto<MentorLinkOutputDto>
    >(
      `/${id}`,
      "GET",
      null,
      this.token ? this.token : undefined
    );
  }

  public async getByUserId(userId: number) {
    return this.apiResolver.request<
      null,
      CommonOutputDto<MentorLinkOutputDto>
    >(
      `/getByUserId/${userId}`,
      "GET",
      null,
      this.token ? this.token : undefined
    );
  }

  public async getByBiscuit(biscuit: string) {
    return this.apiResolver.request<
      null,
      CommonOutputDto<MentorLinkOutputDto>
    >(
      `/getByBiscuit/${biscuit}`,
      "GET",
      null,
      this.token ? this.token : undefined
    );
  }

  public async create(item: CreateMentorLinkInputDto) {
    return this.apiResolver.request<
      CreateMentorLinkInputDto,
      CommonOutputDto<MentorLinkOutputDto>
    >(
      `/`,
      "POST",
      item,
      this.token ? this.token : undefined
    );
  }

  public async deleteById(id: number) {
    return this.apiResolver.request<
      null,
      CommonOutputDto<string>
    >(
      `/${id}`,
      "DELETE",
      null,
      this.token ? this.token : undefined
    )
  }

  public async deleteAll() {
    return this.apiResolver.request<
      null,
      CommonOutputDto<string>
    >(
      `/`,
      "DELETE",
      null,
      this.token ? this.token : undefined
    )
  }
}
