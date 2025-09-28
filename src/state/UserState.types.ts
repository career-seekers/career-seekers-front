import type { ExpertDocsOutputDto } from '@/api/resolvers/expertDocuments/dto/output/expert-docs.output.dto.ts';
import type { TutorDocsOutputDto } from '@/api/resolvers/tutorDocuments/dto/output/tutor-docs-output.dto.ts';
import type { MentorDocsOutputDto } from '@/api/resolvers/mentorDocuments/dto/output/mentor-docs-output.dto.ts';
import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';

export interface UserStateInterface {
    id: number;
    firstName: string;
    lastName: string;
    patronymic: string;
    dateOfBirth: string | null;
    email: string;
    mobileNumber: string;
    password: string;
    role: Roles;
    avatarId: number;
    verified: boolean;
    isMentor: boolean;
    telegramLink: string | null;
    expertDocuments: ExpertDocsOutputDto[];
    tutorDocuments: TutorDocsOutputDto[];
    mentorDocuments: MentorDocsOutputDto[];
    children: ChildOutputDto[],
    menteeChildren: ChildOutputDto[],
}


export interface RegistrationData<U, R> {
    dto: U,
    extra: R,
}

export interface MentorCachedData {
    post: string;
    institution: string;
    consentToMentorPdpFilename: string;
}

export interface TutorCachedData {
    post: string;
    institution: string;
    consentToTutorPdpFilename: string;
}

export interface UserCachedData {
    snilsNumber: string;
    snilsFileName: string;
    studyingPlace: string;
    studyingCertificateFileName: string;
    learningClass: number;
    trainingGround: string;
    additionalStudyingCertificateFileName: string;
    parentRole: string;
    consentToChildPdpFilename: string;
    birthCertificateFilename: string;
}

export enum Roles {
    USER = "USER",
    ADMIN = "ADMIN",
    TUTOR = "TUTOR",
    MENTOR = "MENTOR",
    EXPERT = "EXPERT"
}