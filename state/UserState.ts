import {reactive} from "vue";
import {RegistrationData, Roles, TutorStateInterface, UserStateInterface} from "./UserState.types";
import {jwtDecode} from "jwt-decode";
import {UserResolver} from "@/api/resolvers/user/user.resolver";
import {FileEndpoints, FileResolver} from "@/api/resolvers/files/file.resolver";
import {FileManager, FilesToVerify, MentorFiles, TutorFiles} from "@/utils/FileManager";
import {TutorDocumentsResolver} from "@/api/resolvers/tutorDocuments/tutor-documents.resolver";
import {CommonOutputDto} from "@/api/dto/common-output.dto";

export const UserState = reactive<
    UserStateInterface
>({})

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
    const userResolver = new UserResolver(userJwt);
    const userData = await userResolver.getById(userJwt.id)

    if (typeof userData.message === "string") {
        return {
            title: response.status,
            message: response.message,
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
        UserState.avatarId = userData.message.avatarId

        if (localStorage.getItem("dataToVerify")) {
            switch (UserState.role) {
                case Roles.TUTOR:
                    const tutorDocsResolver = new TutorDocumentsResolver()
                    const registrationData: RegistrationData<TutorStateInterface> =
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