import {reactive} from "vue";
import {Roles, UserStateInterface} from "./UserState.types";
import {jwtDecode} from "jwt-decode";
import {UserResolver} from "@/api/resolvers/user/user.resolver";
import {FileEndpoints, FileResolver} from "@/api/resolvers/files/file.resolver";
import {FileManager, FilesToVerify, MentorFiles, TutorFiles} from "@/utils/FileManager";

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
            let filesToVerify: FilesToVerify
            switch (UserState.role) {
                case Roles.TUTOR:
                    filesToVerify = JSON.parse(
                        localStorage.getItem("filesToVerify")
                    ) as TutorFiles
                    break
                case Roles.MENTOR:
                    filesToVerify = JSON.parse(
                        localStorage.getItem("filesToVerify")
                    ) as MentorFiles
                    break
            }
            if (filesToVerify) {
                for (const key of Object.keys(filesToVerify) as (keyof typeof filesToVerify)[]) {
                    const fileName = filesToVerify[key]
                    console.log(key)
                    console.log(FileEndpoints[key as keyof typeof FileEndpoints])
                    const file = await fileManager.loadFileFromCache(fileName)
                    const response =
                        await fileResolver.upload(
                            {
                                file: file
                            },
                            FileEndpoints[key as keyof typeof FileEndpoints]
                        )
                    if (response && typeof response.message === "string") {

                        return {
                            title: response.status,
                            message: response.message
                        }
                    } else {
                        await fileManager.removeFileFromCache(fileName)
                        console.log(`file ${fileName} successfully uploaded`)
                    }
                }
                localStorage.removeItem("filesToVerify");
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