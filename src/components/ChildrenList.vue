<script lang="ts">
  import { type PropType } from 'vue';
  import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';

  // Расширяем тип ChildOutputDto для добавления локального свойства
  export interface ChildWithMentorSelection extends ChildOutputDto {
    selectedMentor?: string | number | null;
  }
  import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import { ChildResolver } from '@/api/resolvers/child/child.resolver.ts';
  import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
  import { useUserStore } from '@/stores/userStore.ts';
  import { useGradeOptions } from '../shared/UseGradeOptions.ts';
  import ToastPopup from './ToastPopup.vue';
  import { FormatManager } from '../utils/FormatManager.ts';
  import { ChildCompetenciesResolver } from '@/api/resolvers/childCompetencies/child-competencies.resolver.ts';
  import type {
    ChildCompetenciesOutputDto
  } from '@/api/resolvers/childCompetencies/dto/output/child-competencies-output.dto.ts';
  import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
  import { CompetenceResolver } from '@/api/resolvers/competence/competence.resolver.ts';
  import CompetenceDialog from '@/views/shared/CompetenceDialog.vue';

  export default {
    name: 'ChildrenList',
    components: {
      CompetenceDialog,
      Button,
      Dropdown,
      ToastPopup
    },
    props: {
      children: {
        type: Array as PropType<ChildOutputDto[]>,
        required: true,
      },
      selectedMentorId: {
        type: Number as PropType<number | null | string>,
        default: null
      }
    },
    emits: [
      'update:children-list',
      'open:child-form',
      'open:mentor-dropdown'
    ],
    data() {
      return {
        childCompetenciesResolver: new ChildCompetenciesResolver(),
        competenceResolver: new CompetenceResolver(),
        childResolver: new ChildResolver(),
        userResolver: new UserResolver(),

        userStore: useUserStore(),
        ageGroups: useAgeGroups,
        gradeOptions: useGradeOptions,

        availableMentor: null as { id: number; name: string } | null,
        mentorOptions: [] as Array<{label: string; value: string | number}>,
        mentorAssignments: new Map<number, number>(), // mentorId -> количество назначений
        toastContent: {
          title: '',
          message: ''
        },
        showDetailsDialog: false,

        selectedCompetence: null as CompetenceOutputDto | null,
        childCompetencies: [] as {
          child: ChildOutputDto,
          competencies: ChildCompetenciesOutputDto[]
        }[]
      }
    },
    computed: {
      FormatManager() {
        return FormatManager
      },
      sortedChildren(): ChildWithMentorSelection[] {
        const children = this.children.map(child => ({
          ...child,
          selectedMentor: (child as ChildWithMentorSelection).selectedMentor || null
        }));
        return children.sort((a, b) => a.id - b.id)
      },
      hasAvailableMentors() {
        return this.mentorOptions.length > 0;
      }
    },
    watch: {
      selectedMentorId() {
        if (this.selectedMentorId !== null) {
          this.loadAvailableMentor()
        }
      }
    },
    mounted() {
      this.loadAvailableMentor();
      this.children.forEach(child => {
        this.loadCompetenciesByChild(child)
      })
    },
    methods: {
      getCompetenciesByChildId(childId: number) {
        const competencies = this.childCompetencies.find(row => row.child.id === childId)?.competencies
        return competencies ? competencies : []
      },
      async loadCompetenciesByChild(child: ChildOutputDto) {
        const response = await this.childCompetenciesResolver.getByChildId(child.id)
        if (typeof response.message === "string" || response.status !== 200) return
        this.childCompetencies.push({
          child: child,
          competencies: response.message
        })
      },
      async openCompetenceDialog(competenceId: number) {
        if (this.selectedCompetence === null || this.selectedCompetence.id !== competenceId) {
          const response = await this.competenceResolver.getById(competenceId)
          if (typeof response.message === "string" || response.status !== 200) return
          this.selectedCompetence = response.message
        }
        this.showDetailsDialog = true
      },
      async removeChild(child: ChildOutputDto) {
        if (confirm(`Удалить ребёнка "${child.firstName}"`)) {
          const response = await this.childResolver.deleteById(child.id)
          if (response.status === 200) this.$emit('update:children-list');
        }
      },
      async loadAvailableMentor() {
        // Проверяем localStorage на наличие ID наставника
        const strMentorIds = localStorage.getItem('selectedMentorId');
        const mentorIds = strMentorIds ? JSON.parse(strMentorIds) as number[] : [];
        console.log('Loading available mentor from localStorage ID:', mentorIds);
        
        // Полностью очищаем и пересоздаем список опций наставников
        this.mentorOptions = [];
        const parentName = this.userStore.user ? `${this.userStore.user.lastName} ${this.userStore.user.firstName} ${this.userStore.user.patronymic}` : 'Родитель';
        this.mentorOptions = [
          {
            label: `Родитель является наставником (${parentName})`,
            value: 'parent'
          }
        ];
        
        console.log('Initial mentorOptions:', this.mentorOptions);
        
        if (mentorIds.length > 0) {
          for (const mentorId of mentorIds) {
            try {
              console.log('Loading mentor data from API for ID:', mentorId);

              // Загружаем данные наставника из API
              const response = await this.userResolver.getById(mentorId);
              console.log('API Response for mentor:', response);

              if (response.status === 200) {
                const mentorData = response.message;
                if (mentorData && typeof mentorData !== 'string') {
                  const mentor = mentorData;
                  const mentorName = `${mentor.lastName} ${mentor.firstName} ${mentor.patronymic}`;

                  this.availableMentor = {
                    id: mentorId,
                    name: mentorName
                  };

                  // Добавляем внешнего наставника в список опций (проверяем на дублирование)
                  const existingMentor = this.mentorOptions.find(option => option.value === mentorId);
                  if (!existingMentor) {
                    this.mentorOptions.push({
                      label: mentorName,
                      value: mentorId
                    });
                    console.log('Added mentor to options:', mentorName);
                  } else {
                    console.log('Mentor already exists in options:', existingMentor);
                  }

                  console.log('Set availableMentor:', this.availableMentor);
                  console.log('Mentor options:', this.mentorOptions);

                  // Инициализируем счетчик назначений для наставника (если еще не установлен)
                  if (!this.mentorAssignments.has(mentorId)) {
                    this.mentorAssignments.set(mentorId, 0);
                    console.log('Initialized mentor assignments counter:', mentorId);
                  }
                } else {
                  console.log('API returned invalid data, using fallback');
                  this.setFallbackMentor(mentorId);
                }
              } else {
                console.log('API failed, using fallback');
                this.setFallbackMentor(mentorId);
              }
            } catch (error) {
              console.error('Error loading mentor from API:', error);
              this.setFallbackMentor(mentorId);
            }
          }
        } else {
          console.log('No mentor ID found in localStorage');
        }
      },
      
      setFallbackMentor(mentorId: number) {
        const fallbackName = `Наставник #${mentorId}`;
        this.availableMentor = {
          id: mentorId,
          name: fallbackName
        };
        
        // Проверяем на дублирование перед добавлением
        const existingMentor = this.mentorOptions.find(option => option.value === mentorId);
        if (!existingMentor) {
          this.mentorOptions.push({
            label: fallbackName,
            value: mentorId
          });
          console.log('Added fallback mentor to options:', fallbackName);
        } else {
          console.log('Fallback mentor already exists in options:', existingMentor);
        }
        
        console.log('Set fallback mentor:', this.availableMentor);
        
        // Инициализируем счетчик назначений для fallback наставника
        if (!this.mentorAssignments.has(mentorId)) {
          this.mentorAssignments.set(mentorId, 0);
          console.log('Initialized fallback mentor assignments counter:', mentorId);
        }
      },
      
      removeMentorFromList(mentorId: number) {
        // Удаляем наставника из списка опций
        this.mentorOptions = this.mentorOptions.filter(option => option.value !== mentorId);
        console.log('Removed mentor from options list:', mentorId);
      },
      onMentorChange(child: ChildWithMentorSelection) {
        console.log('Mentor selection changed for child:', child.firstName, 'Selected:', child.selectedMentor);
        console.log('Child object after change:', child);
        // Принудительно обновляем компонент при изменении
        this.$nextTick(() => {
          this.$forceUpdate();
        });
      },
      
      async saveMentorSelection(child: ChildWithMentorSelection) {
        if (!child.selectedMentor) {
          this.toastContent = {
            title: 'Внимание!',
            message: 'Пожалуйста, выберите наставника'
          };
          return;
        }
        
        try {
          let mentorId = null;
          let mentorName = '';
          
          if (child.selectedMentor === 'parent') {
            // Отправляем ID текущего авторизованного родителя
            mentorId = this.userStore.user?.id ?? null;
            mentorName = this.userStore.user ? `${this.userStore.user.lastName} ${this.userStore.user.firstName} ${this.userStore.user.patronymic}` : 'Родитель';
            console.log('Parent selected as mentor:', {
              mentorId,
              mentorName,
              userStoreUser: this.userStore.user
            });
            
            // Проверяем, что mentorId не undefined
            if (mentorId === undefined) {
              console.error('User ID is undefined! UserStore user:', this.userStore.user);
              throw new Error('ID пользователя не найден');
            }
          } else {
            mentorId = typeof child.selectedMentor === 'number' ? child.selectedMentor : parseInt(child.selectedMentor as string);
            // Находим имя наставника в списке опций
            const selectedOption = this.mentorOptions.find(option => option.value === child.selectedMentor);
            mentorName = selectedOption?.label || 'Наставник';
          }
          
          // Обновляем ребенка с выбранным наставником
          console.log('Sending to API:', {
            id: child.id,
            lastName: child.lastName,
            firstName: child.firstName,
            patronymic: child.patronymic,
            dateOfBirth: child.dateOfBirth,
            mentorId: mentorId
          });
          console.log('MentorId type:', typeof mentorId, 'Value:', mentorId);
          console.log('Child data types:', {
            id: typeof child.id,
            lastName: typeof child.lastName,
            firstName: typeof child.firstName,
            patronymic: typeof child.patronymic,
            dateOfBirth: typeof child.dateOfBirth
          });
          
          // Проверяем типы данных перед отправкой
          const updateData = {
            id: child.id,
            lastName: child.lastName,
            firstName: child.firstName,
            patronymic: child.patronymic,
            dateOfBirth: child.dateOfBirth,
            mentorId: mentorId
          };
          
          console.log('Final update data:', updateData);
          console.log('All data types valid:', {
            id: typeof updateData.id === 'number',
            lastName: typeof updateData.lastName === 'string' || updateData.lastName === null,
            firstName: typeof updateData.firstName === 'string' || updateData.firstName === null,
            patronymic: typeof updateData.patronymic === 'string' || updateData.patronymic === null,
            dateOfBirth: typeof updateData.dateOfBirth === 'string' || updateData.dateOfBirth === null,
            mentorId: typeof updateData.mentorId === 'number' || updateData.mentorId === null
          });
          
          const updateResponse = await this.childResolver.update(updateData);
          
          console.log('API Update Response:', updateResponse);
          
          // Проверяем успешность обновления
          if (updateResponse.status === 200) {
            console.log('Update successful, clearing form...');
            
            // Обновляем счетчик назначений наставника
            if (mentorId !== this.userStore.user?.id && typeof mentorId === 'number') {
              const currentAssignments = this.mentorAssignments.get(mentorId) || 0;
              this.mentorAssignments.set(mentorId, currentAssignments + 1);
              console.log(`Mentor ${mentorId} assignments: ${currentAssignments + 1}/3`);
              
              // Проверяем, достигнут ли лимит (3 ребенка)
              if (currentAssignments + 1 >= 3) {
                console.log('Mentor reached maximum assignments (3), removing from list');
                this.removeMentorFromList(mentorId);
                localStorage.removeItem('selectedMentorId');
                this.availableMentor = null;
              }
            }
            
            // Сбрасываем выбор
            child.selectedMentor = null;
            console.log('Cleared selectedMentor for child:', child.firstName);
            
            // Обновляем список детей
            this.$emit('update:children-list');
            
            // Принудительно обновляем компонент после обновления данных
            this.$nextTick(() => {
              this.$forceUpdate();
              console.log('Force update completed');
            });
            
            // Показываем уведомление об успехе через toast
            let message = `Наставник "${mentorName}" назначен для ${child.firstName}`;
            if (mentorId !== this.userStore.user?.id && typeof mentorId === 'number') {
              const assignments = this.mentorAssignments.get(mentorId) || 0;
              message += ` (${assignments}/3 назначений)`;
            }
            
            this.toastContent = {
              title: 'Успешно!',
              message: message
            };
          } else {
            console.error('Update failed with status:', updateResponse.status);
            throw new Error(`API update failed with status ${updateResponse.status}`);
          }
        } catch (error) {
          console.error('Ошибка при сохранении наставника:', error);
          this.toastContent = {
            title: 'Ошибка!',
            message: 'Не удалось сохранить наставника'
          };
        }
      }
    }
  };
</script>

<template>
  <!-- Toast уведомления -->
  <ToastPopup :content="toastContent" />
  
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
    class="dashboard-grid"
  >
    <div
      v-for="child in sortedChildren"
      :key="child.id"
      class="info-card"
    >
      <div class="card-header">
        <h3 class="card-title">
          <i class="pi pi-user" />
          {{ `${child.lastName} ${child.firstName} ${child.patronymic}` }}
        </h3>
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

      <div
        v-if="child.childDocuments !== null"
        class="card-content"
      >
        <div class="data-section">
          <div class="data-item">
            <span class="data-label">Дата рождения:</span>
            <span class="data-value">{{ FormatManager.formatBirthDateFromDTO(child.dateOfBirth) }}</span>
          </div>
          <div class="data-item">
            <span class="data-label">СНИЛС:</span>
            <span class="data-value">{{ FormatManager.formatSnilsFromDTO(child.childDocuments?.snilsNumber) }}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Класс обучения:</span>
            <span class="data-value">
              {{ FormatManager.calculateGrade(child) }}
            </span>
          </div>
          <div class="data-item">
            <span class="data-label">Возрастная группа:</span>
            <span class="data-value">{{
              FormatManager.getAgeGroupByAge(
                FormatManager.calculateAge(child.dateOfBirth),
                child.childDocuments?.learningClass
              )?.label
            }}</span>
          </div>
          <div class="data-item">
            <span class="data-label">Образовательное учреждение:</span>
            <span class="data-value">
              {{ child.childDocuments?.studyingPlace || '-' }}
            </span>
          </div>
          <div class="data-item">
            <span class="data-label">Площадка подготовки:</span>
            <span class="data-value">
              {{ child.childDocuments?.trainingGround || '-' }}
            </span>
          </div>
        </div>

        <div
          v-if="getCompetenciesByChildId(child.id).length > 0"
          class="competencies-section"
        >
          <h4 class="competencies-title">
            Компетенции:
          </h4>
          <div class="competencies-list">
            <span
              v-for="competence in getCompetenciesByChildId(child.id)"
              :key="competence.id"
              class="competence-tag"
              @click="openCompetenceDialog(competence.direction.id)"
            >
              {{ competence.direction.name }}
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
          <div class="mentor-actions">
            <p class="mentor-name">
              {{ `${child.mentor.lastName} ${child.mentor.firstName} ${child.mentor.patronymic}` }}
            </p>
            <Button
              class="p-button-text p-button-sm"
              icon="pi pi-pencil"
              @click="$emit('open:mentor-dropdown', child)"
            />
          </div>
        </div>
        
        <div
          v-else
          class="mentor-selection"
        >
          <h4 class="mentor-title">
            Выберите наставника:
          </h4>
          <div class="mentor-actions">
            <div class="mentor-selector">
              <Dropdown
                v-model="child.selectedMentor"
                :options="mentorOptions"
                option-label="label"
                option-value="value"
                placeholder="Выберите наставника"
                class="mentor-dropdown"
                @change="onMentorChange(child)"
              />
              <Button
                :disabled="!child.selectedMentor"
                label="Сохранить"
                icon="pi pi-check"
                class="p-button-success p-button-sm"
                @click="saveMentorSelection(child)"
              />
            </div>
            <p
              v-if="!hasAvailableMentors"
              class="no-mentor-text"
            >
              Нет доступных наставников
            </p>
          </div>
        </div>
      </div>
    </div>
    <CompetenceDialog
      v-if="selectedCompetence !== null"
      :selected-competence-prop="selectedCompetence"
      :show-details-dialog-prop="showDetailsDialog"
      @update:show-details-dialog="(show) => showDetailsDialog = show"
    />
  </div>
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

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .info-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    overflow: hidden;
    transition:
      box-shadow 0.3s ease,
      border-color 0.3s ease;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .info-card:hover {
    box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
    border: 2px solid #ff9800;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    background: linear-gradient(135deg, #ff9800, #f57c00);
    color: white;
    padding: 1.5rem;
  }

  .card-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
  }

  .card-title i {
    margin-right: 0.75rem;
    font-size: 1.1rem;
  }

  .card-content {
    padding: 1.5rem;
  }

  .data-section {
    margin-bottom: 1rem;
  }

  .data-section:last-child {
    margin-bottom: 0;
  }

  .mentor-title {
    margin: 1rem 0;
  }

  .mentor-actions {
    display: flex;
    gap: 1rem
  }

  .child-actions {
    display: flex;
    gap: 1rem;
  }

  .data-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f1f3f4;
  }

  .data-item:last-child {
    border-bottom: none;
  }

  .data-label {
    color: #6c757d;
    font-weight: 500;
    min-width: 120px;
  }

  .data-value {
    color: #2c3e50;
    font-weight: 500;
    text-align: right;
  }

  /* Мобильные стили */
  @media (max-width: 768px) {

    .dashboard-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
      width: 100%;
      max-width: 100%;
      padding: 0;
      margin: 0;
    }

    .info-card {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0;
    }

    .card-header {
      padding: 1rem;
    }

    .card-content {
      padding: 1rem;
    }

    .data-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .data-value {
      text-align: left;
    }
  }

  /* Очень маленькие экраны */
  @media (max-width: 480px) {

    .dashboard-grid {
      gap: 0.75rem;
      width: 100%;
      max-width: 100%;
      padding: 0;
      margin: 0;
    }

    .info-card {
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box;
      margin: 0;
    }

    .card-header {
      padding: 0.75rem;
    }

    .card-title {
      font-size: 1rem;
    }

    .card-content {
      padding: 0.75rem;
    }

    .data-item {
      padding: 0.5rem 0;
    }

    .data-label {
      font-size: 0.85rem;
    }

    .data-value {
      font-size: 0.9rem;
    }
  }
</style>