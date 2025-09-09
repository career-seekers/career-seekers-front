import {Roles} from "../../../../../../state/UserState.types";
import {UserOutputTutorDocsDto} from "@/api/resolvers/auth/dto/output/user-output-tutor-docs.dto";

export interface UserOutputDto {
    id: number;
    firstName: string;
    lastName: string;
    patronymic: string;
    dateOfBirth: string;
    email: string;
    mobileNumber: string;
    password: string;
    role: Roles;
    avatarId: number | null;
    verified: boolean;
    isMentor: boolean;
    userDocuments: null,
    expertDocuments: null,
    tutorDocuments: UserOutputTutorDocsDto,
    mentorDocuments: null,
    menteeChildren: [],
    children: [],
    telegramLink: {
        id: number,
        tgLink: string
    } | null
}