import ApiResolver from '@/utils/ApiResolver.ts';

export class ReportResolver {
  private apiResolver = new ApiResolver("events-service/v1/rapports");
  private token = localStorage.getItem("access_token");

  public async getChildrenAssignmentsByCompetenceId(competenceId: number) {
    return await this.apiResolver.request<
      null,
      Blob
    >(
      `getChildRecords/${competenceId.toString()}`,
      "GET",
      null,
      this.token ? this.token : undefined,
      "blob"
    )
  }
}