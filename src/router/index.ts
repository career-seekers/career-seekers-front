

import { createRouter, createWebHistory } from "vue-router";
import { titleManager } from "@/utils/titleManager.ts";

// Auth views
import LoginView from '@/views/auth/LoginView.vue';
import MentorRegisterView from "@/views/auth/MentorRegisterView.vue";
import ParentRegisterView from "@/views/auth/ParentRegisterView.vue";
import TutorRegisterView from "@/views/auth/TutorRegisterView.vue";
import EmailConfirmationView from "@/views/auth/EmailConfirmationView.vue";

// Parent views
import ParentDashboard from "@/views/parent/ParentDashboard.vue";
import ParentDashboardHome from "@/views/parent/ParentDashboardHome.vue";
import ParentCompetenciesSelection from "@/views/parent/ParentCompetenciesSelection.vue";
import ParentMyCompetencies from "@/views/parent/ParentMyCompetencies.vue";
import ParentAchievements from "@/views/parent/ParentAchievements.vue";

//expert views
import ExpertDashboard from "@/views/expert/ExpertDashboard.vue";
import ExpertDashboardHome from "@/views/expert/ExpertDashboardHome.vue";
import ExpertCompetencies from "@/views/expert/ExpertCompetencies.vue";
import ExpertParticipants from "@/views/expert/ExpertParticipants.vue";
import ExpertEvents from "@/views/expert/ExpertEvents.vue";

// mentor views
import MentorDashboard from "@/views/mentor/MentorDashboard.vue";
import MentorDashboardHome from "@/views/mentor/MentorDashboardHome.vue";
import MentorParticipants from "@/views/mentor/MentorParticipants.vue";
import MentorMyCertificates from "@/views/mentor/MentorMyCertificates.vue";
import MentorParticipantsCertificates from "@/views/mentor/MentorParticipantsCertificates.vue";

// tutor views
import TutorDashboard from "@/views/tutor/TutorDashboard.vue";
import TutorDashboardHome from "@/views/tutor/TutorDashboardHome.vue";
import TutorExperts from "@/views/tutor/TutorExperts.vue";
import TutorDocuments from "@/views/tutor/TutorDocuments.vue";
import TutorVenueInfo from "@/views/tutor/TutorVenueInfo.vue";
import { fillUserState, redirectByUserState } from '../state/UserState';
import TutorCompetencies from "@/views/tutor/TutorCompetencies.vue";
import AdminDashboard from '@/views/admin/AdminDashboard.vue';
import AdminDashboardHome from '@/views/admin/AdminDashboardHome.vue';
import AdminTutors from '@/views/admin/AdminTutors.vue';
import AdminExperts from '@/views/admin/AdminExperts.vue';
import AdminCompetencies from '@/views/admin/AdminCompetencies.vue';
import AdminDocuments from '@/views/admin/AdminDocuments.vue';
import AdminVenues from '@/views/admin/AdminVenues.vue';
import CompetenceDocuments from '@/views/shared/CompetenceDocuments.vue';
import { RouterGuardManager } from '@/utils/RouterGuardManager.ts';

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
    meta: { blocked: true },
  },
  {
    path: "/register/parent",
    name: "parent-register",
    component: ParentRegisterView,
    meta: { blocked: true },
  },
  {
    path: "/register/tutor",
    name: "tutor-register",
    component: TutorRegisterView,
  },
  {
    path: "/email-confirmation",
    name: "email-confirmation",
    component: EmailConfirmationView,
  },
  {
    path: "/parent",
    component: ParentDashboard,
    meta: { blocked: true },
    children: [
      {
        path: "",
        redirect: "/parent/dashboard",
      },
      {
        path: "dashboard",
        name: "parent-dashboard",
        component: ParentDashboardHome,
      },
      {
        path: "competencies",
        name: "parent-competencies",
        component: ParentCompetenciesSelection,
      },
      {
        path: "my-competencies",
        name: "parent-my-competencies",
        component: ParentMyCompetencies,
      },
      {
        path: "achievements",
        name: "parent-achievements",
        component: ParentAchievements,
      },
    ],
  },
  {
    path: "/mentor",
    component: MentorDashboard,
    meta: { blocked: true },
    children: [
      {
        path: "",
        redirect: "/mentor/dashboard",
      },
      {
        path: "dashboard",
        name: "mentor-dashboard",
        component: MentorDashboardHome,
      },
      {
        path: "participants",
        name: "mentor-participants",
        component: MentorParticipants,
      },
      {
        path: "my-certificates",
        name: "mentor-my-certificates",
        component: MentorMyCertificates,
      },
      {
        path: "participants-certificates",
        name: "mentor-participants-certificates",
        component: MentorParticipantsCertificates,
      },
    ],
  },
  {
    path: "/expert",
    component: ExpertDashboard,
    children: [
      {
        path: "",
        redirect: "/expert/dashboard",
      },
      {
        path: "dashboard",
        name: "expert-dashboard",
        component: ExpertDashboardHome,
      },
      {
        path: "competencies",
        name: "expert-competencies",
        component: ExpertCompetencies,
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
      {
        path: "events",
        name: "expert-events",
        component: ExpertEvents,
      },
    ],
  },
  {
    path: "/tutor",
    component: TutorDashboard,
    children: [
      {
        path: "",
        redirect: "/tutor/dashboard",
      },
      {
        path: "dashboard",
        name: "tutor-dashboard",
        component: TutorDashboardHome,
      },
      {
        path: "experts",
        name: "tutor-experts",
        component: TutorExperts,
      },
      {
        path: "competencies",
        name: "tutor-competencies",
        component: TutorCompetencies,
      },
      {
        path: "documents/",
        name: "tutor-documents",
        component: TutorDocuments,
      },
      {
        path: "documents/:competenceId",
        name: "tutor-competence-documents",
        component: CompetenceDocuments,
        props: true
      },
      {
        path: "venue-info",
        name: "tutor-venue-info",
        component: TutorVenueInfo,
      },
    ],
  },
  {
    path: "/admin",
    component: AdminDashboard,
    children: [
      {
        path: "",
        redirect: "/admin/dashboard",
      },
      {
        path: "dashboard",
        component: AdminDashboardHome
      },
      {
        path: "tutors",
        component: AdminTutors
      },
      {
        path: "experts",
        component: AdminExperts
      },
      {
        path: "competencies",
        component: AdminCompetencies
      },
      {
        path: "documents",
        component: AdminDocuments,
      },
      {
        path: "documents/:competenceId",
        name: "admin-competence-documents",
        component: CompetenceDocuments,
        props: true
      },
      {
        path: "venues",
        component: AdminVenues
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
  if (to.meta.blocked) {
    next({ path: "/" })
  } else {
    await fillUserState();

    const redirectPath = await RouterGuardManager.checkCompetenceDocumentsRoute(to)

    if (redirectPath === null) next()
    else next({ path: redirectPath })
  }
});
// Обновляем title при переходах между страницами
router.afterEach(async (to, from) => {
  const pageTitle = titleManager.getPageTitle(
    to.name
      ? to.name.toString()
      : "No title"
  );
  historyStack.push(from.fullPath);
  titleManager.setTitle(pageTitle);

  await redirectByUserState();
});

export default router;
