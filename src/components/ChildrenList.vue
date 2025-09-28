<script lang="ts">
  import type { PropType } from 'vue';
  import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';

  // Расширяем тип ChildOutputDto для добавления локального свойства
  interface ChildWithMentorSelection extends ChildOutputDto {
    selectedMentor?: string | number | null;
  }
  import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
  import Button from 'primevue/button';
  import Dialog from 'primevue/dialog';
  import Dropdown from 'primevue/dropdown';
  import { AgeCategories } from '@/api/resolvers/competence/competence.resolver.ts';
  import { ChildResolver } from '@/api/resolvers/child/child.resolver.ts';
  import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
  import { useUserStore } from '@/stores/userStore.ts';
  import { useGradeOptions } from '../shared/UseGradeOptions.ts';
  import ToastPopup from './ToastPopup.vue';

  export default {
    name: 'ChildrenList',
    components: {
      Button,
      Dialog,
      Dropdown,
      ToastPopup
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
        userResolver: new UserResolver(),
        userStore: useUserStore(),
        ageGroups: useAgeGroups,
        gradeOptions: useGradeOptions,
        availableMentor: null as { id: number; name: string } | null,
        mentorOptions: [] as Array<{label: string; value: string | number}>,
        toastContent: {
          title: '',
          message: ''
        },
      }
    },
    computed: {
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
    mounted() {
      this.loadAvailableMentor();
    },
    methods: {
      calculateGrade(child: ChildOutputDto) {
        return this.gradeOptions.find(grade => grade.value === child.childDocuments?.learningClass)?.label || '-'
      },
      formatDateOfBirth(birthDate: string) {
        const parts = birthDate.split("-");
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
      },
      formatSnils(snils: string | undefined | null) {
        if (!snils) return '-';
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
      getAgeGroupByAge(age: number, learningClass: number | undefined | null) {
        if (age === 7) {
          const group = this.ageGroups
            .find(group => (learningClass ?? 0) > 0
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
      },
      async loadAvailableMentor() {
        // Проверяем localStorage на наличие ID наставника
        const selectedMentorId = localStorage.getItem('selectedMentorId');
        console.log('Loading available mentor from localStorage ID:', selectedMentorId);
        
        // Создаем список опций наставников
        const parentName = this.userStore.user ? `${this.userStore.user.lastName} ${this.userStore.user.firstName} ${this.userStore.user.patronymic}` : 'Родитель';
        this.mentorOptions = [
          {
            label: `Родитель является наставником (${parentName})`,
            value: 'parent'
          }
        ];
        
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
                
                // Добавляем внешнего наставника в список опций
                this.mentorOptions.push({
                  label: mentorName,
                  value: mentorId
                });
                
                console.log('Set availableMentor:', this.availableMentor);
                console.log('Mentor options:', this.mentorOptions);
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
        
        this.mentorOptions.push({
          label: fallbackName,
          value: mentorId
        });
        
        console.log('Set fallback mentor:', this.availableMentor);
      },
      
      // Временный метод для тестирования API
      async testMentorAPI(mentorId: number = 201) {
        try {
          console.log(`Testing API for mentor ID: ${mentorId}`);
          const response = await this.userResolver.getById(mentorId);
          console.log('API Test Response:', response);
          console.log('Response status:', response.status);
          console.log('Response message:', response.message);
          console.log('Response data type:', typeof response.message);
          return response;
        } catch (error) {
          console.error('API Test Error:', error);
          return null;
        }
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
            
            // Очищаем localStorage если был выбран внешний наставник
            if (child.selectedMentor !== 'parent') {
              localStorage.removeItem('selectedMentorId');
              this.availableMentor = null;
              const parentName = this.userStore.user ? `${this.userStore.user.lastName} ${this.userStore.user.firstName} ${this.userStore.user.patronymic}` : 'Родитель';
              this.mentorOptions = [
                {
                  label: `Родитель является наставником (${parentName})`,
                  value: 'parent'
                }
              ];
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
            this.toastContent = {
              title: 'Успешно!',
              message: `Наставник "${mentorName}" назначен для ${child.firstName}`
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