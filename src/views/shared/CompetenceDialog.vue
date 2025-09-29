<script lang="ts">

  import { type PropType } from 'vue';
  import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
  import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';
  import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
  import { PlatformResolver } from '@/api/resolvers/platform/platform.resolver.ts';
  import type { PlatformOutputDto } from '@/api/resolvers/platform/dto/output/platform-output.dto.ts';
  import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
  import Dialog from 'primevue/dialog';

  export default {
    name: 'CompetenceDialog',
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
        showDetailsDialog: false,
        ageGroups: useAgeGroups,

        userResolver: new UserResolver(),
        platformResolver: new PlatformResolver(),

        selectedCompetence: null as CompetenceOutputDto | null,
        expert: null as UserOutputDto | null,
        platform: null as PlatformOutputDto | null
      };
    },
    watch: {
      async showDetailsDialogProp() {
        await this.loadDialog()
        this.showDetailsDialog = this.showDetailsDialogProp
      },
      async showDetailsDialog(newValue: boolean) {
        this.$emit('update:showDetailsDialog', newValue);
      }
    },
    async mounted() {
        await this.loadDialog()
    },
    methods: {
      async loadDialog() {
        if (this.selectedCompetence !== this.selectedCompetenceProp) {
          this.selectedCompetence = this.selectedCompetenceProp
          await this.competenceExpert(this.selectedCompetence)
          await this.competencePlatform(this.selectedCompetence)
          this.showDetailsDialog = this.showDetailsDialogProp
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
    :header="selectedCompetence?.name"
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
          <div class="meta-item">
            <i class="pi pi-users" />
            <span>Количество участников: {{ selectedCompetence.participantsCount }}</span>
          </div>
        </div>
      </div>

      <div class="details-content">
        <h4>Описание</h4>
        <p>{{ selectedCompetence.description }}</p>

        <h4>Контакты главного эксперта</h4>
        <div
          v-if="expert"
          class="mentor-contacts"
        >
          <div class="contact-item">
            <i class="pi pi-user" />
            <span>
              {{ `${expert.lastName} ${expert.firstName} ${expert.patronymic}` }}
            </span>
          </div>
          <div class="contact-item">
            <i class="pi pi-envelope" />
            <a :href="`mailto:${expert.email}`">{{ expert.email }}</a>
          </div>
          <div class="contact-item">
            <i class="pi pi-phone" />
            <a :href="`tel:${expert.mobileNumber}`">{{ expert.mobileNumber }}</a>
          </div>
        </div>

        <h4>Информация о площадке</h4>
        <div
          v-if="platform"
          class="mentor-contacts"
        >
          <div class="contact-item">
            <i class="pi pi-building" />
            <span>
              {{ platform.fullName }}
            </span>
          </div>
          <div class="contact-item">
            <i class="pi pi-map" />
            <span>{{ platform.address }}</span>
          </div>
          <div
            v-if="platform.website"
            class="contact-item"
          >
            <i class="pi pi-globe" />
            <a :href="platform.website">{{ platform.website }}</a>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
  .competence-details {
    max-height: 70vh;
    overflow-y: auto;
  }

  .details-header {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
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


  .mentor-contacts {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .contact-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #495057;
  }

  .contact-item i {
    color: #ff9800;
    width: 16px;
  }

  /* Мобильные стили */
  @media (max-width: 768px) {

    .details-header {
      flex-direction: column;
    }

    .competence-image img {
      width: 100%;
      height: 150px;
    }
  }
</style>