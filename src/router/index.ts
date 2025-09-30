import { createRouter, createWebHistory } from "vue-router";
import { titleManager } from "@/utils/titleManager.ts";

// Auth views
import LoginView from '@/views/auth/LoginView.vue';
import MentorRegisterView from "@/views/auth/MentorRegisterView.vue";
import ParentRegisterView from "@/views/auth/UserRegisterView.vue";
import TutorRegisterView from "@/views/auth/TutorRegisterView.vue";
import EmailConfirmationView from "@/views/auth/EmailConfirmationView.vue";
import ForgotPasswordView from "@/views/auth/ForgotPasswordView.vue";

// user views
import UserDashboardHome from "@/views/user/UserDashboardHome.vue";
import UserCompetencies from '@/views/user/UserCompetencies.vue';

//expert views
import ExpertDashboardHome from "@/views/expert/ExpertDashboardHome.vue";
import ExpertCompetencies from "@/views/expert/ExpertCompetencies.vue";
import ExpertParticipants from "@/views/expert/ExpertParticipants.vue";
import ExpertEvents from "@/views/expert/ExpertEvents.vue";
import ExpertDocuments from "@/views/expert/ExpertDocuments.vue";

// mentor views
import MentorDashboardHome from "@/views/mentor/MentorDashboardHome.vue";

// tutor views
import TutorDashboardHome from "@/views/tutor/TutorDashboardHome.vue";
import TutorExperts from "@/views/tutor/TutorExperts.vue";
import TutorDocuments from "@/views/tutor/TutorDocuments.vue";
import TutorVenueInfo from "@/views/tutor/TutorVenueInfo.vue";
import TutorCompetencies from "@/views/tutor/TutorCompetencies.vue";

// admin views
import AdminDashboardHome from '@/views/admin/AdminDashboardHome.vue';
import AdminTutors from '@/views/admin/AdminTutors.vue';
import AdminMentors from '@/views/admin/AdminMentors.vue';
import AdminExperts from '@/views/admin/AdminExperts.vue';
import AdminUsers from '@/views/admin/AdminUsers.vue';
import AdminCompetencies from '@/views/admin/AdminCompetencies.vue';
import AdminDocuments from '@/views/admin/AdminDocuments.vue';
import AdminChildrenDocuments from '@/views/admin/AdminChildrenDocuments.vue';
import AdminVenues from '@/views/admin/AdminVenues.vue';

//shared views
import CompetenceDocuments from '@/views/shared/CompetenceDocuments.vue';
import DashboardWrapper from '@/views/shared/DashboardWrapper.vue';
import MentorLinkConfirmation from '@/views/shared/MentorLinkConfirmation.vue';

import { RouterGuardManager } from '@/utils/RouterGuardManager.ts';
import { Roles } from '@/state/UserState.types.ts';
import { useUserStore } from '@/stores/userStore.ts';
import { useAuthStore } from '@/stores/authStore.ts';
import MentorCompetencies from '@/views/mentor/MentorCompetencies.vue';

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/register/mentor",
    name: "mentor-register",
    component: MentorRegisterView,
  },
  {
    path: "/register/user",
    name: "user-register",
    component: ParentRegisterView,
  },
  {
    path: "/register/tutor",
    name: "tutor-register",
    component: TutorRegisterView,
    meta: {
      blocked: true,
    }
  },
  {
    path: "/email-confirmation",
    name: "email-confirmation",
    component: EmailConfirmationView,
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: ForgotPasswordView,
  },
  {
    path: "/link/:id",
    name: "mentor-link-confirmation",
    component: MentorLinkConfirmation,
  },
  {
    path: "/user",
    component: DashboardWrapper,
    meta: {
      allowedRole: Roles.USER
    },
    children: [
      {
        path: "",
        redirect: "/user/dashboard",
      },
      {
        path: "dashboard",
        name: "user-dashboard",
        component: UserDashboardHome,
        meta: {
          title: "Главная",
          icon: "pi pi-home"
        }
      },
      {
        path: "competencies",
        name: "user-competencies",
        component: UserCompetencies,
        meta: {
          title: "Компетенции",
          icon: "pi pi-briefcase"
        }
      },
    ],
  },
  {
    path: "/mentor",
    component: DashboardWrapper,
    meta: {
      allowedRole: Roles.MENTOR
    },
    children: [
      {
        path: "",
        redirect: "/mentor/dashboard",
      },
      {
        path: "dashboard",
        name: "mentor-dashboard",
        component: MentorDashboardHome,
        meta: {
          title: "Главная",
          icon: "pi pi-home"
        }
      },
      {
        path: "competencies",
        name: "mentor-competencies",
        component: MentorCompetencies,
        meta: {
          title: "Компетенции",
          icon: "pi pi-briefcase"
        }
      },
    ],
  },
  {
    path: "/expert",
    component: DashboardWrapper,
    meta: {
      allowedRole: Roles.EXPERT
    },
    children: [
      {
        path: "",
        redirect: "/expert/dashboard",
      },
      {
        path: "dashboard",
        name: "expert-dashboard",
        component: ExpertDashboardHome,
        meta: {
          title: "Главная",
          icon: "pi pi-home"
        }
      },
      {
        path: "competencies",
        name: "expert-competencies",
        component: ExpertCompetencies,
        meta: {
          title: "Компетенции",
          icon: "pi pi-briefcase"
        }
      },
      {
        path: "events",
        name: "expert-events",
        component: ExpertEvents,
      },
      {
        path: "documents",
        name: "expert-documents",
        component: ExpertDocuments,
        meta: {
          title: "Документы",
          icon: "pi pi-folder"
        }
      },
      {
        path: "participants/:competenceId",
        name: "expert-participants",
        component: ExpertParticipants,
      },
      {
        path: "documents/:competenceId",
        name: "expert-competence-documents",
        component: CompetenceDocuments,
        props: true
      },
    ],
  },
  {
    path: "/tutor",
    component: DashboardWrapper,
    meta: {
      allowedRole: Roles.TUTOR
    },
    children: [
      {
        path: "",
        redirect: "/tutor/dashboard",
      },
      {
        path: "dashboard",
        name: "tutor-dashboard",
        component: TutorDashboardHome,
        meta: {
          title: "Главная",
          icon: "pi pi-home",
        }
      },
      {
        path: "experts",
        name: "tutor-experts",
        component: TutorExperts,
        meta: {
          title: "Главные эксперты",
          icon: "pi pi-users",
        }
      },
      {
        path: "competencies",
        name: "tutor-competencies",
        component: TutorCompetencies,
        meta: {
          title: "Компетенции",
          icon: "pi pi-briefcase",
        }
      },
      {
        path: "documents/",
        name: "tutor-documents",
        component: TutorDocuments,
        meta: {
          title: "Документы",
          icon: "pi pi-file",
        }
      },
      {
        path: "venue-info",
        name: "tutor-venue-info",
        component: TutorVenueInfo,
        meta: {
          title: "Информация о площадке",
          icon: "pi pi-building",
        }
      },
      {
        path: "documents/:competenceId",
        name: "tutor-competence-documents",
        component: CompetenceDocuments,
        props: true
      },
    ],
  },
  {
    path: "/admin",
    component: DashboardWrapper,
    meta: {
      allowedRole: Roles.ADMIN
    },
    children: [
      {
        path: "",
        redirect: "/admin/dashboard",
      },
      {
        path: "dashboard",
        component: AdminDashboardHome,
        meta: {
          title: "Главная",
          icon: "pi pi-home",
        }
      },
      {
        path: "tutors",
        component: AdminTutors,
        meta: {
          title: "Кураторы",
          icon: "pi pi-users",
        }
      },
      {
        path: "mentors",
        component: AdminMentors,
        meta: {
          title: "Наставники",
          icon: "pi pi-users",
        }
      },
      {
        path: "experts",
        component: AdminExperts,
        meta: {
          title: "Главные эксперты",
          icon: "pi pi-users",
        }
      },
      {
        path: "users",
        component: AdminUsers,
        meta: {
          title: "Родители",
          icon: "pi pi-users",
        }
      },
      {
        path: "competencies",
        component: AdminCompetencies,
        meta: {
          title: "Компетенции",
          icon: "pi pi-briefcase",
        }
      },
      {
        path: "documents",
        component: AdminDocuments,
        meta: {
          title: "Документы компетенций",
          icon: "pi pi-file",
        }
      },
      {
        path: "children-documents",
        component: AdminChildrenDocuments,
        meta: {
          title: "Документы детей",
          icon: "pi pi-users",
        }
      },
      {
        path: "venues",
        component: AdminVenues,
        meta: {
          title: "Площадки",
          icon: "pi pi-building",
        }
      },
      {
        path: "documents/:competenceId",
        component: CompetenceDocuments,
        props: true
      },
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: "/login"
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export const historyStack: string[] = []

router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore();
  const userStore = useUserStore();
  if (authStore.access_token !== null) {
    const userData = await authStore.loadByTokens()
    if (userData !== null) await userStore.fillUser(userData)
  }

  if (to.meta.blocked) {
    next({ path: "/"})
    return
  }

  // Проверяем, есть ли сохраненная ссылка для возврата после авторизации
  if (to.path === "/login" && userStore.user !== null) {
    const returnPath = localStorage.getItem('returnAfterLogin');
    if (returnPath) {
      localStorage.removeItem('returnAfterLogin');
      next({ path: returnPath });
      return;
    }
  }

  if (userStore.user === null && to.meta.allowedRole) {
    next({ path: "/login" })
    return
  }
  // Проверяем, есть ли сохраненная ссылка для возврата (приоритет над обычными редиректами)
  if (userStore.user !== null) {
    const returnPath = localStorage.getItem('returnAfterLogin');
    if (returnPath) {
      console.log('Found return path, redirecting to:', returnPath);
      localStorage.removeItem('returnAfterLogin');
      next({ path: returnPath });
      return;
    }
  }

  // Специальная обработка для страницы подтверждения наставника
  if (to.path.startsWith('/link/') && userStore.user?.role === Roles.USER) {
    console.log('Allowing access to mentor link confirmation page');
    next();
    return;
  }

  if (userStore.user !== null && (to.path === "/login" || to.meta.allowedRole !== userStore.user.role)) {
    console.log('No return path, redirecting to dashboard');
    next({ path: `/${userStore.user.role.toLowerCase()}/dashboard` })
    return
  }

  if (to.name?.toString().includes("competence-documents")) {
    const redirectPath = await RouterGuardManager.checkCompetenceDocumentsRoute(to)

    if (redirectPath === null) next()
    else next({ path: redirectPath })

    return
  }
  next()
});
// Обновляем title при переходах между страницами
router.afterEach((to, from) => {
  const pageTitle = titleManager.getPageTitle(
    to.name
      ? to.name.toString()
      : "No title"
  );
  historyStack.push(from.fullPath);
  titleManager.setTitle(pageTitle);
});

export default router;
