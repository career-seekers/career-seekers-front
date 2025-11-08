<template>
  <div
    v-if="user !== null"
    class="dashboard-home"
  >
    <div class="page-header">
      <h1 class="page-title">
        Добро пожаловать, {{ user.firstName }}!
      </h1>
      <p class="page-subtitle">
        Управляйте участием вашего ребенка в чемпионате
      </p>
    </div>

    <div class="dashboard-grid">
      <!-- Персональные данные -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-user" />
            Персональные данные
          </h3>
          <div class="user-actions">
            <Button
              label="Редактировать профиль"
              icon="pi pi-pencil"
              class="p-button-secondary p-button-sm"
              @click="$emit('openSettings', true)"
            />
            <Button
              disabled
              label="Добавить ребенка"
              icon="pi pi-plus"
              class="p-button-secondary p-button-sm"
              @click="fillNewChild"
            />
          </div>
        </div>
        <div class="card-content">
          <div class="data-section">
            <h4 class="section-title">
              Родитель
            </h4>
            <div class="data-item">
              <span class="data-label">ФИО:</span>
              <span class="data-value">
                {{ `${user.lastName} ${user.firstName} ${user.patronymic}` }}
              </span>
            </div>
            <div class="data-item">
              <span class="data-label">Телефон:</span>
              <span class="data-value">{{ FormatManager.formatMobileNumberFromDTO(user.mobileNumber) }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Email:</span>
              <span class="data-value">{{ user.email }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Всего детей:</span>
              <span class="data-value">{{ user.children.length }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ChildrenList
      v-if="childrenDetails.length > 0"
      :children-details="childrenDetails"
      @edit-child="(child) => editChild(child)"
      @edit-mentor="(child) => openMentorSelectionDialog(child)"
      @update-children="updateChildrenDetails"
      @update-toast-popup="(title, message) => toastPopup = { title, message }"
    />
    <div v-else-if="isLoading">
      <ProgressSpinner
        style="width: 100%; height: 5rem; margin-top: 5rem"
      />
    </div>


    <Dialog
      v-model:visible="showAddChildDialog"
      :header="
        isEditing ? 'Редактировать ребёнка' : 'Добавить ребёнка'
      "
      :modal="true"
      :style="{ width: '600px', maxWidth: '90vw' }"
    >
      <form
        class="child-form"
        @submit.prevent="addChild"
      >
        <AddChildForm
          :child-id="selectedChild?.id"
          :is-editing="isEditing"
          :model-child-form="childForm"
          :model-child-form-errors="errors"
          @update:model-child-form="(form) => childForm = form"
          @update:model-child-form-errors="(formErrors) => errors = formErrors"
          @update:birth-file="(val) => addBirthFile = val"
          @update:snils-file="(val) => addSnilsFile = val"
          @update:school-file="(val) => addSchoolFile = val"
          @update:platform-file="(val) => addPlatformFile = val"
          @update:consent-file="(val) => addConsentFile = val"
          @update:home-education="(val) => isHomeEducated = val"
          @update:home-preparation="(val) => isHomePrepared = val"
        />
        <Button
          :label="isEditing ? 'Обновить данные о ребенке' : 'Добавить нового ребёнка'"
          icon="pi pi-plus"
          style="width: 100%"
          class="p-button-primary"
          type="submit"
          :loading="isLoading"
        />
      </form>
    </Dialog>

    <!-- Диалог выбора наставника -->
    <Dialog
      v-model:visible="showMentorSelectionDialog"
      header="Выбор наставника"
      :modal="true"
      :style="{ width: '700px', maxWidth: '95vw' }"
    >
      <div class="mentor-selection">
        <p class="selection-description">
          Выберите наставника для
          {{ `${selectedChild?.lastName} ${selectedChild?.firstName} ${selectedChild?.patronymic}` }}
        </p>
        <div class="mentor-list">
          <!-- Опция "Я и являюсь наставником" -->
          <div
            class="mentor-item"
            :class="{ 'selected': selectedMentorId === user.id }"
            @click="selectMentor(user.id, user.menteeChildren)"
          >
            <div class="mentor-info">
              <div class="mentor-info-content">
                <div class="mentor-name">
                  <i class="pi pi-user" />
                  Я и являюсь наставником
                </div>
                <div class="mentor-details">
                  <span class="mentor-email">{{ user?.email }}</span>
                  <span class="mentor-phone">{{ user?.mobileNumber ? FormatManager.formatMobileNumberFromDTO(user.mobileNumber) : '' }}</span>
                </div>
              </div>
            </div>
            <div class="mentor-actions">
              <i
                v-if="selectedMentorId === user.id"
                class="pi pi-check selected-icon"
              />
            </div>
          </div>
          
          <!-- Список доступных наставников -->
          <div 
            v-for="mentor in availableMentors" 
            :key="mentor.id"
            class="mentor-item"
            :class="{
              'selected': selectedMentorId === mentor.id,
              'disabled': isMentorDisabled(mentor)
            }"
            @click="selectMentor(mentor.id, mentor.menteeChildren)"
          >
            <div class="mentor-info">
              <div class="mentor-info-content">
                <div class="mentor-name">
                  {{ `${mentor.lastName} ${mentor.firstName} ${mentor.patronymic}` }}
                </div>
                <div class="mentor-details">
                  <span class="mentor-email">{{ mentor.email }}</span>
                  <span class="mentor-phone">{{ FormatManager.formatMobileNumberFromDTO(mentor.mobileNumber) }}</span>
                </div>
              </div>
            </div>
            <div class="mentor-actions">
              <Button
                v-if="getSavedMentorIds.includes(mentor.id)"
                v-tooltip.top="'Удалить из списка'"
                icon="pi pi-trash"
                class="p-button-danger p-button-sm p-button-text"
                @click.stop="removeMentorFromList(mentor.id)"
              />
              <i
                v-if="selectedMentorId === mentor.id"
                class="pi pi-check selected-icon"
              />
              <i
                v-if="isMentorDisabled(mentor)"
                v-tooltip.top="'У наставника нет мест'"
                class="pi pi-question"
              />
            </div>
          </div>
        </div>
        <div class="mentor-selection-actions">
          <Button
            label="Отмена"
            class="p-button-secondary"
            @click="closeMentorSelectionDialog"
          />
          <Button
            label="Сохранить"
            class="p-button-primary"
            :disabled="!selectedMentorId"
            @click="saveMentorSelection"
          />
        </div>
      </div>
    </Dialog>

    <!-- Диалог подтверждения удаления наставника -->
    <Dialog
      v-model:visible="showDeleteMentorDialog"
      header="Подтверждение удаления"
      :modal="true"
      :style="{ width: '400px', maxWidth: '90vw' }"
    >
      <div class="delete-confirmation">
        <div class="confirmation-content">
          <h4>Удалить наставника?</h4>
          <p>Вы уверены, что хотите удалить наставника "{{ selectedMentorToDelete?.name }}" из списка доступных наставников?</p>
          <p class="warning-text">
            Это действие нельзя отменить.
          </p>
        </div>
        <div class="confirmation-actions">
          <Button
            label="Отмена"
            class="p-button-secondary"
            @click="cancelDeleteMentor"
          />
          <Button
            label="Удалить"
            class="p-button-danger"
            @click="confirmDeleteMentor"
          />
        </div>
      </div>
    </Dialog>

    <ToastPopup :content="toastPopup" />
  </div>
</template>

<script lang="ts">
import Button from 'primevue/button';
import { useUserStore } from '@/stores/userStore.ts';
import Dialog from 'primevue/dialog';
import AddChildForm, { type ChildFormErrors, type ChildFormFields } from '@/components/AddChildForm.vue';
import { ChildDocumentsResolver } from '@/api/resolvers/childDocuments/child-documents.resolver.ts';
import { ChildResolver } from '@/api/resolvers/child/child.resolver.ts';
import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';
import { FileResolver } from '@/api/resolvers/files/file.resolver.ts';
import { FormatManager } from '@/utils/FormatManager.ts';
import ToastPopup from '@/components/ToastPopup.vue';
import { ChildCompetenciesResolver } from '@/api/resolvers/childCompetencies/child-competencies.resolver.ts';
import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
import { MentorLinksResolver } from '@/api/resolvers/mentorLinks/mentor-links.resolver.ts';
import { ChildPackResolver } from '@/api/resolvers/childPack/child-pack.resolver.ts';
import type { DocsOutputFileUploadDto } from '@/api/resolvers/files/dto/output/docs-output-file-upload.dto.ts';
import ProgressSpinner from 'primevue/progressspinner';
import ChildrenList, { type ChildDetailsData } from '@/components/lists/ChildrenList.vue';

export default {
  name: 'UserDashboardHome',
  components: {
    ChildrenList,
    ProgressSpinner,
    ToastPopup,
    AddChildForm,
    Button,
    Dialog,
  },
  emits: ['openSettings'],
  data() {
    return {
      fileResolver: new FileResolver(),
      childResolver: new ChildResolver(),
      childDocumentsResolver: new ChildDocumentsResolver(),
      childCompetenciesResolver: new ChildCompetenciesResolver(),
      childPackResolver: new ChildPackResolver(),
      userResolver: new UserResolver(),
      mentorLinksResolver: new MentorLinksResolver(),
      userStore: useUserStore(),

      showAddChildDialog: false,

      isEditing: false,
      selectedChild: null as ChildOutputDto | null,
      selectedMentorId: null as null | number,

      // Новые свойства для компетенций и модальных окон
      showChildDetailsDialog: false,
      showMentorSelectionDialog: false,
      showDeleteMentorDialog: false,
      selectedMentorToDelete: null as { id: number, name: string } | null,
      availableMentors: [] as {
        id: number;
        lastName: string;
        firstName: string;
        patronymic: string;
        email: string;
        mobileNumber: string;
        menteeChildren: ChildOutputDto[]
      }[],

      isLoading: false,
      addBirthFile: false,
      addSnilsFile: false,
      addConsentFile: false,
      addSchoolFile: false,
      addPlatformFile: false,
      isHomeEducated: false,
      isHomePrepared: false,

      toastPopup: {
        title: '',
        message: '',
      },

      childrenDetails: [] as ChildDetailsData[],

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

      errors: {
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
    };
  },
  computed: {
    FormatManager() {
      return FormatManager;
    },
    user() {
      return this.userStore.user;
    },
    getSavedMentorIds() {
      return this.availableMentors.map(mentor => mentor.id);
    },
  },
  watch: {
    showAddChildDialog() {
      this.errors = {
        birthCertificate: '',
        birthDate: '',
        childConsentFile: '',
        lastName: '',
        firstName: '',
        grade: '',
        platform: '',
        platformCertificate: '',
        schoolCertificate: '',
        schoolName: '',
        snilsNumber: '',
        snilsScan: '',
      };
    },
    addBirthFile() { this.clearErrors() },
    addSnilsFile() { this.clearErrors() },
    addConsentFile() { this.clearErrors() },
    addSchoolFile() { this.clearErrors() },
    addPlatformFile() { this.clearErrors() },
    isHomeEducated() { this.clearErrors() },
    isHomePrepared() { this.clearErrors() },
  },
  async mounted() {
    await this.loadChildrenDetails();
    await this.loadAvailableMentors();
  },

  async activated() {
    await this.loadAvailableMentors();
  },
  methods: {
    async updateChildrenDetails() {
      this.childrenDetails = []
      await this.loadChildrenDetails()
    },
    isMentorDisabled(mentor: {
      id: number,
      menteeChildren: ChildOutputDto[]
    }) {
      if (mentor.menteeChildren.length < 3) return false
      if (this.selectedMentorId === mentor.id) return false
      return !(this.selectedChild !== null &&
        mentor.menteeChildren.map(child => child.id).includes(this.selectedChild.id));
    },
    async loadChildrenDetails() {
      this.isLoading = true;
      const details = [] as ChildDetailsData[];
      const children = this.user?.children ?? [];
      for (const child of children) {
        const response = await this.childCompetenciesResolver.getByChildId(child.id);
        const competencies = typeof response.message === 'string'
          ? []
          : await Promise.all(response.message.map(async competence => {
            const expertResponse = await this.userResolver.getById(competence.direction.expertId);
            return {
              ...competence.direction,
              expert: typeof expertResponse.message === 'string'
                ? {
                  lastName: 'Эксперт',
                  firstName: 'не',
                  patronymic: 'указан',
                }
                : expertResponse.message,
              queueStatus: competence.queueStatus,
              assignId: competence.id,
              teacherName: competence.teacherName,
              institution: competence.institution,
              post: competence.post,
            };
          }));
        details.push({
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
          competencies: competencies,
        });
      }
      this.childrenDetails = details;
      this.isLoading = false;
    },
    validateForm() {
      let isValid = true;
      // Валидация данных ребенка
      if (!this.childForm.lastName.trim()) {
        this.errors.lastName = 'Фамилия ребенка обязательна';
        isValid = false;
      }

      if (!this.childForm.firstName.trim()) {
        this.errors.firstName = 'Имя ребенка обязательно';
        isValid = false;
      }

      if (!this.childForm.birthDate) {
        this.errors.birthDate = 'Дата рождения обязательна';
        isValid = false;
      } else if (!/^\d{2}\.\d{2}\.\d{4}$/.test(this.childForm.birthDate)) {
        this.errors.birthDate = 'Введите дату в формате дд.мм.гггг';
        isValid = false;
      }

      if (!this.childForm.birthCertificate && (!this.isEditing || this.addBirthFile)) {
        this.errors.birthCertificate =
          'Необходимо загрузить скан свидетельства о рождении';
        isValid = false;
      }

      if (!this.childForm.snilsNumber && (!this.isEditing || this.addSnilsFile)) {
        this.errors.snilsNumber = 'Номер СНИЛС обязателен';
        isValid = false;
      }

      if (!this.childForm.snilsScan && (!this.isEditing || this.addSnilsFile)) {
        this.errors.snilsScan = 'Необходимо загрузить скан СНИЛС';
        isValid = false;
      }

      if (!this.childForm.schoolName && (!this.isEditing || this.addSchoolFile) && !this.isHomeEducated) {
        this.errors.schoolName = 'Название учреждения обязательно';
        isValid = false;
      }

      if (this.childForm.grade === null && (!this.isEditing || this.addSchoolFile) && !this.isHomeEducated) {
        this.errors.grade = 'Класс обучения обязателен';
        isValid = false;
      }

      if (!this.childForm.platform && (!this.isEditing || this.addPlatformFile) && !this.isHomePrepared) {
        this.errors.platform = 'Выберите площадку подготовки';
        isValid = false;
      }

      if (!this.childForm.schoolCertificate && (!this.isEditing || this.addSchoolFile) && !this.isHomeEducated) {
        this.errors.schoolCertificate = 'Необходимо загрузить справку из ОУ';
        isValid = false;
      }

      if (!this.childForm.platformCertificate && (!this.isEditing || this.addPlatformFile) && !this.isHomePrepared) {
        this.errors.platformCertificate =
          'Необходимо загрузить справку из площадки подготовки';
        isValid = false;
      }

      if (!this.childForm.childConsentFile && (!this.isEditing || this.addConsentFile)) {
        this.errors.childConsentFile =
          'Необходимо загрузить согласие на обработку персональных данных';
        isValid = false;
      }

      return isValid;
    },
    clearErrors() {
      this.errors = {
        birthCertificate: '',
        birthDate: '',
        childConsentFile: '',
        firstName: '',
        grade: '',
        platform: '',
        platformCertificate: '',
        schoolCertificate: '',
        schoolName: '',
        snilsNumber: '',
        snilsScan: '',
        lastName: ""
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

      this.addBirthFile = false
      this.addSnilsFile = false
      this.addSchoolFile = false
      this.addPlatformFile = false
      this.addConsentFile = false
    },
    fillNewChild() {
      this.selectedChild = null;
      this.clearChildForm();
      this.isEditing = false;
      this.showAddChildDialog = true;
    },
    editChild(child: ChildOutputDto) {
      this.clearChildForm();
      this.clearErrors();
      this.isEditing = child.childDocuments !== null;
      this.showAddChildDialog = true;
      this.childForm.lastName = child.lastName;
      this.childForm.firstName = child.firstName;
      this.childForm.patronymic = child.patronymic;
      this.childForm.birthDate = FormatManager.formatBirthDateFromDTO(child.dateOfBirth);
      this.selectedChild = child;
    },
    async addChild() {
      if (this.user === null || !this.validateForm()) return;
      this.isLoading = true;
      if (this.isEditing && this.selectedChild !== null) {
        const response = await this.childResolver.update({
          id: this.selectedChild.id,
          lastName: this.childForm.lastName,
          firstName: this.childForm.firstName,
          patronymic: this.childForm.patronymic,
          dateOfBirth: FormatManager.formatBirthDateToDTO(this.childForm.birthDate),
          mentorId: null,
        });
        if (response.status === 200) {
          await this.addChildDocs();
          await this.userStore.fillChildren();
          this.showAddChildDialog = false;
          // Показываем тост об успехе
          this.toastPopup = {
            title: 'Успешно',
            message: 'Данные ребенка успешно обновлены',
          };
          await this.loadChildrenDetails();
        } else {
          this.toastPopup = {
            title: response.status.toString(),
            message: response.message,
          };
        }
      } else {
        const response = await this.childPackResolver.create({
          userId: this.user.id,
          lastName: this.childForm.lastName,
          firstName: this.childForm.firstName,
          patronymic: this.childForm.patronymic,
          dateOfBirth: FormatManager.formatBirthDateToDTO(this.childForm.birthDate),
          mentorId: null,
          additionalStudyingCertificateFile: this.isHomePrepared
            ? await this.getHomeFile('home_preparation.txt')
            : this.childForm.platformCertificate!,
          birthCertificateFile: this.childForm.birthCertificate!,
          consentToChildPdpFile: this.childForm.childConsentFile!,
          learningClass: this.isHomeEducated
            ? 0
            : this.childForm.grade!,
          parentRole: this.user.children.length > 0 && this.user.children[0].childDocuments !== null
            ? this.user.children[0].childDocuments?.parentRole
            : 'Не указано',
          snilsFile: this.childForm.snilsScan!,
          snilsNumber: FormatManager.formatSnilsToDTO(this.childForm.snilsNumber),
          studyingCertificateFile: this.isHomeEducated
            ? await this.getHomeFile('home_education.txt')
            : this.childForm.schoolCertificate!,
          studyingPlace: this.isHomeEducated
            ? 'Домашнее обучение'
            : this.childForm.schoolName,
          trainingGround: this.isHomePrepared
            ? 'Домашнее обучение'
            : this.childForm.platform,
        });
        if (typeof response.message === 'string') {
          this.toastPopup = {
            title: response.status.toString(),
            message: response.message,
          };
        } else {
          await this.userStore.fillChildren();
          this.showAddChildDialog = false;
          await this.loadChildrenDetails();
        }
      }
      this.isLoading = false;
    },
    async addChildDocs() {
      if (this.addBirthFile || this.addSnilsFile
        || this.addSchoolFile || this.addPlatformFile
        || this.addConsentFile) {
        const response = await this.childDocumentsResolver.update({
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
        if (typeof response.message !== 'string') await this.userStore.fillChildren();
      }
    },
    async getHomeFile(filename: string) {
      const response = await fetch(`/docs/${filename}`);
      const blob = await response.blob();
      return new File([], filename, { type: blob.type });
    },
    async openMentorSelectionDialog(child: ChildOutputDto | null) {
      if (!child) return;

      // Скрываем все другие модалки
      this.hideAllDialogs();

      // Загружаем наставников с сервера
      await this.loadAvailableMentors();
      this.selectedChild = child;
      // Устанавливаем выбранного наставника, если он есть, иначе null
      this.selectedMentorId = child.mentor ? child.mentor.id : null;
      this.showMentorSelectionDialog = true;
    },

    hideAllDialogs() {
      this.showChildDetailsDialog = false;
      this.showMentorSelectionDialog = false;
      this.showDeleteMentorDialog = false;
      this.showAddChildDialog = false;
    },

    async loadAvailableMentors() {
      // Проверяем localStorage на наличие ID наставника
      const strMentorIds = localStorage.getItem('mentorIds');
      const mentorIds = strMentorIds ? JSON.parse(strMentorIds) as number[] : [];

      // Полностью очищаем и пересоздаем список опций наставников
      this.availableMentors = [];

      if (mentorIds.length > 0) {
        for (const mentorId of mentorIds) {
          try {
            // Загружаем данные наставника из API
            const response = await this.userResolver.getById(mentorId);
            if (response.status === 200 && typeof response.message !== 'string') {
              const mentor = response.message;
              // Добавляем внешнего наставника в список опций (проверяем на дублирование)
              const existingMentor = this.availableMentors.find(option => option.id === mentorId);
              if (!existingMentor) {
                this.availableMentors.push({...mentor});
              }
            }
          } catch (error) {
            console.error('Error loading mentor from API:', error);
          }
        }
      }
    },
    removeMentorFromList(mentorId: number) {
      // Находим наставника для отображения в диалоге подтверждения
      const mentor = this.availableMentors.find(m => m.id === mentorId);
      if (mentor) {
        this.selectedMentorToDelete = {
          id: mentorId,
          name: `${mentor.lastName} ${mentor.firstName} ${mentor.patronymic}`,
        };
        this.showDeleteMentorDialog = true;
      }
    },
    cancelDeleteMentor() {
      this.showDeleteMentorDialog = false;
      this.selectedMentorToDelete = null;
    },
    async confirmDeleteMentor() {
      if (!this.selectedMentorToDelete) return;

      try {
        // Удаляем связь родитель-наставник с сервера
        this.availableMentors = this.availableMentors.filter(mentor => mentor.id !== this.selectedMentorToDelete!.id);
        localStorage.setItem('mentorIds', JSON.stringify(this.availableMentors.map(mentor => mentor.id)));

        this.toastPopup = {
          title: 'Успех',
          message: `Наставник "${this.selectedMentorToDelete.name}" удален из списка`,
        };

        this.showDeleteMentorDialog = false;
        this.selectedMentorToDelete = null;
      } catch (error) {
        console.error('Ошибка при удалении наставника:', error);
        this.toastPopup = {
          title: 'Ошибка',
          message: 'Не удалось удалить наставника',
        };
      }
    },
    selectMentor(mentorId: number, menteeChildren: ChildOutputDto[]) {
      if (!this.isMentorDisabled({
        id: mentorId,
        menteeChildren
      })) this.selectedMentorId = mentorId;
    },
    closeMentorSelectionDialog() {
      this.showMentorSelectionDialog = false;
      this.selectedMentorId = null;
      this.selectedChild = null;
    },
    async saveMentorSelection() {
      if (!this.selectedMentorId || !this.selectedChild?.id) return;
      try {
        let mentorId = null;

        // Определяем ID наставника
        if (this.selectedMentorId === this.user?.id) {
          // Если родитель выбирает себя, используем его ID
          mentorId = this.user?.id || null;
        } else {
          // Если выбран другой наставник
          mentorId = this.selectedMentorId as number;
        }

        await this.childResolver.update({
          id: this.selectedChild.id,
          mentorId: (this.availableMentors.find(mentor => mentor.id === mentorId) !== undefined
            || mentorId === this.user?.id)
            ? mentorId
            : this.user!.id,
          dateOfBirth: this.selectedChild.dateOfBirth,
          firstName: this.selectedChild.firstName,
          lastName: this.selectedChild.lastName,
          patronymic: this.selectedChild.patronymic,
        });

        // Обновляем данные пользователя
        await this.userStore.fillChildren();
        await this.loadChildrenDetails()

        // Сохраняем связь родитель-наставник на сервере
        if (this.userStore.user && mentorId !== null) {
          await this.mentorLinksResolver.create({
            userId: mentorId,
          });
        }

        this.toastPopup = {
          title: 'Успех',
          message: 'Наставник успешно назначен',
        };

        this.closeMentorSelectionDialog();
        this.showChildDetailsDialog = false;
      } catch (error) {
        console.error('Ошибка при сохранении наставника:', error);
        this.toastPopup = {
          title: 'Ошибка',
          message: 'Не удалось сохранить наставника',
        };
      }
    },
  },
};
</script>

<style scoped>
.dashboard-home {
  max-width: 1200px;
  margin: 0 auto;
  animation: slideInRight 0.4s ease-out;
  width: 100%;
  box-sizing: border-box;
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

.user-actions {
  display: flex;
  gap: 1rem;
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

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin-bottom: 2rem;
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
  flex: 1;
}

.card-title i {
  margin-right: 0.75rem;
  font-size: 1.1rem;
}


.card-content {
  padding: 1.5rem;
}

.data-section {
  margin-bottom: 1.5rem;
}

.data-section:last-child {
  margin-bottom: 0;
}

.section-title {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #ff9800;
  padding-bottom: 0.5rem;
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
  .dashboard-home {
    padding: 0 1rem;
    max-width: 100%;
    width: 100%;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    width: 100%;
    max-width: 100%;
    padding: 0;
    margin: 0;
  }

  .user-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .info-card {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0;
  }

  .card-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .card-title {
    gap: 0.5rem;
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

  .card-title {
    font-size: 1.1rem;
  }

  .mentor-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .mentor-selection .mentor-info {
    flex-direction: column;
    gap: 0.5rem;
  }

  .mentor-selection .mentor-actions {
    align-self: flex-end;
  }

  .mentor-selection-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .dashboard-home {
    padding: 0 0.5rem;
    max-width: 100%;
    width: 100%;
  }

  .dashboard-grid {
    gap: 0.75rem;
    width: 100%;
    max-width: 100%;
    padding: 0;
    margin: 0;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
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

/* Стили для участников */

.mentor-available-notice i {
  color: #28a745;
}

/* Стили для диалога подтверждения удаления */
.delete-confirmation {
  text-align: center;
  padding: 1rem;
}

.confirmation-content h4 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.confirmation-content p {
  color: #6c757d;
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.warning-text {
  color: #e74c3c !important;
  font-weight: 500;
  font-size: 0.9rem;
}

.confirmation-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.mentor-simple i {
  color: #28a745;
  font-size: 0.9rem;
}

/* Стили для модальных окон */

.section-title {
  color: #2c3e50;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #ff9800;
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}


.info-section .mentor-info,
.details-section .mentor-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #28a745;
}

.info-section .mentor-details,
.details-section .mentor-details {
  margin-bottom: 1rem;
}

.info-section .mentor-actions,
.details-section .mentor-actions {
  display: flex;
  justify-content: flex-end;
}

/* Стили для выбора наставника */
.mentor-selection {

  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  background-color: #f8f9fa;
}

.selection-description {
  color: #6c757d;
  margin: 0 0 1.5rem 0;
  font-size: 0.9rem;
}

.mentor-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.mentor-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  margin-bottom: 0.75rem;
}

.mentor-item:hover {
  background: #e9ecef;
  border-color: #ff9800;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.15);
}

.mentor-item.disabled:hover {
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 12px rgba(86, 77, 79, 0.2);
}

.mentor-item.selected {
  background: #fff3cd;
  border-color: #ff9800;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
}

.mentor-item.disabled {
  background: rgba(236, 227, 230, 0.97);
  border-color: #838080;
  box-shadow: 0 4px 12px rgba(58, 57, 57, 0.2);

  div, span {
    color: rgba(0, 0, 0, 0.38);
  }
}


.mentor-item.selected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #28a745;
  border-radius: 12px 0 0 12px;
}

.parent-mentor-option .mentor-name {
  color: #155724;
  font-weight: 600;
}

.parent-mentor-option .mentor-name i {
  margin-right: 0.5rem;
  color: #28a745;
}

.mentor-selection .mentor-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mentor-info-content {
  flex: 1;
}

.mentor-name {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mentor-name i {
  color: #ff9800;
  font-size: 1rem;
}

.mentor-selection .mentor-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mentor-email,
.mentor-phone {
  color: #6c757d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mentor-selection .mentor-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selected-icon {
  color: #28a745;
  font-size: 1.2rem;
}

.mentor-selection-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
  flex-wrap: wrap;
}
</style>
