<script lang="ts">

  import type { PropType } from 'vue';
  import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
  import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
  import Button from 'primevue/button';
  import { useUserStore } from '@/stores/userStore.ts';
  import { Roles } from '@/state/UserState.types.ts';
  import type { AgeCategoryOutputDto } from '@/api/resolvers/ageCategory/age-category-output.dto.ts';
  import { AgeCategoryResolver } from '@/api/resolvers/age-category.resolver.ts';
  import router from '@/router';

  export default {
    name: 'CompetenciesList',
    components: {
      Button
    },
    props: {
      competencies: {
        type: Array as PropType<CompetenceOutputDto[]>,
        required: true
      }
    },
    emits: [
      "open-competence",
      "edit-competence",
      "delete-competence",
      "manage-places",
      "toggle-competence",
    ],
    data() {
      return {
        userStore: useUserStore(),
        ageGroups: useAgeGroups,
        ageCategoryResolver: new AgeCategoryResolver()
      }
    },
    computed: {
      Roles() {
        return Roles
      },
      showEditButtons() {
        if (this.userStore.user === null) return false
        return [Roles.TUTOR, Roles.ADMIN].includes(this.userStore.user.role)
      },
    },
    methods: {
      router() {
        return router
      },
      useUserStore,
      goToDocuments(competenceId: number) {
        this.$router.push(`/${this.userStore.user?.role.toLowerCase()}/documents/${competenceId}`);
      },
      async toggleAgeCategory(competenceId: number, ageCategory: AgeCategoryOutputDto) {
        const toggledCategory = {...ageCategory}
        toggledCategory.isDisabled = !toggledCategory.isDisabled
        const response = await this.ageCategoryResolver.toggle({
          id: toggledCategory.id,
          status: toggledCategory.isDisabled
        })
        if (response.status === 200) this.$emit('toggle-competence', competenceId, toggledCategory)
      }
    }
  };
</script>

<template>
  <div
    class="competencies-grid"
  >
    <div
      v-for="competence in competencies"
      :key="competence.id"
      class="competence-card"
    >
      <div class="competence-header">
        <div class="competence-info">
          <h3 class="competence-name">
            {{ competence.name }}
          </h3>
          <div class="competence-ages-container">
            <span
              v-for="item in competence.ageCategories"
              :key="item.id"
              class="competence-age"
            >
              {{ ageGroups.find(group => group.value === item.ageCategory)?.label }}
            </span>
          </div>
          <div class="competence-description">
            {{
              competence.description.length > 30
                ? competence.description.substring(0, 30) + "..."
                : competence.description
            }}
          </div>
        </div>
      </div>

      <div class="competence-stats">
        <div class="stat-item">
          <div class="stat-number">
            {{ competence.participantsCount }}
          </div>
          <div class="stat-label">
            Участников
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-number">
            -
          </div>
          <div class="stat-label">
            Событий
          </div>
        </div>
      </div>

      <!-- Отображение мест по возрастным категориям -->
      <div class="age-places-section">
        <div class="age-places-title">
          Места по возрастам:
        </div>
        <div class="age-places-list">
          <div
            v-for="ageCategory in competence.ageCategories"
            :key="ageCategory.id"
            class="age-place-item"
          >
            <span class="age-label">
              {{ ageGroups.find(group => group.value === ageCategory.ageCategory)?.label }}
            </span>
            <span class="places-count">
              {{
                ageCategory.maxParticipantsCount === null || ageCategory.maxParticipantsCount === 0
                  ? 'не ограничено'
                  : ageCategory.maxParticipantsCount + ' мест'
              }}
            </span>
            <Button
              v-if="userStore.user?.role === Roles.ADMIN || userStore.user?.role === Roles.TUTOR"
              v-tooltip.left="!ageCategory.isDisabled ? 'Закрыть для записи' : 'Открыть для записи'"
              :icon="!ageCategory.isDisabled ? 'pi pi-ban' : 'pi pi-check'"
              class="p-button-sm"
              :severity="!ageCategory.isDisabled ? 'danger' : 'success'"
              @click="toggleAgeCategory(competence.id, ageCategory)"
            />
          </div>
        </div>
      </div>

      <div class="competence-actions">
        <Button
          label="Участники"
          icon="pi pi-users"
          class="p-button-outlined"
          @click="router().push(`/${userStore.user?.role.toLowerCase()}/participants/${competence.id}`)"
        />
        <Button
          v-if="userStore.user?.role === Roles.ADMIN"
          label="Места"
          icon="pi pi-users"
          class="p-button-outlined"
          @click="$emit('manage-places', competence)"
        />
        <Button
          label="Документы"
          icon="pi pi-file-text"
          class="p-button-outlined"
          @click="goToDocuments(competence.id)"
        />
        <!--          <Button -->
        <!--            label="События" -->
        <!--            icon="pi pi-calendar"-->
        <!--            class="p-button-outlined"-->
        <!--            @click="goToEvents(competence.id)"-->
        <!--          />-->
        <Button
          label="Подробнее"
          icon="pi pi-eye"
          class="p-button-primary"
          @click="$emit('open-competence', competence.id)"
        />
        <div v-if="showEditButtons">
          <Button
            v-tooltip="'Редактировать'"
            icon="pi pi-pencil"
            class="p-button-text p-button-sm"
            @click="$emit('edit-competence', competence)"
          />
          <Button
            v-tooltip="'Удалить'"
            icon="pi pi-trash"
            class="p-button-text p-button-sm p-button-danger"
            @click="$emit('delete-competence', competence)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>


  .competencies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
    width: 100%;
  }

  .competence-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    overflow: hidden;
    transition:
      box-shadow 0.3s ease,
      border-color 0.3s ease,
      transform 0.3s ease;
  }

  .competence-card:hover {
    box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
    border: 2px solid #ff9800;
    transform: translateY(-2px);
  }

  .competence-header {
    background: linear-gradient(135deg, #ff9800, #f57c00);
    color: white;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .competence-info {
    flex: 1;
  }

  .competence-name {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .competence-age {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    display: inline-block;
    margin-bottom: 0.5rem;
  }

  .places-count {
    color: #ff9800;
    font-weight: 600;
    margin-left: 0.25rem;
  }

  .competence-description {
    font-size: 0.9rem;
    opacity: 0.9;
    line-height: 1.4;
  }

  .competence-stats {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.5rem;
    background: #f8f9fa;
  }

  .stat-item {
    flex: 1;
    text-align: center;
    min-width: 0;
  }

  .stat-number {
    color: #ff9800;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    color: #6c757d;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .competence-actions {
    display: flex;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    flex-wrap: wrap;
  }

  /* Стили для отображения мест по возрастным категориям */
  .age-places-section {
    margin: 1rem 0;
    padding: 0.75rem;
    background: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e9ecef;
  }

  .age-places-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .age-places-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .age-place-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0;
    font-size: 0.8rem;
  }

  .age-label {
    font-weight: 600;
    color: #2c3e50;
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }

  @media (max-width: 768px) {

    .competencies-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }


    .competence-header {
      flex-direction: column;
      gap: 1rem;
    }

    .competence-stats {
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem;
    }

    .competence-actions {
      flex-direction: column;
      gap: 0.5rem;
    }

    .stat-item {
      flex: 1 1 calc(50% - 0.125rem);
      min-width: 0;
    }
  }

  /* Промежуточные экраны */
  @media (max-width: 500px) {

    .stat-item {
      flex: none;
      width: 100%;
    }
  }

  @media (max-width: 480px) {


    .competence-header {
      padding: 1rem;
    }

    .competence-name {
      font-size: 1.1rem;
    }

    .competence-stats {
      flex-direction: column;
      gap: 0.5rem;
    }

    .competence-actions {
      padding: 0.75rem 1rem;
    }
  }



</style>