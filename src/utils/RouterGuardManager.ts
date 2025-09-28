import { CompetenceResolver } from '@/api/resolvers/competence/competence.resolver.ts';
import type { RouteLocationNormalizedGeneric } from 'vue-router';
import { useUserStore } from '@/stores/userStore.ts';
import { Roles } from '@/state/UserState.types.ts';

export const RouterGuardManager = {

  async checkCompetenceDocumentsRoute(routeLocation: RouteLocationNormalizedGeneric): Promise<string | null> {
    const userStore = useUserStore()
    const competenceId = parseInt(routeLocation.params.competenceId as string)
    const response =
      await new CompetenceResolver().getById(competenceId);
    if (typeof response.message !== "string" && userStore.user !== null) {
      const competence = response.message;
      switch(userStore.user.role) {
        case Roles.EXPERT: {
          if (competence.expertId !== userStore.user.id) return "/expert"
          break
        }
        case Roles.TUTOR: {
          if (competence.userId !== userStore.user.id) return "/tutor"
          break
        }
        case Roles.USER: return "/user"
        case Roles.ADMIN: return null
        default: return "/not-found"
      }
    }
    return null
  }

}