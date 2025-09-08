import {UserRegistrationDto} from "@/api/resolvers/auth/dto/input/register-input.dto";

export interface UserStateInterface {
    id: number | undefined;
    firstName: string | undefined;
    lastName: string | undefined;
    patronymic: string | undefined;
    dateOfBirth: string | undefined;
    email: string | undefined;
    mobileNumber: string | undefined;
    password: string | undefined;
    role: Roles | undefined;
    avatarId: number | null;
}

export interface TutorStateInterface extends UserStateInterface {
    post: string | undefined;
    institution: string | undefined;
    consentFileName: string | undefined;
}


export interface RegistrationData<T> {
    dto: UserRegistrationDto,
    extra: T,
}

export enum Roles {
    USER = "USER",
    ADMIN = "ADMIN",
    TUTOR = "TUTOR",
    MENTOR = "MENTOR",
    EXPERT = "EXPERT"
}