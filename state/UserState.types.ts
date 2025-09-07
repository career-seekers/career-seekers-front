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

export enum Roles {
    USER = "USER",
    ADMIN = "ADMIN",
    TUTOR = "TUTOR",
    MENTOR = "MENTOR",
    EXPERT = "EXPERT"
}