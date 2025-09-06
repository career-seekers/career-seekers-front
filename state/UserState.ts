import {reactive} from "vue";
import {Roles, UserStateInterface} from "./UserState.types";
import {jwtDecode} from "jwt-decode";

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

export const fillUserState = (
    access_token: string
) => {
    const userJwt = jwtDecode<UserJwt>(access_token);

    UserState.id = userJwt.id
    UserState.firstName = verifiedData.firstName;
    UserState.lastName = verifiedData.lastName;
    UserState.patronymic = verifiedData.patronymic;
    UserState.dateOfBirth = verifiedData.dateOfBirth;
    UserState.email = verifiedData.email;
    UserState.password = verifiedData.password;
    UserState.role = verifiedData.role;
}