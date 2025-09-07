import {reactive} from "vue";
import {Roles, UserStateInterface} from "./UserState.types";
import {jwtDecode} from "jwt-decode";
import {UserResolver} from "@/api/resolvers/user/user.resolver";
import {useRouter} from "vue-router";
import {FileResolver} from "@/api/resolvers/files/file.resolver";
import {FileManager, TutorFiles} from "@/utils/FileManager";
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
    const response = await userResolver.getById(userJwt.id)

    if (typeof response.message === "string") {
        return {
            title: response.status,
            message: response.message,
        }
    } else {
        const fileManager = new FileManager();
        const fileResolver = new FileResolver()
        UserState.id = response.message.id
        UserState.firstName = response.message.firstName;
        UserState.lastName = response.message.lastName;
        UserState.patronymic = response.message.patronymic;
        UserState.dateOfBirth = response.message.dateOfBirth;
        UserState.email = response.message.email;
        UserState.mobileNumber = response.message.mobileNumber;
        UserState.password = response.message.password;
        UserState.role = response.message.role;
        UserState.avatarId = response.message.avatarId

        try {
            switch (UserState.role) {
                case Roles.TUTOR:
                    const consentFilename = (JSON.parse(
                        localStorage.getItem("filesToVerify")
                    ) as TutorFiles).consentFileName
                    const consentFile = await fileManager.loadFileFromCache(consentFilename)
                    const response = await fileResolver
                        .uploadConsentToTutor({ file: consentFile })
                    if (response && typeof response.message === "string") {
                        return {
                            title: response.status,
                            message: response.message
                        }
                    } else {
                        localStorage.removeItem("filesToVerify");
                        await fileManager.removeFileFromCache(consentFilename)
                        console.log("good")
                    }
            }

            return {
                title: '',
                message: ''
            }
        } catch (e) {
            return {
                title: e.title,
                message: e.message,
            }
        }
    }
}

export const clearUserState = () => {
    Object.assign(UserState, {})
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
}