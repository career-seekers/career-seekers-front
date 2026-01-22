import { defineStore } from 'pinia';
import { JwtManager } from '@/utils/JwtManager.ts';
import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
import { AuthResolver } from '@/api/resolvers/auth/auth.resolver.ts';
import { useUserStore } from '@/stores/userStore.ts';
import router from '@/router';
import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';

export const useAuthStore = defineStore("auth", {
  state: (): {
    access_token: string | null,
    refresh_token: string | null,
    uuid: string | null
  } => ({
      access_token: localStorage.getItem("access_token"),
      refresh_token: localStorage.getItem("refresh_token"),
      uuid: localStorage.getItem("uuid")
  }),
  actions: {
    getTokens() {
      this.access_token = localStorage.getItem("access_token")
      this.refresh_token = localStorage.getItem("refresh_token")
      this.uuid = localStorage.getItem("uuid")
    },
    async loadByTokens(): Promise<UserOutputDto | null> {
      if (!this.access_token || !this.refresh_token || !this.uuid) return null

      const jwtData = JwtManager.decode(this.access_token)
      
      const userResolver = new UserResolver()
      const response = await userResolver.getById(jwtData.id)

      if (typeof response.message === "string" || response.status >= 400) {
        await this.updateTokens()
        return null
      }
      await this.setExpirationTimeout(jwtData.exp)
      return response.message
    },
    async updateTokens() {
      if (!this.access_token || !this.refresh_token || !this.uuid) {
        await this.logout()
        return null
      }

      const authResolver = new AuthResolver()
      const response = await authResolver.updateTokens({
        accessToken: this.access_token,
        refreshToken: this.refresh_token,
        uuid: this.uuid,
      })

      if (response.status === 200 && typeof response.message !== "string") {
        localStorage.setItem("access_token", response.message.accessToken)
        localStorage.setItem("refresh_token", response.message.refreshToken)
        await this.loadByTokens()
        return
      } else {
        await this.logout()
        return
      }
    },
    async logout() {
      const userStore = useUserStore()
      userStore.user = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('uuid')
      localStorage.removeItem('selectedMentorId')
      localStorage.removeItem('event-filters')
      localStorage.removeItem('all-event-filters')
      localStorage.removeItem('competence-event-filters')
      localStorage.removeItem('competence-ageCategory-event-filters')

      this.access_token = null
      this.refresh_token = null
      this.uuid = null

      await router.push("/login")
    },
    async setExpirationTimeout(exp: number): Promise<void> {
      const expTime = exp * 1000
      const now = Date.now();
      const delay = expTime - now;
      if (delay > 0) {
        setTimeout( () => {
          this.updateTokens()
            .then(() => {})
            .catch(async () => {
              await this.logout()
            })
        }, delay);
      } else {
        await this.logout()
      }
    }
  },
})