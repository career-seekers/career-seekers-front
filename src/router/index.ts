import { createRouter, createWebHistory } from 'vue-router';
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

//expert views
import ExpertDashboardHome from "@/views/expert/ExpertDashboardHome.vue";
import ExpertCompetencies from "@/views/expert/ExpertCompetencies.vue";
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
import ChildrenCompetencies from '@/views/shared/ChildrenCompetencies.vue';

import { RouterGuardManager } from '@/utils/RouterGuardManager.ts';
import { Roles } from '@/state/UserState.types.ts';
import { useUserStore } from '@/stores/userStore.ts';
import { useAuthStore } from '@/stores/authStore.ts';
import CompetenceParticipants from '@/views/shared/CompetenceParticipants.vue';
import CompetenciesEvents from '@/views/shared/CompetenciesEvents.vue';
import { setPrefix } from '@/router/types.d';

const sharedRoutes = [
  {
    path: "participants/:competenceId",
    name: "competence-participants",
    component: CompetenceParticipants,
    props: true
  },
  {
    path: "documents/:competenceId",
    name: "competence-documents",
    component: CompetenceDocuments,
    props: true
  },
  {
    path: "events/:competenceId?/:ageCategoryId?",
    name: "competence-events",
    component: CompetenciesEvents,
    props: true
  }
]

const authRoutes = [
  {
    path: "/",
    name: "main",
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
    meta: {
      blocked: true,
    }
  },
  {
    path: "/register/user",
    name: "user-register",
    component: ParentRegisterView,
    meta: {
      blocked: true,
    }
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
]

const adminRoutes = setPrefix([
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
        component: AdminUsers,
        props: { mode: "MENTORS" },
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
          icon: "pi pi-file",
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
        path: "events",
        component: CompetenciesEvents,
        meta: {
          title: "События",
          icon: "pi pi-calendar",
        }
      },
      ...sharedRoutes
    ]
  },
], 'admin')

const tutorRoutes = setPrefix([
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
        component: TutorDashboardHome,
        meta: {
          title: "Главная",
          icon: "pi pi-home",
        }
      },
      {
        path: "experts",
        component: TutorExperts,
        meta: {
          title: "Главные эксперты",
          icon: "pi pi-users",
        }
      },
      {
        path: "competencies",
        component: TutorCompetencies,
        meta: {
          title: "Компетенции",
          icon: "pi pi-briefcase",
        }
      },
      {
        path: "documents",
        component: TutorDocuments,
        meta: {
          title: "Документы",
          icon: "pi pi-file",
        }
      },
      {
        path: "venue-info",
        component: TutorVenueInfo,
        meta: {
          title: "Информация о площадке",
          icon: "pi pi-building",
        }
      },
      {
        path: "events",
        component: CompetenciesEvents,
        meta: {
          title: "События",
          icon: "pi pi-calendar",
        }
      },
      ...sharedRoutes
    ],
  },
], 'tutor')

const expertRoutes = setPrefix([
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
        component: ExpertDashboardHome,
        meta: {
          title: "Главная",
          icon: "pi pi-home"
        }
      },
      {
        path: "competencies",
        component: ExpertCompetencies,
        meta: {
          title: "Компетенции",
          icon: "pi pi-briefcase"
        }
      },
      {
        path: "documents",
        component: ExpertDocuments,
        meta: {
          title: "Документы",
          icon: "pi pi-folder"
        }
      },
      {
        path: "events",
        component: CompetenciesEvents,
        meta: {
          title: "События",
          icon: "pi pi-calendar",
        }
      },
      ...sharedRoutes
    ],
  },
], 'expert')

const mentorRoutes = setPrefix([
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
        component: MentorDashboardHome,
        meta: {
          title: "Главная",
          icon: "pi pi-home"
        }
      },
      {
        path: "competencies",
        component: ChildrenCompetencies,
        meta: {
          title: "Компетенции",
          icon: "pi pi-briefcase"
        }
      },
      ...sharedRoutes
    ],
  },
], 'mentor')

const userRoutes = setPrefix([
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
        component: UserDashboardHome,
        meta: {
          title: "Главная",
          icon: "pi pi-home"
        }
      },
      {
        path: "competencies",
        component: ChildrenCompetencies,
        meta: {
          title: "Компетенции",
          icon: "pi pi-briefcase"
        }
      },
      ...sharedRoutes
    ],
  },
], 'user')

const routes = [
  ...authRoutes,
  {
    path: "/link/:id",
    name: "mentor-link-confirmation",
    component: MentorLinkConfirmation,
  },
  ...adminRoutes,
  ...tutorRoutes,
  ...expertRoutes,
  ...mentorRoutes,
  ...userRoutes,
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

  if (to.name === `${(userStore.user?.role ?? "").toLowerCase()}-competence-events`) {
    const { competenceId, ageCategoryId } = to.params;

    // Если ID невалидные — редиректим на чистый URL
    if (competenceId && isNaN(Number(competenceId))) {
      next({ name: `${(userStore.user?.role ?? "").toLowerCase()}-competence-events` });
      return;
    }
    if (ageCategoryId && isNaN(Number(ageCategoryId))) {
      next({
        name: `${(userStore.user?.role ?? "").toLowerCase()}-competence-events`,
        params: { competenceId }
      });
      return;
    }
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
