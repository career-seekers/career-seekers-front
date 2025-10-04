<template>
  <div class="mentors-page">
    <div class="page-header">
      <h1 class="page-title">
        Родители
      </h1>
      <p class="page-subtitle">
        Управление родителями
      </p>
    </div>

    <div class="filters-section">
      <div class="search-group">
        <InputText
          v-model="searchQuery"
          placeholder="Поиск по ФИО родителя, номеру телефона или электронной почте..."
          class="search-input"
        />
        <i class="pi pi-search search-icon" />
      </div>
    </div>

    <!-- Список экспертов -->
    <div class="experts-grid">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="expert-card"
      >
        <div class="expert-header">
          <div class="expert-avatar">
            <i class="pi pi-user" />
          </div>
          <div class="expert-info">
            <h3 class="expert-name">
              {{
                user.lastName +
                  " " +
                  user.firstName +
                  " " +
                  user.patronymic
              }}
            </h3>
          </div>
          <div class="expert-actions">
            <Button
              v-tooltip="'Редактировать'"
              icon="pi pi-pencil"
              class="p-button-text p-button-sm"
              style="background: white"
              @click="editUser(user)"
            />
            <Button
              v-tooltip="'Удалить'"
              icon="pi pi-trash"
              class="p-button-text p-button-sm p-button-danger"
              style="background: white"
              @click="deleteUser(user)"
            />
          </div>
        </div>

        <div class="expert-content">
          <div class="expert-details">
            <div class="detail-item">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ user.email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Телефон:</span>
              <span class="detail-value">{{
                FormatManager.formatMobileNumberFromDTO(user.mobileNumber)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Количество детей:</span>
              <span class="detail-value">{{ user.children.length }}</span>
            </div>
          </div>
          <div
            class="actions"
          >
            <h3 class="expert-name">
              Дети
            </h3>
            <div
              v-for="child in user.children"
              :key="child.id"
              class="detail-item"
            >
              <Button
                :label="`${child.lastName} ${child.firstName} ${child.patronymic}`"
                class="p-button-outlined detail-label"
                @click="showChildDocs(child)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <Dialog
      v-model:visible="showEditUserDialog"
      header="Редактировать родителя"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <h3 class="step-title">
        Данные родителя
      </h3>

      <div class="field">
        <label
          for="fullName"
          class="field-label"
        >ФИО *</label>
        <InputText
          id="fullName"
          v-model="userForm.fullName"
          placeholder="Введите ваше полное имя"
          class="w-full"
          :class="{ 'p-invalid': errors.fullName }"
        />
        <small
          v-if="errors.fullName"
          class="p-error"
        >{{
          errors.fullName
        }}</small>
      </div>

      <div class="field">
        <label
          for="birthDate"
          class="field-label"
        >Дата рождения *</label>
        <InputMask
          id="birthDate"
          v-model="userForm.birthDate"
          mask="99.99.9999"
          placeholder="дд.мм.гггг"
          class="w-full"
          :class="{ 'p-invalid': errors.birthDate }"
        />
        <small
          v-if="errors.birthDate"
          class="p-error"
        >{{
          errors.birthDate
        }}</small>
      </div>

      <div class="field">
        <label
          for="phone"
          class="field-label"
        >Контактный телефон *</label>
        <InputMask
          id="phone"
          v-model="userForm.phone"
          mask="+7 (999) 999-99-99"
          placeholder="+7 (___) ___-__-__"
          class="w-full"
          :class="{ 'p-invalid': errors.phone }"
        />
        <small
          v-if="errors.phone"
          class="p-error"
        >{{
          errors.phone
        }}</small>
      </div>

      <div class="field">
        <label
          for="email"
          class="field-label"
        >Адрес электронной почты *</label>
        <InputText
          id="email"
          v-model="userForm.email"
          type="email"
          placeholder="example@email.com"
          class="w-full"
          :class="{ 'p-invalid': errors.email }"
        />
        <small
          v-if="errors.email"
          class="p-error"
        >{{
          errors.email
        }}</small>
      </div>

      <div class="field">
        <div class="flex align-items-center">
          <Checkbox
            v-model="userForm.isMentor"
            input-id="isParentMentor"
            :binary="true"
          />
          <label
            for="isParentMentor"
            class="ml-2 agreement-label"
          >
            Я (родитель) являюсь наставником
          </label>
        </div>
      </div>

      <template #footer>
        <Button
          label="Отмена"
          icon="pi pi-times"
          class="p-button-text"
          @click="cancelEdit"
        />
        <Button
          label="Сохранить"
          icon="pi pi-check"
          class="p-button-primary"
          @click="saveUser"
        />
      </template>
    </Dialog>

    <Dialog
      v-if="selectedChild !== null"
      v-model:visible="showChildDocsDialog"
      header="Данные о ребенке"
      :modal="true"
      :style="{ width: '800px' }"
    >
      <div class="child-card">
        <div class="child-header">
          <div class="child-icon">
            <i class="pi pi-user" />
          </div>
          <div class="child-info">
            <h3 class="child-name">
              {{ `${selectedChild.lastName} ${selectedChild.firstName} ${selectedChild.patronymic}` }}
            </h3>
          </div>
        </div>

        <div
          v-if="selectedChild.childDocuments !== null"
          class="child-content"
        >
          <div class="child-details">
            <div class="detail-item">
              <span class="detail-label">Дата рождения:</span>
              <span class="detail-value">{{ FormatManager.formatBirthDateFromDTO(selectedChild.dateOfBirth) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">СНИЛС:</span>
              <span class="detail-value">{{ FormatManager.formatSnilsFromDTO(selectedChild.childDocuments.snilsNumber) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Класс обучения:</span>
              <span class="detail-value">
                {{ FormatManager.calculateGrade(selectedChild) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Возрастная группа:</span>
              <span class="detail-value">{{
                FormatManager.getAgeGroupLabel(selectedChild.childDocuments.ageCategory)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Образовательное учреждение:</span>
              <span class="detail-value">
                {{ selectedChild.childDocuments?.studyingPlace }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Площадка подготовки:</span>
              <span class="detail-value">
                {{ selectedChild.childDocuments?.trainingGround }}
              </span>
            </div>
          </div>

          <div
            v-if="selectedChild.mentor !== null"
            class="mentor-info"
          >
            <h4 class="mentor-title">
              Наставник:
            </h4>
            <p class="mentor-name">
              {{ `${selectedChild.mentor.lastName} ${selectedChild.mentor.firstName} ${selectedChild.mentor.patronymic}` }}
            </p>
          </div>
        </div>
      </div>
    </Dialog>

    <ToastPopup :content="errors.toastPopup" />
  </div>
</template>

<script lang="ts">
  import ToastPopup from '@/components/ToastPopup.vue';
  import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
  import { Roles } from '@/state/UserState.types.ts';
  import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';
  import Button from 'primevue/button';
  import type { UpdateUserInputDto } from '@/api/resolvers/user/dto/input/update-user-input.dto.ts';
  import InputText from 'primevue/inputtext';
  import InputMask from 'primevue/inputmask';
  import Checkbox from 'primevue/checkbox';
  import Dialog from 'primevue/dialog';
  import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';
  import { FormatManager } from '@/utils/FormatManager.ts';

  export default {
    name: 'AdminUsers',
    components: {
      ToastPopup,
      Button,
      InputText,
      InputMask,
      Checkbox,
      Dialog
    },
    data() {
      return {
        userResolver: new UserResolver(),

        users: [] as UserOutputDto[],
        editingUserId: null as null | number,
        oldMail: null as null | string,

        searchQuery: "",

        userForm: {
          fullName: "",
          birthDate: "",
          phone: "",
          email: "",
          isMentor: false
        },

        errors: {
          toastPopup: {
            title: "",
            message: ""
          },
          fullName: "",
          birthDate: "",
          phone: "",
          email: "",
        },

        selectedChild: null as ChildOutputDto | null,
        showEditUserDialog: false,
        showChildDocsDialog: false,
      }
    },
    computed: {
      FormatManager() {
        return FormatManager
      },
      filteredUsers(): UserOutputDto[] {
        let filtered = this.users
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase()
          filtered = filtered.filter(user => {
            return user.lastName.toLowerCase().includes(query) ||
              user.firstName.toLowerCase().includes(query) ||
              user.patronymic.toLowerCase().includes(query) ||
              user.email.toLowerCase().includes(query) ||
              user.mobileNumber.toLowerCase().includes(query)
          })
        }
        return filtered.sort((a, b) => a.lastName.localeCompare(b.lastName));
      },
    },
    async beforeMount() { await this.loadUsers(); },
    methods: {
      editUser(user: UserOutputDto) {
        this.editingUserId = user.id;
        this.userForm = {
          fullName: `${user.lastName} ${user.firstName} ${user.patronymic}`,
          email: user.email,
          phone: FormatManager.formatMobileNumberFromDTO(user.mobileNumber),
          birthDate: FormatManager.formatBirthDateFromDTO(user.dateOfBirth),
          isMentor: user.isMentor
        };
        this.oldMail = user.email;
        this.showEditUserDialog = true;
      },
      showChildDocs(child: ChildOutputDto) {
        this.selectedChild = child;
        this.showChildDocsDialog = true;
      },
      async saveUser() {
        if (!this.validateForm()) {
          return;
        }

        const user = this.users.find(
          (user: UserOutputDto) => user.id === this.editingUserId,
        );
        if (user) {
          const editedUser: UpdateUserInputDto = {
            firstName: this.userForm.fullName.split(" ")[1],
            lastName: this.userForm.fullName.split(" ")[0],
            mobileNumber: FormatManager.formatMobileNumberToDTO(this.userForm.phone),
            patronymic: this.userForm.fullName.split(" ")[2],
            id: this.editingUserId!,
          };

          const response = await this.userResolver.update(editedUser);
          if (response.status === 200) {
            this.cancelEdit();
          } else {
            this.errors.toastPopup = {
              title: response.status.toString(),
              message: response.message,
            };
          }
        }
        await this.loadUsers();
      },
      cancelEdit() {
        this.editingUserId = null;
        this.userForm = {
          fullName: "",
          email: "",
          phone: "",
          birthDate: "",
          isMentor: false,
        };
        this.showEditUserDialog = false;
      },
      validateForm() {
        let isValid = true;

        if (!this.userForm.fullName.trim()) {
          this.errors.fullName = "ФИО обязательно";
          isValid = false;
        }

        if (!this.userForm.email.trim()) {
          this.errors.email = "email обязателен";
          isValid = false;
        }

        if (!this.userForm.phone.trim()) {
          this.errors.phone = "Номер телефона обязателен";
          isValid = false;
        }

        if (!this.userForm.birthDate.trim()) {
          this.errors.birthDate = "Дата рождения обязательна";
          isValid = false;
        }

        return isValid;
      },
      async loadUsers() {
        const response = await this.userResolver.getAllByRole(Roles.USER)
        if (typeof response.message !== "string") {
          this.users = response.message
        }
      },
      async deleteUser(user: UserOutputDto) {
        if (
          confirm(`Вы уверены, что хотите удалить родителя ${user.firstName}?`)
        ) {
          const response = await this.userResolver.delete(user.id);
          if (response.status === 200) {
            await this.loadUsers();
          } else {
            this.errors.toastPopup = {
              title: response.status.toString(),
              message: response.message,
            };
          }
        }
      }
    }
  };
</script>

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

  .filters-section {
    display: flex;
    gap: 1rem;
    align-items: end;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    flex-wrap: wrap;
  }

  .search-group {
    position: relative;
    flex: 1;
    min-width: 250px;
  }

  .search-input {
    width: 100%;
    padding-right: 2.5rem;
  }

  .search-icon {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    pointer-events: none;
  }

  .expert-info {
    flex: 1;
  }

  .expert-name {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-weight: 600;
  }


  .expert-actions {
    display: flex;
    gap: 0.5rem;
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

  .child-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition:
      box-shadow 0.3s ease,
      border-color 0.3s ease;
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

  /* Мобильные стили */
  @media (max-width: 768px) {

    .experts-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .page-title {
      font-size: 1.5rem;
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
