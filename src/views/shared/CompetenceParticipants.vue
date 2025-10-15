<script lang="ts">

  import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
  import { CompetenceResolver } from '@/api/resolvers/competence/competence.resolver.ts';
  import router from '@/router';
  import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
  import type { AgeCategories } from '@/api/resolvers/ageCategory/ageCategories.ts';
  import Button from 'primevue/button';
  import { FormatManager } from '@/utils/FormatManager.ts';
  import { ChildCompetenciesResolver } from '@/api/resolvers/childCompetencies/child-competencies.resolver.ts';
  import { ChildResolver } from '@/api/resolvers/child/child.resolver.ts';
  import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
  import ProgressSpinner from 'primevue/progressspinner';
  import { QueueStatuses } from '@/api/resolvers/childCompetencies/types.ts';
  import { useQueueStatuses } from '@/shared/UseQueueStatuses.ts';
  import TabPanel from 'primevue/tabpanel';
  import TabView from 'primevue/tabview';

  export default {
    name: 'CompetenceParticipants',
    components: {
      TabView,
      TabPanel,
      Button,
      ProgressSpinner
    },
    props: {
      competenceId: {
        type: String,
        required: true,
      }
    },
    data: function() {
      return {
        competenceResolver: new CompetenceResolver(),
        competence: null as CompetenceOutputDto | null,

        ageGroups: useAgeGroups,
        queueStatuses: useQueueStatuses,

        children: [] as {
          id: number,
          lastName: string,
          firstName: string,
          patronymic: string,
          queueStatus: QueueStatuses,
          childDocuments: {
            ageCategory: AgeCategories,
            studyingPlace: string,
            trainingGround: string,
          } | null,
          mentor: {
            lastName: string,
            firstName: string,
            patronymic: string,
            mobileNumber: string,
            email: string,
          } | null,
          user: {
            lastName: string,
            firstName: string,
            patronymic: string,
            mobileNumber: string,
            email: string,
          } | null
        }[],

        userResolver: new UserResolver(),
        childCompetenceResolver: new ChildCompetenciesResolver(),
        childResolver: new ChildResolver(),
        selectedAge: null as AgeCategories | null,

        isLoading: false,
        activeTab: 0,
      };
    },
    computed: {
      FormatManager() {
        return FormatManager
      },
      tabsConfig() {
        const tabs = [
          {
            key: 'participates',
            header: 'Участвую',
            children: this.participatedChildren,
            hasChildren: this.participatedChildren.length > 0
          },
          {
            key: 'in_queue',
            header: 'В очереди',
            children: this.queuedChildren,
            hasChildren: this.participatedChildren.length > 0
          }
        ];

        // Сортируем табы: сначала с документами, потом без документов
        return tabs.sort((a, b) => {
          if (a.hasChildren && !b.hasChildren) return -1;
          if (!a.hasChildren && b.hasChildren) return 1;
          return 0;
        });
      },
      participatedChildren() {
        return this.children.filter(child => child.queueStatus === QueueStatuses.PARTICIPATES)
      },
      queuedChildren() {
        return this.children.filter(child => child.queueStatus === QueueStatuses.IN_QUEUE)
      },
      competenceIdChecked() {
        const num = parseInt(this.competenceId)
        if (isNaN(num)) router.go(-1)
        return num
      },
      availableAges() {
        const ageOrder = new Map(this.ageGroups.map((group, index) => [group.value, index]));
        return [...new Set(this.competence?.ageCategories.map(category => category.ageCategory))].toSorted((a, b) => {
          return ageOrder.get(a)!! - ageOrder.get(b)!!;
        });
      },
      filteredChildren() {
        if (this.selectedAge === null) return this.children
        return this.children.filter(child => child.childDocuments?.ageCategory === this.selectedAge)
      }
    },
    async mounted() {
      window.scrollTo(0, 0);
      this.isLoading = true;
      const response = await this.competenceResolver.getById(this.competenceIdChecked)
      if (typeof response.message !== "string") {
        this.competence = response.message
        await this.loadChildren()
      }
      this.isLoading = false
    },
    methods: {
      async loadChildren() {
        const childCompetenceResponse = await this.childCompetenceResolver.getByCompetenceId(this.competenceIdChecked)
        if (typeof childCompetenceResponse.message !== "string") {
          const promises = childCompetenceResponse.message.map(async childCompetence => {
            return {
              child: await this.childResolver.getById(childCompetence.childId),
              queueStatus: childCompetence.queueStatus,
            }
          })
          const responses = await Promise.all(promises);
          for (const response of responses) {
            if (typeof response.child.message !== "string") {
              this.children.push({
                ...response.child.message,
                queueStatus: response.queueStatus
              })
            }
          }
        }
      },
      resetAge() {
        this.selectedAge = null
      }
    }
  };
</script>

<template>
  <Transition
    mode="out-in"
    appear
  >
    <div
      v-if="competence !== null"
      class="mentors-page"
    >
      <div class="page-header">
        <h1 class="page-title">
          Участники компетенции
        </h1>
        <p class="page-subtitle">
          Управление участниками компетенции <b>{{ competence.name }}</b>
        </p>
      </div>
      <div
        v-if="availableAges.length > 0"
        class="filter-group"
      >
        <label>Возрастные группы:</label>
        <div class="age-buttons">
          <Button
            v-for="age in availableAges"
            :key="age"
            :class="selectedAge === age ? 'p-button' : 'p-button-outlined'"
            :label="ageGroups.find(group => group.value === age)?.label"
            size="small"
            @click="selectedAge = age"
          />
          <Button
            label="Сбросить возраст"
            icon="pi pi-refresh"
            class="p-button-text p-button-sm"
            @click="resetAge"
          />
        </div>
      </div>

      <div v-if="isLoading">
        <ProgressSpinner style="width: 100%; height: 5rem; margin-top: 5rem" />
      </div>
      <TabView
        v-else-if="filteredChildren.length > 0"
        v-model:active-index="activeTab"
        class="documents-tabs"
      >
        <TabPanel
          v-for="tab in tabsConfig"
          :key="tab.key"
          :header="tab.header"
          :disabled="!tab.hasChildren"
          :class="{ 'disabled-tab': !tab.hasChildren }"
        >
          <div
            class="experts-grid"
          >
            <div
              v-for="child in tab.children"
              :key="child.id"
              class="expert-card"
            >
              <div class="expert-header">
                <div class="expert-avatar">
                  <i class="pi pi-user" />
                </div>
                <div class="expert-info">
                  <h3 class="expert-name">
                    {{
                      child.lastName +
                        " " +
                        child.firstName +
                        " "
                    }}
                    {{
                      child.patronymic !== "null" ? child.patronymic : ""
                    }}
                  </h3>
                </div>
              </div>

              <div
                v-if="child.childDocuments !== null"
                class="expert-content"
              >
                <div class="expert-details">
                  <div class="detail-item">
                    <span class="detail-label">Образовательное учреждение:</span>
                    <span class="detail-value">{{ child.childDocuments.studyingPlace }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Площадка подготовки:</span>
                    <span class="detail-value">{{ child.childDocuments.trainingGround }}</span>
                  </div>
                </div>
                <h3
                  v-if="child.mentor !== null || child.user !== null"
                  class="expert-name"
                >
                  {{ child.mentor !== null ? 'Наставник' : 'Родитель' }}
                </h3>
                <div
                  v-if="child.mentor !== null || child.user !== null"
                  class="expert-details"
                >
                  <div class="detail-item">
                    <span class="detail-label">ФИО:</span>
                    <span class="detail-value">
                      {{ child.mentor !== null ? child.mentor.lastName : child.user?.lastName }}
                      {{ child.mentor !== null ? child.mentor.firstName : child.user?.firstName }}
                      {{ child.mentor !== null ? child.mentor.patronymic : child.user?.patronymic }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Телефон:</span>
                    <span class="detail-value">
                      {{
                        child.mentor !== null
                          ? FormatManager.formatMobileNumberFromDTO(child.mentor.mobileNumber)
                          : FormatManager.formatMobileNumberFromDTO(child.user?.mobileNumber ?? "")
                      }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Адрес электронной почты:</span>
                    <span class="detail-value">
                      {{
                        child.mentor !== null
                          ? child.mentor.email
                          : child.user?.email
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabView>
      <div v-else>
        <p>В данной {{ selectedAge === null ? 'компетенции' : 'возрастной категории' }} еще нет участников</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .page-header {
    margin-bottom: 2rem;
  }

  .page-title {
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    font-weight: 600;
    font-family: "BIPS", sans-serif;
  }

  .page-subtitle {
    color: #6c757d;
    margin: 0;
    font-size: 1.1rem;
  }

  .form-field label {
    color: #2c3e50;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 150px;
    margin-bottom: 2rem;
  }

  .age-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .filter-group label {
    color: #2c3e50;
    font-weight: 500;
    font-size: 0.9rem;
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .page-header {
    margin-bottom: 2rem;
  }

  .page-title {
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    font-weight: 600;
    font-family: "BIPS", sans-serif;
  }

  .page-subtitle {
    color: #6c757d;
    margin: 0;
    font-size: 1.1rem;
  }

  .documents-tabs {
    margin-top: 2rem;
  }

  .documents-tabs :deep(.p-tabview-nav) {
    background: transparent;
    border-radius: 0;
    padding: 0.5rem 0;
  }

  .documents-tabs :deep(.p-tabview-nav li) {
    margin-right: 0.5rem;
  }

  .documents-tabs :deep(.p-tabview-nav li .p-tabview-nav-link) {
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .documents-tabs :deep(.p-tabview-nav li.p-highlight .p-tabview-nav-link) {
    background: #ff9800;
    color: white;
    box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
  }

  .documents-tabs :deep(.p-tabview-panels) {
    background: transparent;
    border-radius: 0;
    box-shadow: none;
    padding: 0;
  }

  /* Стили для недоступных табов */
  .documents-tabs :deep(.p-tabview-nav li.disabled-tab .p-tabview-nav-link) {
    background: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
    border: 1px solid #dee2e6;
  }

  .documents-tabs :deep(.p-tabview-nav li.disabled-tab .p-tabview-nav-link:hover) {
    background: #f8f9fa;
    color: #6c757d;
    transform: none;
    box-shadow: none;
  }

  .documents-tabs :deep(.p-tabview-nav li.disabled-tab) {
    order: 999; /* Перемещаем в конец */
  }

  .experts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
    width: 100%;
  }

  .expert-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    overflow: hidden;
    transition:
      box-shadow 0.3s ease,
      border-color 0.3s ease;
  }

  .expert-card:hover {
    box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
    border: 2px solid #ff9800;
  }

  .expert-header {
    background: linear-gradient(135deg, #ff9800, #f57c00);
    color: white;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .expert-avatar {
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .expert-info {
    flex: 1;
  }

  .expert-name {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .expert-content {
    padding: 1.5rem;
  }

  .expert-details {
    margin-bottom: 1.5rem;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f1f3f4;
  }

  .detail-item:last-child {
    border-bottom: none;
  }

  .detail-label {
    color: #6c757d;
    font-weight: 500;
    min-width: 100px;
  }

  .detail-value {
    color: #2c3e50;
    font-weight: 500;
    text-align: right;
  }

  .form-field label {
    color: #2c3e50;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f1f3f4;
  }

  .detail-item:last-child {
    border-bottom: none;
  }

  .detail-label {
    color: #6c757d;
    font-weight: 500;
    min-width: 100px;
  }

  .detail-value {
    color: #2c3e50;
    font-weight: 500;
    text-align: right;
  }

  /* Мобильные стили */
  @media (max-width: 768px) {
    .page-title {
      font-size: 1.5rem;
    }

    .experts-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .expert-header {
      padding: 1rem;
      flex-direction: column;
      text-align: center;
    }

    .expert-avatar {
      width: 50px;
      height: 50px;
      font-size: 1.2rem;
    }

    .expert-content {
      padding: 1rem;
    }

    .detail-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .detail-value {
      text-align: left;
    }
  }

  /* Очень маленькие экраны */
  @media (max-width: 480px) {
    .page-title {
      font-size: 1.3rem;
    }

    .page-subtitle {
      font-size: 0.9rem;
    }

    .expert-header {
      padding: 0.75rem;
    }

    .expert-avatar {
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }

    .expert-name {
      font-size: 1rem;
    }
  }

</style>