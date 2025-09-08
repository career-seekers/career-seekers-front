import {Roles} from "../../../../../../state/UserState.types";

export interface UserInputDto {
    firstName: string;
    lastName: string;
    patronymic: string;
    dateOfBirth: string;
    email: string;
    mobileNumber: string;
    password: string;
    role: Roles;
    avatarId: number
}