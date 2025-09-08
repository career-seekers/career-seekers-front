import {reactive} from "vue";
import {
    ParentStateInterface,
    RegistrationData,
    Roles,
    TutorStateInterface,
    UserStateInterface
} from "./UserState.types";
import {jwtDecode} from "jwt-decode";
import {UserResolver} from "@/api/resolvers/user/user.resolver";
import {FileManager} from "@/utils/FileManager";
import {TutorDocumentsResolver} from "@/api/resolvers/tutorDocuments/tutor-documents.resolver";
import {CommonOutputDto} from "@/api/dto/common-output.dto";
import {UserDocumentsResolver} from "@/api/resolvers/userDocuments/user-documents.resolver";
import {UserRegistrationDto, UserWithChildRegistrationDto} from "@/api/resolvers/auth/dto/input/register-input.dto";

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
    const userJwt = jwtDecode<UserJwt>(access_token);
    const userResolver = new UserResolver();
    const userData = await userResolver.getById(userJwt.id)

    if (typeof userData.message === "string") {
        return {
            title: userData.status,
            message: userData.message,
        }
    } else {
        const fileManager = new FileManager();
        let response: CommonOutputDto<any>

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
        UserState.telegramLink = userData.message.telegramLink;

        if (localStorage.getItem("dataToVerify")) {
            switch (UserState.role) {
                case Roles.TUTOR: {
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
                    break
                }

                case Roles.MENTOR: {
                    break
                }

                case Roles.USER: {
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
                    break
                }
            }

            if (response.status === 200) {
                localStorage.removeItem("dataToVerify");
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
}

export const clearUserState = () => {
    Object.assign(UserState, {})
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
}