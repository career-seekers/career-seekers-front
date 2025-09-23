import { defineStore } from 'pinia';
import { JwtManager } from '@/utils/JwtManager.ts';
import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
import { AuthResolver } from '@/api/resolvers/auth/auth.resolver.ts';
import { useUserStore } from '@/stores/userStore.ts';

export const useAuthStore = defineStore("auth", {
 actions: {
    async fillUser() {
      const userStore = useUserStore()
      const access_token = localStorage.getItem("access_token");
      const refresh_token =  localStorage.getItem("refresh_token")
      const uuid =  localStorage.getItem("uuid")

      if (!access_token || !refresh_token || !uuid) {
        await userStore.clear()
        return
      }

      const jwtData = JwtManager.decode(access_token)
      const userResolver = new UserResolver()
      const response = await userResolver.getById(jwtData.id)

      if (typeof response.message === "string" || response.status >= 400) {
        const authResolver = new AuthResolver()
        const response = await authResolver.updateTokens({
          accessToken: access_token,
          refreshToken: refresh_token,
          uuid: uuid,
        })

        if (response.status === 200 && typeof response.message !== "string") {
          localStorage.setItem("access_token", response.message.accessToken)
          localStorage.setItem("refresh_token", response.message.refreshToken)
          await this.fillUser()
          return
        } else {
          await userStore.clear()
          return
        }
      }

      await userStore.fillUser(response.message)
    },
  }
})