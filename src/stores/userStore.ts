import { defineStore } from 'pinia';
import type {
  MentorCachedData,
  RegistrationData,
  TutorCachedData, UserCachedData,
  UserStateInterface,
} from '@/state/UserState.types.ts';
import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';
import { FileManager } from '@/utils/FileManager.ts';
import { Roles } from '@/state/UserState.types.ts';
import { TutorDocumentsResolver } from '@/api/resolvers/tutorDocuments/tutor-documents.resolver.ts';
import type {
  UserRegistrationDto,
  UserWithChildRegistrationDto,
} from '@/api/resolvers/auth/dto/input/register-input.dto.ts';
import { MentorDocumentsResolver } from '@/api/resolvers/mentorDocuments/mentor-documents.resolver.ts';
import { TelegramLinkResolver } from '@/api/resolvers/telegramLink/telegram-link.resolver.ts';
import { ChildResolver } from '@/api/resolvers/child/child.resolver.ts';
import { ChildPackResolver } from '@/api/resolvers/childPack/child-pack.resolver.ts';

export const useUserStore = defineStore("user", {
  state: (): { user: UserStateInterface | null } => ({
    user: null
  }),
  actions: {
    async fillUser(userData: UserOutputDto) {
      this.user = {
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        patronymic: userData.patronymic,
        dateOfBirth: userData.dateOfBirth,
        email: userData.email,
        mobileNumber: userData.mobileNumber,
        password: userData.password,
        role: userData.role,
        avatarId: userData.avatarId,
        verified: userData.verified,
        isMentor: userData.isMentor,
        telegramLink: userData.telegramLink?.tgLink ?? null,
        expertDocuments: [],
        tutorDocuments: [],
        mentorDocuments: [],
        children: userData.children,
        menteeChildren: userData.menteeChildren,
      };
      
      const docsToVerifyStr = localStorage.getItem("dataToVerify")
      const telegramLink = localStorage.getItem("telegramLink")
      if (docsToVerifyStr !== null)
        await this.fillDocuments(docsToVerifyStr);
      if (telegramLink !== null) {
        const response = await new TelegramLinkResolver().create({
          userId: this.user.id,
          tgLink: telegramLink,
        })
        if (response.status === 200) localStorage.removeItem("telegramLink");
      }
      if (userData.children.length === 0) await this.fillChildren()
      localStorage.removeItem("dataToVerify");
    },
    async fillDocuments(docsToVerifyStr: string) {
      const fileManager = new FileManager()
      if (this.user !== null) {

        switch (this.user.role) {
          case Roles.TUTOR: {
            const tutorDocsResolver = new TutorDocumentsResolver()
            const cachedData = (JSON.parse(docsToVerifyStr) as
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
            const cachedData = JSON.parse(docsToVerifyStr) as
              RegistrationData<UserWithChildRegistrationDto | UserRegistrationDto, MentorCachedData>

            const response = await mentorDocsResolver.create({
              userId: this.user.id,
              post: cachedData.extra.post,
              institution: cachedData.extra.institution,
              consentToMentorPdp: await fileManager.loadFileFromCache(
                cachedData.extra.consentToMentorPdpFilename
              )
            })

            if (response.status === 200 && typeof response.message !== "string") {
              this.user.mentorDocuments.push(response.message)
              localStorage.removeItem("dataToVerify");
            }

            await fileManager.removeFileFromCache(cachedData.extra.consentToMentorPdpFilename);

            break
          }

          case Roles.USER: {
            const childPackResolver = new ChildPackResolver()
            const cachedData = JSON.parse(docsToVerifyStr) as
              RegistrationData<UserWithChildRegistrationDto, UserCachedData>
            const response = await childPackResolver.create({
              lastName: cachedData.dto.childLastName,
              firstName: cachedData.dto.childFirstName,
              patronymic: cachedData.dto.childPatronymic,
              dateOfBirth: cachedData.dto.childDateOfBirth,
              userId: this.user.id,
              mentorId: this.user.isMentor ? this.user.id : null,
              additionalStudyingCertificateFile: await fileManager.loadFileFromCache(
                cachedData.extra.additionalStudyingCertificateFileName
              ),
              birthCertificateFile: await fileManager.loadFileFromCache(
                cachedData.extra.birthCertificateFilename
              ),
              consentToChildPdpFile: await fileManager.loadFileFromCache(
                cachedData.extra.consentToChildPdpFilename
              ),
              learningClass: cachedData.extra.learningClass,
              parentRole: cachedData.extra.parentRole,
              snilsFile: await fileManager.loadFileFromCache(
                cachedData.extra.snilsFileName
              ),
              snilsNumber: cachedData.extra.snilsNumber,
              studyingCertificateFile: await fileManager.loadFileFromCache(
                cachedData.extra.studyingCertificateFileName
              ),
              studyingPlace: cachedData.extra.studyingPlace,
              trainingGround: cachedData.extra.trainingGround,

            })
            if (response.status === 200 && typeof response.message !== "string") {
              console.log("documents uploaded successfully")
              localStorage.removeItem("dataToVerify");
            }

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
    async fillChildren() {
      if (this.user !== null) {
        const response = await new ChildResolver().getByUserId(this.user.id);
        if (response.status === 200 && typeof response.message !== "string") this.user.children = response.message
      }
    }
  }
})