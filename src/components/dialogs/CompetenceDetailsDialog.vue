<script lang="ts">

  import { type PropType } from 'vue';
  import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
  import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';
  import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
  import { PlatformResolver } from '@/api/resolvers/platform/platform.resolver.ts';
  import type { PlatformOutputDto } from '@/api/resolvers/platform/dto/output/platform-output.dto.ts';
  import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
  import Dialog from 'primevue/dialog';
  import { useUserStore } from '@/stores/userStore.ts';
  import { Roles } from '@/state/UserState.types.ts';
  import type { DocumentsOutputDto } from '@/api/resolvers/competence/dto/output/documents-output.dto.ts';
  import { FileResolver } from '@/api/resolvers/files/file.resolver.ts';
  import { useQueueStatuses } from '@/shared/UseQueueStatuses.ts';

  export default {
    name: 'CompetenceDetailsDialog',
    components: {
      Dialog,
    },
    props: {
      showDetailsDialogProp: {
        type: Boolean,
        required: true
      },
      selectedCompetenceProp: {
        type: Object as PropType<CompetenceOutputDto>,
        required: true
      }
    },
    emits: ['update:showDetailsDialog'],
    data: function() {
      return {
        userStore: useUserStore(),
        showDetailsDialog: false,
        ageGroups: useAgeGroups,
        queueStatuses: useQueueStatuses,

        userResolver: new UserResolver(),
        platformResolver: new PlatformResolver(),
        fileResolver: new FileResolver(),

        selectedCompetence: null as CompetenceOutputDto | null,
        document: null as DocumentsOutputDto | null,
        expert: null as UserOutputDto | null,
        platform: null as PlatformOutputDto | null
      };
    },
    computed: {
      Roles() {
        return Roles
      },
      showParticipantsInfo() {
        if (!this.userStore?.user) return false
        return [Roles.ADMIN, Roles.TUTOR, Roles.EXPERT]
          .includes(this.userStore.user.role)
      },
      showStatisticsInfo() {
        return this.userStore?.user?.role === Roles.ADMIN
      }
    },
    watch: {
      showDetailsDialogProp: {
        handler(newValue: boolean) {
          this.showDetailsDialog = newValue;
        },
        immediate: true
      },
      selectedCompetenceProp: {
        handler(newValue: any) {
          if (newValue) {
            this.selectedCompetence = newValue;
            if (this.userStore?.user?.role === Roles.MENTOR) {
              this.competenceExpert(newValue);
              this.competencePlatform(newValue);
            }
          }
        },
        immediate: true
      },
      showDetailsDialog(newValue: boolean) {
        this.$emit('update:showDetailsDialog', newValue);
      }
    },
    async mounted() {
        console.log('CompetenceDialog: mounted');
        await this.loadDialog()
    },
    methods: {
      async loadDialog() {
        if (this.selectedCompetenceProp) {
          this.selectedCompetence = this.selectedCompetenceProp
          if (this.userStore?.user?.role === Roles.MENTOR) {
            console.log('Loading expert and platform data...');
            await this.competenceExpert(this.selectedCompetence)
            await this.competencePlatform(this.selectedCompetence)
          }
        }
      },
      async competenceExpert(competence: CompetenceOutputDto) {
        const response = await this.userResolver.getById(competence.expertId)
        if (typeof response.message === 'string' || response.status !== 200) return
        this.expert = response.message
      },
      async competencePlatform(competence: CompetenceOutputDto) {
        const response = await this.platformResolver.getByUserId(competence.userId)
        if (typeof response.message === 'string' || response.status !== 200) return
        this.platform = response.message
      },
      competenceAgeCategories(competence: CompetenceOutputDto) {
        return competence.ageCategories.map(category => {
          return this.ageGroups.find(group => group.value === category.ageCategory)?.label
        }).join(", ")
      },
    }
  };
</script>

<template>
  <!-- Диалог с подробной информацией о компетенции -->
  <Dialog
    v-model:visible="showDetailsDialog"
    :header="selectedCompetence?.name || 'Загрузка...'"
    modal
    :style="{ width: '90vw', maxWidth: '800px' }"
    class="competence-dialog"
  >
    <div
      v-if="selectedCompetence"
      class="competence-details"
    >
      <div class="details-header">
        <div class="details-meta">
          <div class="meta-item">
            <i class="pi pi-calendar" />
            <span>Возраст: {{ competenceAgeCategories(selectedCompetence) }}</span>
          </div>
        </div>
      </div>

      <div class="details-content">
        <div class="details-section">
          <div class="section-title">
            <i class="pi pi-info-circle" />
            Описание
          </div>
          <div class="competence-details">
            <div class="competence-name">
              {{ selectedCompetence.name }}
            </div>
            <div class="competence-description">
              {{ selectedCompetence.description }}
            </div>
          </div>
        </div>

        <div
          v-if="expert"
          class="details-section"
        >
          <div class="section-title">
            <i class="pi pi-user" />
            Контакты главного эксперта
          </div>
          <div class="mentor-info">
            <div class="mentor-details">
              <div class="detail-item">
                <div class="detail-label">
                  ФИО:
                </div>
                <div class="detail-value">
                  {{ `${expert.lastName} ${expert.firstName} ${expert.patronymic}` }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">
                  Email:
                </div>
                <div class="detail-value">
                  <a :href="`mailto:${expert.email}`">{{ expert.email }}</a>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="platform"
            class="details-section"
          >
            <div class="section-title">
              <i class="pi pi-globe" />
              Информация о площадке
            </div>
            <div class="competence-details">
              <div class="detail-item">
                <div class="detail-label">
                  Название:
                </div>
                <div class="detail-value">
                  {{ platform.fullName }}
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">
                  Адрес:
                </div>
                <div class="detail-value">
                  {{ platform.address }}
                </div>
              </div>
              <div
                v-if="platform.website"
                class="detail-item"
              >
                <div class="detail-label">
                  Сайт:
                </div>
                <div class="detail-value">
                  <a :href="platform.website">{{ platform.website }}</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="showParticipantsInfo"
          class="detail-section"
        >
          <div class="section-title">
            <i class="pi pi-users" />
            Участники
          </div>
          <div
            v-for="ageGroup in selectedCompetence.ageCategories"
            :key="ageGroup.id"
            class="stats-grid"
          >
            <div
              class="stat-item"
            >
              <div class="stat-number">
                {{ ageGroups.find(group => group.value === ageGroup.ageCategory)?.label }}
              </div>
              <div class="stat-label">
                Максимум:
                {{
                  ageGroup.maxParticipantsCount === 0
                    ? 'не ограничено'
                    : ageGroup.maxParticipantsCount + " человек"
                }}
              </div>
            </div>
            <div
              v-for="status in queueStatuses.sort(
                (b, a) => a.value
                  .toString()
                  .localeCompare(b.value.toString()))"
              :key="status.value"
              class="stat-item"
            >
              <div class="stat-number">
                {{
                  ageGroup.participants
                    .filter(participant => participant.queueStatus === status.value).length
                }}
              </div>
              <div class="stat-label">
                {{ queueStatuses.find(queueStatus => queueStatus.value === status.value)?.label }}
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="showStatisticsInfo"
          class="detail-section"
        >
          <div class="section-title">
            <i class="pi pi-chart-line" />
            Общая статистика
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">
                {{ selectedCompetence.participantsCount }}
              </div>
              <div class="stat-label">
                Участников
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-number">
                {{ 0 }}
              </div>
              <div class="stat-label">
                Событий
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-number">
                {{ selectedCompetence.documents.length }}
              </div>
              <div class="stat-label">
                Документов
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
  .competence-dialog {
    z-index: 1000;
  }

  .details-section {
    margin-bottom: 2.5rem;
    max-height: 50vh;
    overflow: hidden;
  }

  .details-section:last-child {
    margin-bottom: 0;
  }

  .section-title {
    color: #2c3e50;
    margin: 0 0 1.25rem 0;
    font-size: 1.2rem;
    font-weight: 600;
    border-bottom: 2px solid #ff9800;
    padding-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .details-header {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .competence-details {
    padding: 0 1.5rem;
    border-radius: 12px;
  }

  .competence-details .competence-name {
    color: #2c3e50;
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    line-height: 1.3;
  }

  .competence-details .competence-description {
    color: #6c757d;
    font-size: 1rem;
    margin-bottom: 0;
    line-height: 1.5;
    max-height: 38vh;
    overflow: scroll;
  }

  .mentor-info {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    border-left: 4px solid #28a745;
  }

  .mentor-details {
    margin-bottom: 1rem;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .detail-item:last-child {
    margin-bottom: 0;
  }

  .detail-label {
    color: #6c757d;
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .detail-value {
    color: #2c3e50;
    font-weight: 500;
    font-size: 1rem;
    line-height: 1.4;
  }

  .detail-value a {
    color: #2196f3;
    text-decoration: none;
  }

  .detail-value a:hover {
    text-decoration: underline;
  }

  .competence-image img {
    width: 200px;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
  }

  .details-meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #495057;
  }

  .meta-item i {
    color: #ff9800;
    width: 16px;
  }

  .details-content h4 {
    color: #2c3e50;
    margin: 1.5rem 0 0.75rem 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .details-content p {
    color: #6c757d;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .contact-item i {
    color: #ff9800;
    width: 16px;
  }

  .stats-grid {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    border-bottom: solid 1px #6c757d;;
    padding-bottom: 1.5rem;
    margin-top: 1rem;
  }

  .stats-grid:last-child {
    border-bottom: none;
  }

  .stat-item {
    flex: 1;
    text-align: center;
    min-width: 0;
  }

  .stat-number {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.8rem;
    color: #6c757d;
  }


  /* Мобильные стили */
  @media (max-width: 768px) {

    .details-section {
      margin-bottom: 2rem;
    }

    .section-title {
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }

    .competence-details,
    .mentor-info {
      padding: 1.25rem;
    }

    .competence-details .competence-name {
      font-size: 1.2rem;
    }

    .detail-item {
      margin-bottom: 0.75rem;
    }

    .stats-grid {
      flex-wrap: wrap;
      gap: 1rem;
    }

    .stat-item {
      flex: 1 1 calc(50% - 0.125rem);
      min-width: 0;
    }

    .details-header {
      flex-direction: column;
    }

    .competence-image img {
      width: 100%;
      height: 150px;
    }
  }
</style>