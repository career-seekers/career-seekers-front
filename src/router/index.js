import { createRouter, createWebHistory } from "vue-router";
import { titleManager } from "@/utils/titleManager.js";

// Auth views
import LoginView from "@/views/auth/LoginView.vue";
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
import ExpertDocuments from "@/views/expert/ExpertDocuments.vue";
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
import { fillUserState, redirectByUserState } from "../state/UserState";
import TutorCompetencies from "@/views/tutor/TutorCompetencies.vue";

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
    path: "/register",
    name: "register",
    component: MentorRegisterView,
  },
  {
    path: "/register/mentor",
    name: "mentor-register",
    component: MentorRegisterView,
  },
  {
    path: "/register/parent",
    name: "parent-register",
    component: ParentRegisterView,
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
        name: "expert-documents",
        component: ExpertDocuments,
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
        path: "documents",
        name: "tutor-documents",
        component: TutorDocuments,
      },
      {
        path: "venue-info",
        name: "tutor-venue-info",
        component: TutorVenueInfo,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async () => {
  await fillUserState();
});
// Обновляем title при переходах между страницами
router.afterEach(async (to) => {
  const pageTitle = titleManager.getPageTitle(to.name);
  titleManager.setTitle(pageTitle);
  await redirectByUserState();
});

export default router;
