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
        type: Number as PropType<number | null>,
        default: null
      }
    },
    emits: [
      'update:children-list',
      'open:child-form'
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
        const selectedMentorId = localStorage.getItem('selectedMentorId');
        console.log('Loading available mentor from localStorage ID:', selectedMentorId);
        
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
        
        if (selectedMentorId) {
          try {
            const mentorId = parseInt(selectedMentorId);
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
            const mentorId = parseInt(selectedMentorId);
            this.setFallbackMentor(mentorId);
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

      <div
        v-if="child.childDocuments !== null"
        class="child-content"
      >
        <div class="child-details">
          <div class="detail-item">
            <span class="detail-label">Дата рождения:</span>
            <span class="detail-value">{{ FormatManager.formatBirthDateFromDTO(child.dateOfBirth) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">СНИЛС:</span>
            <span class="detail-value">{{ FormatManager.formatSnilsFromDTO(child.childDocuments?.snilsNumber) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Класс обучения:</span>
            <span class="detail-value">
              {{ FormatManager.calculateGrade(child) }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Возрастная группа:</span>
            <span class="detail-value">{{
              FormatManager.getAgeGroupByAge(
                FormatManager.calculateAge(child.dateOfBirth),
                child.childDocuments?.learningClass
              )?.label
            }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Образовательное учреждение:</span>
            <span class="detail-value">
              {{ child.childDocuments?.studyingPlace || '-' }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Площадка подготовки:</span>
            <span class="detail-value">
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
          <p class="mentor-name">
            {{ `${child.mentor.lastName} ${child.mentor.firstName} ${child.mentor.patronymic}` }}
          </p>
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

  .competencies-section {
    margin-bottom: 1.5rem;
  }

  .competencies-title, .mentor-title {
    color: #2c3e50;
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    font-weight: 600;
    border-bottom: 2px solid #ff9800;
    padding-bottom: 0.25rem;
  }

  .competencies-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .competence-tag {
    background: #f8f9fa;
    color: #2c3e50;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    border: 1px solid #e9ecef;
  }

  .competence-tag:hover {
    cursor: pointer;
  }

  .mentor-selection {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 3px solid #ff9800;
  }

  .mentor-title {
    color: #2c3e50;
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .mentor-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .mentor-selector {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .mentor-dropdown {
    flex: 1;
    min-width: 200px;
  }

  .no-mentor-text {
    color: #6c757d;
    margin: 0;
    font-style: italic;
  }

  /* Мобильные стили */
  @media (max-width: 768px) {
    .mentor-selector {
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
    }

    .mentor-dropdown {
      min-width: auto;
    }
  }
</style>