import { createRouter, createWebHistory } from 'vue-router'
import { titleManager } from '@/utils/titleManager.js'

// Auth views
import LoginView from '@/views/auth/LoginView.vue'
import ExpertRegisterView from '@/views/auth/ExpertRegisterView.vue'
import ParentRegisterView from '@/views/auth/ParentRegisterView.vue'
import TutorRegisterView from '@/views/auth/TutorRegisterView.vue'
import EmailConfirmationView from '@/views/auth/EmailConfirmationView.vue'

// Parent views
import ParentDashboard from '@/views/parent/ParentDashboard.vue'
import ParentDashboardHome from '@/views/parent/ParentDashboardHome.vue'
import ParentCompetenciesSelection from '@/views/parent/ParentCompetenciesSelection.vue'
import ParentMyCompetencies from '@/views/parent/ParentMyCompetencies.vue'
import ParentAchievements from '@/views/parent/ParentAchievements.vue'

// Expert views
import ExpertDashboard from '@/views/expert/ExpertDashboard.vue'
import ExpertDashboardHome from '@/views/expert/ExpertDashboardHome.vue'
import ExpertParticipants from '@/views/expert/ExpertParticipants.vue'
import ExpertMyCertificates from '@/views/expert/ExpertMyCertificates.vue'
import ExpertParticipantsCertificates from '@/views/expert/ExpertParticipantsCertificates.vue'

// Tutor views
import TutorDashboard from '@/views/tutor/TutorDashboard.vue'
import TutorDashboardHome from '@/views/tutor/TutorDashboardHome.vue'
import TutorExperts from '@/views/tutor/TutorExperts.vue'
import TutorDocuments from '@/views/tutor/TutorDocuments.vue'
import TutorVenueInfo from '@/views/tutor/TutorVenueInfo.vue'

// UserState
import {fillUserState} from "../../state/UserState";

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: ExpertRegisterView
  },
  {
    path: '/register/expert',
    name: 'expert-register',
    component: ExpertRegisterView
  },
  {
    path: '/register/parent',
    name: 'parent-register',
    component: ParentRegisterView
  },
  {
    path: '/register/tutor',
    name: 'tutor-register',
    component: TutorRegisterView
  },
  {
    path: '/email-confirmation',
    name: 'email-confirmation',
    component: EmailConfirmationView
  },
  {
    path: '/parent',
    component: ParentDashboard,
    children: [
      {
        path: '',
        redirect: '/parent/dashboard'
      },
      {
        path: 'dashboard',
        name: 'parent-dashboard',
        component: ParentDashboardHome
      },
      {
        path: 'competencies',
        name: 'parent-competencies',
        component: ParentCompetenciesSelection
      },
      {
        path: 'my-competencies',
        name: 'parent-my-competencies',
        component: ParentMyCompetencies
      },
      {
        path: 'achievements',
        name: 'parent-achievements',
        component: ParentAchievements
      }
    ]
  },
  {
    path: '/expert',
    component: ExpertDashboard,
    children: [
      {
        path: '',
        redirect: '/expert/dashboard'
      },
      {
        path: 'dashboard',
        name: 'expert-dashboard',
        component: ExpertDashboardHome
      },
      {
        path: 'participants',
        name: 'expert-participants',
        component: ExpertParticipants
      },
      {
        path: 'my-certificates',
        name: 'expert-my-certificates',
        component: ExpertMyCertificates
      },
      {
        path: 'participants-certificates',
        name: 'expert-participants-certificates',
        component: ExpertParticipantsCertificates
      }
    ]
  },
  {
    path: '/tutor',
    component: TutorDashboard,
    children: [
      {
        path: '',
        redirect: '/tutor/dashboard'
      },
      {
        path: 'dashboard',
        name: 'tutor-dashboard',
        component: TutorDashboardHome
      },
      {
        path: 'experts',
        name: 'tutor-experts',
        component: TutorExperts
      },
      {
        path: 'documents',
        name: 'tutor-documents',
        component: TutorDocuments
      },
      {
        path: 'venue-info',
        name: 'tutor-venue-info',
        component: TutorVenueInfo
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Обновляем title при переходах между страницами
router.afterEach((to) => {
  const pageTitle = titleManager.getPageTitle(to.name)
  titleManager.setTitle(pageTitle)
})

if (localStorage.getItem("access_token") && localStorage.getItem("refresh_token")) {
  await fillUserState()
}

export default router
