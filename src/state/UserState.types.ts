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
    verified: boolean | undefined;
    isMentor: boolean | undefined;
    position: string | null;
    telegramLink: string | null;
}

export interface TutorStateInterface {
    post: string | undefined;
    institution: string | undefined;
    consentFileName: string | undefined;
}

export interface MentorStateInterface {
    post: string | undefined;
    institution: string | undefined;
    consentFileName: string | undefined;
}

export interface ParentStateInterface {
    snilsNumber: number;
    snilsFileName: string;
    studyingPlace: string;
    studyingCertificateFileName: string;
    learningClass: number;
    trainingGround: string;
    additionalStudyingCertificateFileName: string;
    parentRole: string;
    consentToChildPdpFileName: string;
    birthCertificateFileName: string;
}


export interface RegistrationData<U, R> {
    dto: U,
    extra: R,
}

export enum Roles {
    USER = "USER",
    ADMIN = "ADMIN",
    TUTOR = "TUTOR",
    MENTOR = "MENTOR",
    EXPERT = "EXPERT"
}