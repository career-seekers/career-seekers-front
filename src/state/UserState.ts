import {reactive} from "vue";
import type {
    MentorStateInterface,
    ParentStateInterface,
    RegistrationData,
    TutorStateInterface,
    UserStateInterface
} from "./UserState.types.ts";
import {jwtDecode} from "jwt-decode";
import { Roles } from './UserState.types.ts';
import { AuthResolver } from '@/api/resolvers/auth/auth.resolver.ts';
import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
import { FileManager } from '@/utils/FileManager.ts';
import type { CommonOutputDto } from '@/api/dto/common-output.dto.ts';
import { TutorDocumentsResolver } from '@/api/resolvers/tutorDocuments/tutor-documents.resolver.ts';
import type {
    UserRegistrationDto,
    UserWithChildRegistrationDto,
} from '@/api/resolvers/auth/dto/input/register-input.dto.ts';
import { MentorDocumentsResolver } from '@/api/resolvers/mentorDocuments/mentor-documents.resolver.ts';
import { UserDocumentsResolver } from '@/api/resolvers/userDocuments/user-documents.resolver.ts';
import type { TutorDocsOutputDto } from '@/api/resolvers/tutorDocuments/dto/output/tutor-docs-output.dto.ts';

export const UserState = reactive<
    UserStateInterface
>({
    avatarId: undefined,
    dateOfBirth: undefined,
    email: undefined,
    firstName: undefined,
    id: undefined,
    lastName: undefined,
    mobileNumber: undefined,
    password: undefined,
    patronymic: undefined,
    role: undefined,
    verified: undefined,
    isMentor: undefined,
    telegramLink: null,
    position: null
})

interface UserJwt {
    id: number;
    email: string;
    role: Roles;
    iat: number;
    exp: number;
    header: {
        alg: string;
    }
}

export const fillUserState = async () => {
    const access_token = localStorage.getItem("access_token");
    const refresh_token =  localStorage.getItem("refresh_token")
    const uuid =  localStorage.getItem("uuid")

    if (access_token && refresh_token && uuid) {
        const userJwt = jwtDecode<UserJwt>(access_token);
        const userResolver = new UserResolver();
        const userData = await userResolver.getById(userJwt.id)
        if (typeof userData.message === "string") {
            if (userData.status === 403) {
                const authResolver = new AuthResolver();
                const response = await authResolver.updateTokens({
                    accessToken: access_token,
                    refreshToken: refresh_token,
                    uuid: uuid,
                })
                if (response.status === 200 && typeof response.message !== "string") {
                    localStorage.setItem("access_token", response.message.accessToken)
                    localStorage.setItem("refresh_token", response.message.refreshToken)
                }
            }
        } else {
            const fileManager = new FileManager();
            let response: CommonOutputDto<TutorDocsOutputDto | string>

            UserState.id = userData.message.id
            UserState.firstName = userData.message.firstName;
            UserState.lastName = userData.message.lastName;
            UserState.patronymic = userData.message.patronymic;
            UserState.dateOfBirth = userData.message.dateOfBirth;
            UserState.email = userData.message.email;
            UserState.mobileNumber = userData.message.mobileNumber;
            UserState.password = userData.message.password;
            UserState.role = userData.message.role;
            UserState.avatarId = userData.message.avatarId;
            UserState.verified = userData.message.verified;
            UserState.isMentor = userData.message.isMentor;
            if (userData.message.telegramLink != null) {
                UserState.telegramLink = userData.message.telegramLink.tgLink;
            }
            switch (UserState.role) {
                case Roles.TUTOR: {
                    if (localStorage.getItem("dataToVerify")) {
                        const tutorDocsResolver = new TutorDocumentsResolver()
                        const registrationData: RegistrationData<
                            UserRegistrationDto,
                            TutorStateInterface
                        > =
                            JSON.parse(localStorage.getItem("dataToVerify"))
                        response = await tutorDocsResolver.create({
                            userId: userJwt.id,
                            post: registrationData.extra.post,
                            institution: registrationData.extra.institution,
                            consentToTutorPdp: await fileManager.loadFileFromCache(
                                registrationData.extra.consentFileName
                            )
                        })
                        await fileManager.removeFileFromCache(registrationData.extra.consentFileName);

                        if (response.status === 200) localStorage.removeItem("dataToVerify");
                    }
                    break
                }

                case Roles.MENTOR: {
                    if (localStorage.getItem("dataToVerify")) {
                        const mentorDocsResolver = new MentorDocumentsResolver()
                        const registrationData: RegistrationData<
                            UserRegistrationDto,
                            MentorStateInterface
                        > =
                            JSON.parse(localStorage.getItem("dataToVerify"))
                        response = await mentorDocsResolver.create({
                            userId: userJwt.id,
                            post: registrationData.extra.post,
                            institution: registrationData.extra.institution,
                            consentToMentorPdp: await fileManager.loadFileFromCache(
                                registrationData.extra.consentFileName
                            )
                        })
                        await fileManager.removeFileFromCache(registrationData.extra.consentFileName);

                        if (response.status === 200) localStorage.removeItem("dataToVerify");
                    }
                    break
                }

                case Roles.USER: {
                    if (localStorage.getItem("dataToVerify")) {
                        const userDocsResolver = new UserDocumentsResolver()
                        const registrationData: RegistrationData<
                            UserWithChildRegistrationDto,
                            ParentStateInterface
                        > =
                            JSON.parse(localStorage.getItem("dataToVerify"))
                        response = await userDocsResolver.create({
                            userId: userJwt.id,
                            snilsNumber: registrationData.extra.snilsNumber,
                            snilsFile: await fileManager.loadFileFromCache(
                                registrationData.extra.snilsFileName
                            ),
                            studyingPlace: registrationData.extra.studyingPlace,
                            studyingCertificateFile: await fileManager.loadFileFromCache(
                                registrationData.extra.studyingCertificateFileName
                            ),
                            learningClass: registrationData.extra.learningClass,
                            trainingGround: registrationData.extra.trainingGround,
                            additionalStudyingCertificateFile: await fileManager.loadFileFromCache(
                                registrationData.extra.additionalStudyingCertificateFileName
                            ),
                            consentToChildPdpFile: await fileManager.loadFileFromCache(
                                registrationData.extra.consentToChildPdpFileName
                            ),
                            parentRole: registrationData.extra.parentRole,
                            birthCertificateFile: await fileManager.loadFileFromCache(
                                registrationData.extra.birthCertificateFileName
                            )
                        })
                        await fileManager.removeFileFromCache(registrationData.extra.snilsFileName);
                        await fileManager.removeFileFromCache(registrationData.extra.studyingCertificateFileName);
                        await fileManager.removeFileFromCache(registrationData.extra.additionalStudyingCertificateFileName);
                        await fileManager.removeFileFromCache(registrationData.extra.consentToChildPdpFileName);
                        await fileManager.removeFileFromCache(registrationData.extra.birthCertificateFileName);

                        if (response.status === 200) {
                            localStorage.removeItem("dataToVerify");
                        } else {
                            return {
                                title: response.status,
                                message: response.message
                            }
                        }
                    }
                    break
                }
            }

            const tgLink = localStorage.getItem("telegramLink");
            if (tgLink) {
                const telegramLinkResolver = new TelegramLinkResolver()
                const response = await telegramLinkResolver.create({
                    userId: UserState.id,
                    tgLink: tgLink,
                })
                if (response.status === 200) {
                    localStorage.removeItem("telegramLink");
                } else {
                    return {
                        title: response.status,
                        message: response.message
                    }
                }
            }
            return {
                title: "",
                message: ""
            }
        }

    } else {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("uuid")
    }
}

export const redirectByUserState = async () => {
    switch (UserState.role) {
        case Roles.USER: {
            if (history.state.current.includes("parent")) {
                await router.push("/parent");
            }
            break
        }
        case Roles.MENTOR: {
            if (!history.state.current.includes("mentor")) {
                await router.push("/mentor");
            }
            break
        }
        case Roles.TUTOR: {
            if (!history.state.current.includes("tutor")) {
                await router.push("/tutor");
            }
            break
        }
        case Roles.EXPERT: {
            if (!history.state.current.includes("expert")) {
                await router.push("/expert");
            }
            break
        }
        default:
            if (!history.state.current.includes("login") &&
            !history.state.current.includes("register") &&
            !history.state.current.includes("email-confirmation")) {
                await router.push("/login");
            }
            break
    }
}

export const clearUserState = async () => {
    for (const key in UserState) {
        if (Object.prototype.hasOwnProperty.call(UserState, key)) {
            UserState[key] = undefined;
        }
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('uuid')
    await router.push("/login")
}