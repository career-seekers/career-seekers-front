import { defineStore } from 'pinia';
import type {
  MentorCachedData,
  RegistrationData,
  TutorCachedData,
  UserCachedData,
  UserStateInterface,
} from '@/state/UserState.types.ts';
import { Roles } from '@/state/UserState.types.ts';
import { JwtManager } from '@/utils/JwtManager.ts';
import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
import { AuthResolver } from '@/api/resolvers/auth/auth.resolver.ts';
import { TutorDocumentsResolver } from '@/api/resolvers/tutorDocuments/tutor-documents.resolver.ts';
import type {
  UserRegistrationDto,
  UserWithChildRegistrationDto,
} from '@/api/resolvers/auth/dto/input/register-input.dto.ts';
import { MentorDocumentsResolver } from '@/api/resolvers/mentorDocuments/mentor-documents.resolver.ts';
import { UserDocumentsResolver } from '@/api/resolvers/userDocuments/user-documents.resolver.ts';
import { FileManager } from '@/utils/FileManager.ts';
import router from '@/router';

export const useAuthStore = defineStore("auth", {
  state: (): { user: UserStateInterface | null } => ({
    user: null
  }),
  getters: {

  },
  actions: {
    async fillUser() {
      const access_token = localStorage.getItem("access_token");
      const refresh_token =  localStorage.getItem("refresh_token")
      const uuid =  localStorage.getItem("uuid")

      if (!access_token || !refresh_token || !uuid) {
        await this.clear()
        return
      }

      const jwtData = JwtManager.decode(access_token)
      const userResolver = new UserResolver()
      const userData = await userResolver.getById(jwtData.id)

      if (typeof userData.message === "string" || userData.status >= 400) {
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
          await this.clear()
          return
        }
      }

      this.user = {
        id: userData.message.id,
        firstName: userData.message.firstName,
        lastName: userData.message.lastName,
        patronymic: userData.message.patronymic,
        dateOfBirth: userData.message.dateOfBirth,
        email: userData.message.email,
        mobileNumber: userData.message.mobileNumber,
        password: userData.message.password,
        role: userData.message.role,
        avatarId: userData.message.avatarId,
        verified: userData.message.verified,
        isMentor: userData.message.isMentor,
        telegramLink: userData.message.telegramLink?.tgLink ?? null,
        userDocuments: [],
        expertDocuments: [],
        tutorDocuments: [],
        mentorDocuments: [],
      };
      await this.fillDocuments()
    },
    async fillDocuments() {
      const dataToVerifyStr = localStorage.getItem("dataToVerify")
      if (dataToVerifyStr !== null && this.user !== null) {

        const fileManager = new FileManager()

        switch (this.user.role) {
          case Roles.TUTOR: {
            const tutorDocsResolver = new TutorDocumentsResolver()
            const cachedData = (JSON.parse(dataToVerifyStr) as
              RegistrationData<UserWithChildRegistrationDto | UserRegistrationDto, TutorCachedData>)

            const response = await tutorDocsResolver.create({
              userId: this.user.id,
              post: cachedData.extra.post,
              institution: cachedData.extra.institution,
              consentToTutorPdp: await fileManager.loadFileFromCache(
                cachedData.extra.consentToTutorPdpFilename
              )
            })

            if (response.status === 200 && typeof response.message !== "string") {
              this.user.tutorDocuments.push(response.message)
              localStorage.removeItem("dataToVerify");
            }

            await fileManager.removeFileFromCache(cachedData.extra.consentToTutorPdpFilename);

            break
          }

          case Roles.MENTOR: {
            const mentorDocsResolver = new MentorDocumentsResolver()
            const cachedData = JSON.parse(dataToVerifyStr) as
              RegistrationData<UserWithChildRegistrationDto | UserRegistrationDto, MentorCachedData>

            const response = await mentorDocsResolver.create({
              userId: this.user.id,
              post: cachedData.extra.post,
              institution: cachedData.extra.institution,
              consentToMentorPdp: await fileManager.loadFileFromCache(
                cachedData.extra.consentToMentorPdpFilename
              )
            })

            if (response.status === 200) localStorage.removeItem("dataToVerify");

            await fileManager.removeFileFromCache(cachedData.extra.consentToMentorPdpFilename);

            break
          }

          case Roles.USER: {
            const userDocsResolver = new UserDocumentsResolver()
            const cachedData = JSON.parse(dataToVerifyStr) as
              RegistrationData<UserWithChildRegistrationDto, UserCachedData>

            const response = await userDocsResolver.create({
              userId: this.user.id,
              snilsNumber: cachedData.extra.snilsNumber,
              snilsFile: await fileManager.loadFileFromCache(
                cachedData.extra.snilsFileName
              ),
              studyingPlace: cachedData.extra.studyingPlace,
              studyingCertificateFile: await fileManager.loadFileFromCache(
                cachedData.extra.studyingCertificateFileName
              ),
              learningClass: cachedData.extra.learningClass,
              trainingGround: cachedData.extra.trainingGround,
              additionalStudyingCertificateFile: await fileManager.loadFileFromCache(
                cachedData.extra.additionalStudyingCertificateFileName
              ),
              consentToChildPdpFile: await fileManager.loadFileFromCache(
                cachedData.extra.consentToChildPdpFilename
              ),
              parentRole: cachedData.extra.parentRole,
              birthCertificateFile: await fileManager.loadFileFromCache(
                cachedData.extra.birthCertificateFilename
              )
            })

            if (response.status === 200) localStorage.removeItem("dataToVerify");

            await fileManager.removeFileFromCache(cachedData.extra.snilsFileName);
            await fileManager.removeFileFromCache(cachedData.extra.studyingCertificateFileName);
            await fileManager.removeFileFromCache(cachedData.extra.additionalStudyingCertificateFileName);
            await fileManager.removeFileFromCache(cachedData.extra.consentToChildPdpFilename);
            await fileManager.removeFileFromCache(cachedData.extra.birthCertificateFilename);

            break
          }
        }
      }
    },
    async clear() {
      this.user = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('uuid')
      await router.push("/login")
    }
  }
})