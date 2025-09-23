import {reactive} from "vue";
import type {
    UserStateInterface
} from "./UserState.types.ts";
import { Roles } from './UserState.types.ts';
import router from '@/router';
export const UserState = reactive<
    UserStateInterface
>({
    id: 0,
    firstName: "",
    lastName: "",
    patronymic: "",
    dateOfBirth: null,
    email: "",
    mobileNumber: "",
    password: "",
    role: Roles.USER,
    avatarId: 0,
    verified: false,
    isMentor: false,
    telegramLink: null,
    userDocuments: [],
    expertDocuments: [],
    tutorDocuments: [],
    mentorDocuments: [],
})

export const redirectByUserState = async () => {
    switch (UserState.role) {
        case Roles.USER: {
            if (!router.currentRoute.value.path.includes("parent")) {
                await router.push("/parent");
            }
            break
        }
        case Roles.MENTOR: {
            if (!router.currentRoute.value.path.includes("mentor")) {
                await router.push("/mentor");
            }
            break
        }
        case Roles.TUTOR: {
            if (!router.currentRoute.value.path.includes("tutor")) {
                await router.push("/tutor");
            }
            break
        }
        case Roles.EXPERT: {
            if (!router.currentRoute.value.path.includes("expert")) {
                await router.push("/expert");
            }
            break
        }
        case Roles.ADMIN: {
            if (!router.currentRoute.value.path.includes("admin")) {
                await router.push("/admin");
            }
            break
        }
        default:
            if (!router.currentRoute.value.path.includes("login") &&
            !router.currentRoute.value.path.includes("register") &&
            !router.currentRoute.value.path.includes("email-confirmation")) {
                await router.push("/login");
            }
            break
    }
}