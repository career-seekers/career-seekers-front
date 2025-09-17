import { UserState } from '@/state/UserState.ts';
import { Roles } from '@/state/UserState.types.ts';
import { CompetenceResolver } from '@/api/resolvers/competence/competence.resolver.ts';
import type { RouteLocationNormalizedGeneric } from 'vue-router';

export class RouterGuardManager {

  public static async checkCompetenceDocumentsRoute(routeLocation:  RouteLocationNormalizedGeneric): Promise<string | null> {
    if (routeLocation.name?.toString().includes("competence-documents")) {
      const competenceId = parseInt(routeLocation.params.competenceId as string)
      const response =
        await new CompetenceResolver().getById(competenceId);
      if (typeof response.message !== "string") {
        const competence = response.message;
        switch(UserState.role) {
          case Roles.EXPERT: {
            if (competence.expertId !== UserState.id) return "/expert"
            break
          }
          case Roles.TUTOR: {
            if (competence.userId !== UserState.id) return "/tutor"
            break
          }
          case Roles.USER: return "/parent"
          default: return "/not-found"
        }
      }
    }
    return null
  }

}