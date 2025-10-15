<template>
  <div class="mentors-page">
    <div class="page-header">
      <h1 class="page-title">
        {{ mode === "USERS" ? 'Родители' : 'Наставники' }}
      </h1>
      <p class="page-subtitle">
        {{ mode === "USERS" ? 'Управление родителями' : 'Управление наставниками' }}
      </p>
    </div>

    <div class="filters-section">
      <div class="search-group">
        <InputText
          v-model="searchQuery"
          :placeholder="`Поиск по ФИО ${mode === 'USERS' ? 'родителя' : 'наставника'}, номеру телефона или электронной почте...`"
          class="search-input"
        />
        <i class="pi pi-search search-icon" />
      </div>
    </div>

    <div v-if="isLoading">
      <ProgressSpinner style="width: 100%; height: 5rem; margin-top: 5rem" />
    </div>
    <!-- Список пользователей (родителей) -->
    <div
      v-else-if="filteredUsers.length > 0"
      class="experts-grid"
    >
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
              <span class="detail-value">{{ getUserChildren(user).length }}
              </span>
            </div>
          </div>
          <div
            class="actions"
          >
            <h3
              v-if="getUserChildren(user).length > 0"
              class="expert-name"
            >
              {{ mode === "USERS" ? 'Дети' : 'Прикреплённые участники' }}
            </h3>
            <div
              v-for="child in getUserChildren(user)"
              :key="child.id"
              class="detail-item"
            >
              <Button
                :label="`${child.lastName} ${child.firstName} ${child.patronymic}`"
                class="p-button-outlined detail-label"
                @click="showChildDetails(child)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p>{{ mode === "USERS" ? 'Родители' : 'Наставники' }} не найдены</p>
    </div>

    <Dialog
      v-model:visible="showAddChildDialog"
      header="Редактировать ребёнка"
      :modal="true"
      :style="{ width: '600px', maxWidth: '90vw' }"
    >
      <form
        class="child-form"
        @submit.prevent="addChild"
      >
        <AddChildForm
          :child-id="selectedChild?.id"
          :is-editing="true"
          :model-child-form="childForm"
          :model-child-form-errors="childFormErrors"
          @update:model-child-form="(form) => childForm = form"
          @update:model-child-form-errors="(formErrors) => childFormErrors = formErrors"
          @update:birth-file="(val) => addBirthFile = val"
          @update:snils-file="(val) => addSnilsFile = val"
          @update:school-file="(val) => addSchoolFile = val"
          @update:platform-file="(val) => addPlatformFile = val"
          @update:consent-file="(val) => addConsentFile = val"
          @update:home-education="(val) => isHomeEducated = val"
          @update:home-preparation="(val) => isHomePrepared = val"
        />
        <Button
          label="Обновить данные о ребенке"
          icon="pi pi-plus"
          style="width: 100%"
          class="p-button-primary"
          type="submit"
          :loading="isLoading"
        />
      </form>
    </Dialog>

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

    <ChildDetailsDialog
      :child-details="selectedChildDetails"
      :show-child-info-prop="showChildDetailsDialog" 
      @show-child-info="(val) => showChildDetailsDialog = val"
      @edit-child="(child) => editChild(child)"
    />

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
  import ProgressSpinner from 'primevue/progressspinner';
  import ChildDetailsDialog from '@/components/dialogs/ChildDetailsDialog.vue';
  import { ChildCompetenciesResolver } from '@/api/resolvers/childCompetencies/child-competencies.resolver.ts';
  import type { DocsOutputFileUploadDto } from '@/api/resolvers/files/dto/output/docs-output-file-upload.dto.ts';
  import { FileResolver } from '@/api/resolvers/files/file.resolver.ts';
  import AddChildForm, { type ChildFormErrors, type ChildFormFields } from '@/components/AddChildForm.vue';
  import { ChildDocumentsResolver } from '@/api/resolvers/childDocuments/child-documents.resolver.ts';
  import { ChildResolver } from '@/api/resolvers/child/child.resolver.ts';
  import type { PropType } from 'vue';
  import type { ChildDetailsDialogData } from '@/components/lists/ChildrenList.vue';

  export enum Mode {
    USERS = "USERS",
    MENTORS = "MENTORS"
  }

  export default {
    name: 'AdminUsers',
    components: {
      AddChildForm,
      ChildDetailsDialog,
      ToastPopup,
      Button,
      InputText,
      InputMask,
      Checkbox,
      Dialog,
      ProgressSpinner
    },
    props: {
      mode: {
        type: String as PropType<Mode>,
        default: Mode.USERS
      }
    },
    data() {
      return {
        childCompetenciesResolver: new ChildCompetenciesResolver(),
        childDocumentsResolver: new ChildDocumentsResolver(),
        childResolver: new ChildResolver(),
        userResolver: new UserResolver(),
        fileResolver: new FileResolver(),

        users: [] as UserOutputDto[],
        editingUserId: null as null | number,

        isLoading: false,
        addBirthFile: false,
        addSnilsFile: false,
        addConsentFile: false,
        addSchoolFile: false,
        addPlatformFile: false,
        showAddChildDialog: false,
        isHomeEducated: false,
        isHomePrepared: false,
        searchQuery: "",

        childForm: {
          lastName: '',
          firstName: '',
          patronymic: '',
          birthDate: '',
          snilsNumber: '',
          schoolName: '',
          platform: '',
          grade: null as number | null,
          childConsentFile: null as null | File,
          snilsScan: null as null | File,
          birthCertificate: null as null | File,
          schoolCertificate: null as null | File,
          platformCertificate: null as null | File,
        } as ChildFormFields,

        childFormErrors: {
          lastName: '',
          firstName: '',
          birthDate: '',
          snilsNumber: '',
          schoolName: '',
          platform: '',
          grade: '',
          snilsScan: '',
          schoolCertificate: '',
          birthCertificate: '',
          platformCertificate: '',
        } as ChildFormErrors,

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
        selectedChildDetails: null as ChildDetailsDialogData | null,
        showEditUserDialog: false,
        showChildDetailsDialog: false,
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
    async beforeMount() {
      window.scrollTo(0, 0);
      await this.loadUsers();
      },
    methods: {
      getUserChildren(user: UserOutputDto) {
        return this.mode === Mode.USERS
          ? user.children
          : user.menteeChildren
      },
      async loadChildDetails() {
        if (this.selectedChild === null) return
        const child = this.selectedChild
        const response = await this.childCompetenciesResolver.getByChildId(child.id)
        const competencies = typeof response.message === "string"
          ? []
          : await Promise.all(response.message.map(async competence => {
            const expertResponse = await this.userResolver.getById(competence.direction.expertId)
            return {
              ...competence.direction,
              expert: typeof expertResponse.message === "string"
                ? {
                  lastName: "Эксперт",
                  firstName: "не",
                  patronymic: "указан"
                }
                : expertResponse.message
            }
          }))
        this.selectedChildDetails = {
          child: child,
          childDocs: child.childDocuments !== null
            ? {
              birthFile: (await this.fileResolver.getById(child.childDocuments.birthCertificateId)) as DocsOutputFileUploadDto,
              snilsFile: (await this.fileResolver.getById(child.childDocuments.snilsId)) as DocsOutputFileUploadDto,
              schoolFile: (await this.fileResolver.getById(child.childDocuments.studyingCertificateId)) as DocsOutputFileUploadDto,
              platformFile: (await this.fileResolver.getById(child.childDocuments.additionalStudyingCertificateId)) as DocsOutputFileUploadDto,
              consentFile: (await this.fileResolver.getById(child.childDocuments.consentToChildPdpId)) as DocsOutputFileUploadDto,
            }
            : null,
          competencies: competencies
        }
      },
      editUser(user: UserOutputDto) {
        this.editingUserId = user.id;
        this.userForm = {
          fullName: `${user.lastName} ${user.firstName} ${user.patronymic}`,
          email: user.email,
          phone: FormatManager.formatMobileNumberFromDTO(user.mobileNumber),
          birthDate: FormatManager.formatBirthDateFromDTO(user.dateOfBirth),
          isMentor: user.isMentor
        };
        this.showEditUserDialog = true;
      },
      async showChildDetails(child: ChildOutputDto) {
        this.showChildDetailsDialog = true;
        if (this.selectedChild?.id !== child.id) {
          this.selectedChildDetails = null
          this.selectedChild = child;
          await this.loadChildDetails()
        }
      },
      clearChildForm() {
        this.childForm = {
          birthCertificate: null,
          birthDate: '',
          childConsentFile: null,
          lastName: '',
          firstName: '',
          patronymic: null,
          grade: null,
          platform: '',
          platformCertificate: null,
          schoolCertificate: null,
          schoolName: '',
          snilsNumber: '',
          snilsScan: null,

        };
      },
      editChild(child: ChildOutputDto) {
        this.clearChildForm();
        this.showAddChildDialog = true;
        this.childForm.lastName = child.lastName;
        this.childForm.firstName = child.firstName;
        this.childForm.patronymic = child.patronymic;
        this.childForm.birthDate = FormatManager.formatBirthDateFromDTO(child.dateOfBirth);
        this.selectedChild = child;
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
            email: this.userForm.email,
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
      async addChild() {
        if (!this.validateChildForm()) return;
        this.isLoading = true;
        if (this.selectedChild !== null) {
          await this.childResolver.update({
            id: this.selectedChild.id,
            lastName: this.childForm.lastName,
            firstName: this.childForm.firstName,
            patronymic: this.childForm.patronymic,
            dateOfBirth: FormatManager.formatBirthDateToDTO(this.childForm.birthDate),
            mentorId: null,
          });
          this.selectedChildDetails = null
          await this.addChildDocs();
          await this.loadUsers()
          await this.loadChildDetails()

          // Показываем тост об успехе
          this.errors.toastPopup = {
            title: 'Успешно',
            message: 'Данные ребенка успешно обновлены',
          };
        }
        this.isLoading = false;
        this.showAddChildDialog = false;
      },
      async addChildDocs() {
        if (this.addBirthFile || this.addSnilsFile
          || this.addSchoolFile || this.addPlatformFile
          || this.addConsentFile) {
          await this.childDocumentsResolver.update({
            id: this.selectedChild!.childDocuments!.id,
            additionalStudyingCertificateFile: this.isHomePrepared
              ? await this.getHomeFile('home_preparation.txt')
              : this.childForm.platformCertificate,
            birthCertificateFile: this.childForm.birthCertificate,
            consentToChildPdpFile: this.childForm.childConsentFile,
            learningClass: this.isHomeEducated
              ? 0
              : this.childForm.grade ?? this.selectedChild!.childDocuments!.learningClass,
            parentRole: this.selectedChild!.childDocuments!.parentRole,
            snilsFile: this.childForm.snilsScan,
            snilsNumber: this.childForm.snilsNumber
              ? FormatManager.formatSnilsToDTO(this.childForm.snilsNumber)
              : this.selectedChild!.childDocuments!.snilsNumber,
            studyingCertificateFile: this.isHomeEducated
              ? await this.getHomeFile('home_education.txt')
              : this.childForm.schoolCertificate,
            studyingPlace: this.isHomeEducated
              ? 'Домашнее обучение'
              : this.childForm.schoolName ?? this.selectedChild!.childDocuments!.studyingPlace,
            trainingGround: this.isHomePrepared
              ? 'Домашнее обучение'
              : this.childForm.platform ?? this.selectedChild!.childDocuments!.trainingGround,
          });
          const response = await this.childResolver.getById(this.selectedChild!.id)
          if (typeof response.message !== "string") {
            this.selectedChild = response.message
          }

        }
      },
      async getHomeFile(filename: string) {
        const response = await fetch(`/docs/${filename}`);
        const blob = await response.blob();
        return new File([], filename, { type: blob.type });
      },
      validateChildForm() {
        let isValid = true;
        // Валидация данных ребенка
        if (!this.childForm.lastName.trim()) {
          this.childFormErrors.lastName = 'Фамилия ребенка обязательна';
          isValid = false;
        }

        if (!this.childForm.firstName.trim()) {
          this.childFormErrors.firstName = 'Имя ребенка обязательно';
          isValid = false;
        }

        if (!this.childForm.birthDate) {
          this.childFormErrors.birthDate = 'Дата рождения обязательна';
          isValid = false;
        } else if (!/^\d{2}\.\d{2}\.\d{4}$/.test(this.childForm.birthDate)) {
          this.childFormErrors.birthDate = 'Введите дату в формате дд.мм.гггг';
          isValid = false;
        }

        if (!this.childForm.birthCertificate && (this.addBirthFile)) {
          this.childFormErrors.birthCertificate =
            'Необходимо загрузить скан свидетельства о рождении';
          isValid = false;
        }

        if (!this.childForm.snilsNumber && (this.addSnilsFile)) {
          this.childFormErrors.snilsNumber = 'Номер СНИЛС обязателен';
          isValid = false;
        }

        if (!this.childForm.snilsScan && (this.addSnilsFile)) {
          this.childFormErrors.snilsScan = 'Необходимо загрузить скан СНИЛС';
          isValid = false;
        }

        if (!this.childForm.schoolName && (this.addSchoolFile) && !this.isHomeEducated) {
          this.childFormErrors.schoolName = 'Название учреждения обязательно';
          isValid = false;
        }

        if (this.childForm.grade === null && (this.addSchoolFile) && !this.isHomeEducated) {
          this.childFormErrors.grade = 'Класс обучения обязателен';
          isValid = false;
        }

        if (!this.childForm.platform && (this.addPlatformFile) && !this.isHomePrepared) {
          this.childFormErrors.platform = 'Выберите площадку подготовки';
          isValid = false;
        }

        if (!this.childForm.schoolCertificate && (this.addSchoolFile) && !this.isHomeEducated) {
          this.childFormErrors.schoolCertificate = 'Необходимо загрузить справку из ОУ';
          isValid = false;
        }

        if (!this.childForm.platformCertificate && (this.addPlatformFile) && !this.isHomePrepared) {
          this.childFormErrors.platformCertificate =
            'Необходимо загрузить справку из площадки подготовки';
          isValid = false;
        }

        if (!this.childForm.childConsentFile && (this.addConsentFile)) {
          this.childFormErrors.childConsentFile =
            'Необходимо загрузить согласие на обработку персональных данных';
          isValid = false;
        }

        return isValid;
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
        this.isLoading = true
        const response = await this.userResolver.getAllByRole(
          this.mode === Mode.USERS
            ? Roles.USER
            : Roles.MENTOR
        )
        if (typeof response.message !== "string") {
          this.users = response.message
        }
        this.isLoading = false
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
