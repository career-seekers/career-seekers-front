import ApiResolver from "@/utils/ApiResolver.ts";

export class StatisticsResolver {
  private apiResolver = new ApiResolver("events-service/v1/statistics");
  private token = localStorage.getItem("access_token");

  async getPlatformsCount() {
    return await this.apiResolver.request<null, number>(
      "getPlatformsCount",
      "GET",
      null,
      this.token ? this.token : undefined
    )
  }

  async getVerifiedPlatformsCount() {
    return await this.apiResolver.request<null, number>(
      "getVerifiedPlatformsCount",
      "GET",
      null,
      this.token ? this.token : undefined
    )
  }

  async getDirectionsCount() {
    return await this.apiResolver.request<null, number>(
      "getDirectionsCount",
      "GET",
      null,
      this.token ? this.token : undefined
    )
  }

  async getDirectionsWithoutDocsCount() {
    return await this.apiResolver.request<null, number>(
      "getDirectionsWithoutDocsCount",
      "GET",
      null,
      this.token ? this.token : undefined
    )
  }

  async getDirectionDocsCount() {
    return await this.apiResolver.request<null, number>(
      "getDirectionsDocsCount",
      "GET",
      null,
      this.token ? this.token : undefined
    )
  }

  async getLastDocumentUpload() {
    return await this.apiResolver.request<null, Date>(
      "getLastDocumentUpload",
      "GET",
      null,
      this.token ? this.token : undefined
    )
  }
}