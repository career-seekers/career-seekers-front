import ApiResolver from '@/utils/ApiResolver';
import type {CommonOutputDto} from '@/api/dto/common-output.dto';
import type {MentorLinkOutputDto} from '@/api/resolvers/mentorLinks/dto/output/mentor-link-output.dto.ts';
import type {CreateMentorLinkInputDto} from "@/api/resolvers/mentorLinks/dto/input/create-mentor-link-input.dto.ts";

export class MentorLinksResolver {
  private apiResolver = new ApiResolver("users-service/v1/mentor-links");

  private getToken(): string | undefined {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.warn('Токен авторизации не найден в localStorage');
      return undefined;
    }
    return token;
  }

  public async getAll() {
    return this.apiResolver.request<
      null,
      CommonOutputDto<MentorLinkOutputDto[]>
    >(
      "",
      "GET",
      null,
      this.getToken()
    );
  }

  public async getById(id: number) {
    return this.apiResolver.request<
      null,
      CommonOutputDto<MentorLinkOutputDto>
    >(
      id.toString(),
      "GET",
      null,
      this.getToken()
    );
  }

  public async getByUserId(userId: number) {
    return this.apiResolver.request<
      null,
      CommonOutputDto<MentorLinkOutputDto | string>
    >(
      `getByUserId/${userId.toString()}`,
      "GET",
      null,
      this.getToken()
    );
  }

  public async getByBiscuit(biscuit: string) {
    return this.apiResolver.request<
      null,
      CommonOutputDto<MentorLinkOutputDto>
    >(
      `getByBiscuit/${biscuit}`,
      "GET",
      null,
      this.getToken()
    );
  }

  public async create(item: CreateMentorLinkInputDto) {
    return this.apiResolver.request<
      CreateMentorLinkInputDto,
      CommonOutputDto<MentorLinkOutputDto | string>
    >(
      ``,
      "POST",
      item,
      this.getToken()
    );
  }

  public async deleteById(id: number) {
    return this.apiResolver.request<
      null,
      CommonOutputDto<string>
    >(
      id.toString(),
      "DELETE",
      null,
      this.getToken()
    )
  }

  public async deleteAll() {
    return this.apiResolver.request<
      null,
      CommonOutputDto<string>
    >(
      ``,
      "DELETE",
      null,
      this.getToken()
    )
  }
}
