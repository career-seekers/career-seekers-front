import {reactive} from "vue";
import {Roles, UserStateInterface} from "./UserState.types";
import {jwtDecode} from "jwt-decode";
import {UserResolver} from "@/api/resolvers/user/user.resolver";

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
    }
}