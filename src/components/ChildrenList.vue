<script lang="ts">
  import type { PropType } from 'vue';
  import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';
  import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
  import Button from 'primevue/button';
  import Dialog from 'primevue/dialog';
  import { AgeCategories } from '@/api/resolvers/competence/competence.resolver.ts';
  import { ChildResolver } from '@/api/resolvers/child/child.resolver.ts';
  import { useGradeOptions } from '../shared/UseGradeOptions.ts';

  export default {
    name: 'ChildrenList',
    components: {
      Button,
      Dialog
    },
    props: {
      children: {
        type: Array as PropType<ChildOutputDto[]>,
        required: true,
      }
    },
    emits: [
      'update:children-list',
      'open:child-form'
    ],
    data() {
      return {
        childResolver: new ChildResolver(),
        ageGroups: useAgeGroups,
        gradeOptions: useGradeOptions,
      }
    },
    computed: {
      sortedChildren() {
        const children = this.children
        return children.sort((a, b) => a.id - b.id)
      }
    },
    methods: {
      calculateGrade(child: ChildOutputDto) {
        return this.gradeOptions.find(grade => grade.value === child.childDocuments?.learningClass)?.label
      },
      formatDateOfBirth(birthDate: string) {
        const parts = birthDate.split("-");
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
      },
      formatSnils(snils: string) {
        return `${snils.substring(0, 3)}-${snils.substring(3, 6)}-${snils.substring(6, 9)} ${snils.substring(9, 11)}`;
      },
      calculateAge(birthDate: string) {
        const birth = new Date(birthDate.substring(0, 10));
        const onDate = new Date(2026, 1, 14)

        let age = onDate.getFullYear() - birth.getFullYear();
        let monthDiff = onDate.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && onDate.getDate() < birth.getDate())) {
          age--;
        }
        return age;
      },
      getAgeGroupByAge(age: number, learningClass: number) {
        if (age === 7) {
          const group = this.ageGroups
            .find(group => learningClass > 0
              ? group.value === AgeCategories.EARLY_SCHOOL
              : group.value === AgeCategories.PRESCHOOL
            )
          return group
            ? group.label
            : "-"
        }
        const group = this.ageGroups.find(group => {
          const edges = group.label.split(" ")[0].split("-")
          const min = parseInt(edges[0]);
          const max = parseInt(edges[1]);
          if (min <= age && age <= max) {
            return group.label
          }
        })
        return group ? group.label : "-"
      },
      async removeChild(child: ChildOutputDto) {
        if (confirm(`Удалить ребёнка "${child.firstName}"`)) {
          const response = await this.childResolver.deleteById(child.id)
          if (response.status === 200) this.$emit('update:children-list');
        }
      }
    }
  };
</script>

<template>
  <div
    v-if="children.length > 0"
    class="children-grid-header"
  >
    <h1 class="children-grid-title">
      Дети
    </h1>
  </div>

  <div
    v-if="children.length > 0"
    class="children-grid"
  >
    <div
      v-for="child in sortedChildren"
      :key="child.id"
      class="child-card"
    >
      <div class="child-header">
        <div class="child-icon">
          <i class="pi pi-user" />
        </div>
        <div class="child-info">
          <h3 class="child-name">
            {{ `${child.lastName} ${child.firstName} ${child.patronymic}` }}
          </h3>
        </div>
        <div class="child-actions">
          <Button
            v-tooltip="'Редактировать'"
            icon="pi pi-pencil"
            style="background: white;"
            class="p-button-text p-button-sm"
            @click="$emit('open:child-form', child)"
          />
          <Button
            v-tooltip="'Удалить'"
            icon="pi pi-trash"
            style="background: white"
            class="p-button-text p-button-sm p-button-danger"
            @click="removeChild(child)"
          />
        </div>
      </div>

      <div class="child-content">
        <div class="child-details">
          <div class="detail-item">
            <span class="detail-label">Дата рождения:</span>
            <span class="detail-value">{{ formatDateOfBirth(child.dateOfBirth) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">СНИЛС:</span>
            <span class="detail-value">{{ formatSnils(child.childDocuments?.snilsNumber) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Класс обучения:</span>
            <span class="detail-value">
              {{ calculateGrade(child) }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Возрастная группа:</span>
            <span class="detail-value">
              {{ getAgeGroupByAge(calculateAge(child.dateOfBirth), child.childDocuments?.learningClass) }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Образовательное учреждение:</span>
            <span class="detail-value">
              {{ child.childDocuments?.studyingPlace }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Площадка подготовки:</span>
            <span class="detail-value">
              {{ child.childDocuments?.trainingGround }}
            </span>
          </div>
        </div>

        <div
          v-if="child.mentor !== null"
          class="mentor-info"
        >
          <h4 class="mentor-title">
            Наставник:
          </h4>
          <p class="mentor-name">
            {{ `${child.mentor.lastName} ${child.mentor.firstName} ${child.mentor.patronymic}` }}
          </p>
        </div>
      </div>
    </div>

    <Dialog>
      <!--      <p class="preview-text">-->
      <!--        Выбрано компетенций: {{ selectedCompetenciesCount }}/3-->
      <!--      </p>-->

      <!--      <div class="selected-competencies">-->
      <!--        <div-->
      <!--          v-for="competence in selectedCompetencies"-->
      <!--          :key="competence.id"-->
      <!--          class="competence-item"-->
      <!--        >-->
      <!--          <div class="competence-icon">-->
      <!--            <i :class="competence.icon" />-->
      <!--          </div>-->
      <!--          <div class="competence-info">-->
      <!--            <h4 class="competence-name">-->
      <!--              {{ competence.name }}-->
      <!--            </h4>-->
      <!--            <p class="competence-status">-->
      <!--              {{ competence.status }}-->
      <!--            </p>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </div>-->
    </Dialog>
  </div>
</template>

<style scoped>
  .children-grid-header {
    margin: 2rem 0 1rem 0;
  }

  .children-grid-title {
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 500;
    font-family: "BIPS", sans-serif;
  }

  .children-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
    width: 100%;
    margin-bottom: 4rem;
  }

  .child-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    overflow: hidden;
    transition:
      box-shadow 0.3s ease,
      border-color 0.3s ease;
  }

  .child-card:hover {
    box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
    border: 2px solid #ff9800;
  }

  .child-header {
    background: linear-gradient(135deg, #ff9800, #f57c00);
    color: white;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .child-icon {
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

  .child-info {
    flex: 1;
  }

  .child-name {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .child-actions {
    display: flex;
    gap: 0.5rem;
  }

  .child-content {
    padding: 1.5rem;
  }

  .child-details {
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
</style>