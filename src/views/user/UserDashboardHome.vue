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
              <span class="data-label">Статус:</span>
              <span class="data-value">{{ user.verified ? 'Подтверждён' : 'Не подтверждён' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Данные о детях -->
      <div class="info-card">
        <div class="card-header">
          <div class="card-header-content">
          <h3 class="card-title">
              <i class="pi pi-users" />
              Мои дети
          </h3>
            <Button
              label="Добавить ребёнка"
              icon="pi pi-plus"
              class="p-button-sm header-button"
              @click="fillNewChild"
            />
          </div>
        </div>
        <div class="card-content">
          <div class="participants-preview">
            <p class="preview-text">
              Всего детей: {{ user.children.length }}
            </p>
      </div>
          <div
            v-if="user.children && user.children.length > 0"
            class="competencies-section competencies-scrollable"
          >
            <div 
              v-for="child in user.children" 
              :key="child.id"
              class="child-competencies"
            >
              <h4 class="child-name">
                {{ `${child.lastName} ${child.firstName} ${child.patronymic}` }}
              </h4>
              <div
                v-if="getCompetenciesByChildId(child.id).length > 0"
                class="competencies-list"
              >
                <div 
                  v-for="competence in getCompetenciesByChildId(child.id)"
                  :key="competence.id"
                  class="competence-item"
                  @click="openChildDetailsDialog(child, competence)"
                >
                  <div class="competence-icon">
                    <i class="pi pi-star" />
    </div>
                  <div class="competence-info">
                    <div class="competence-name">
                      {{ competence.direction.name }}
                    </div>
                    <div class="competence-description">
                      {{ competence.direction.description }}
                    </div>
                    <div class="competence-expert">
                      <i class="pi pi-user" />
                      Главный эксперт: {{ expertNames.get(competence.direction.expertId) || `ID ${competence.direction.expertId}` }}
                    </div>
                    <div class="competence-mentor">
                      <i class="pi pi-users" />
                      Наставник: {{ getMentorName(child) }}
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-else
                class="no-competencies"
              >
                <i class="pi pi-info-circle" />
                <span>Ребенок пока не зарегистрирован ни на одну компетенцию</span>
              </div>
            </div>
          </div>
          <div
            v-else
            class="empty-state"
          >
            <i class="pi pi-users empty-icon" />
            <p class="empty-text">
              У вас пока нет детей
            </p>
            <p class="empty-subtitle">
              Добавьте ребенка для участия в чемпионате
            </p>
          </div>
        </div>
      </div>
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

    <!-- Диалог подробной информации о ребенке -->
    <Dialog
      v-model:visible="showChildDetailsDialog"
      header="Подробная информация о ребенке"
      :modal="true"
      :style="{ width: '800px', maxWidth: '90vw' }"
    >
      <div v-if="selectedChildDetails" class="child-details">
        <!-- Информация о ребенке -->
        <div class="details-section">
          <h4 class="section-title">
            <i class="pi pi-user" />
            Информация о ребенке
          </h4>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">ФИО:</span>
              <span class="detail-value">
                {{ `${selectedChildDetails.child.lastName} ${selectedChildDetails.child.firstName} ${selectedChildDetails.child.patronymic}` }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Возраст:</span>
              <span class="detail-value">
                {{ FormatManager.calculateAge(selectedChildDetails.child.dateOfBirth) }} лет
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Школа:</span>
              <span class="detail-value">
                {{ selectedChildDetails.child.childDocuments?.studyingPlace || 'Не указана' }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Класс:</span>
              <span class="detail-value">
                {{ selectedChildDetails.child.childDocuments?.learningClass || 'Не указан' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Информация о компетенции -->
        <div class="details-section">
          <h4 class="section-title">
            <i class="pi pi-star" />
            Компетенция
          </h4>
          <div class="competence-details">
            <div class="competence-name">
              {{ selectedChildDetails.competence.direction.name }}
            </div>
            <div class="competence-description">
              {{ selectedChildDetails.competence.direction.description }}
            </div>
            <div class="competence-expert">
              <i class="pi pi-user" />
              Главный эксперт: {{ expertNames.get(selectedChildDetails.competence.direction.expertId) || `ID ${selectedChildDetails.competence.direction.expertId}` }}
            </div>
          </div>
        </div>

        <!-- Информация о наставнике -->
        <div class="details-section">
          <h4 class="section-title">
            <i class="pi pi-users" />
            Наставник
          </h4>
          <div v-if="selectedChildDetails.child.mentor" class="mentor-info">
            <div class="mentor-details">
              <div class="detail-item">
                <span class="detail-label">ФИО:</span>
                <span class="detail-value">
                  {{ `${selectedChildDetails.child.mentor.lastName} ${selectedChildDetails.child.mentor.firstName} ${selectedChildDetails.child.mentor.patronymic}` }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">{{ selectedChildDetails.child.mentor.email }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Телефон:</span>
                <span class="detail-value">{{ FormatManager.formatMobileNumberFromDTO(selectedChildDetails.child.mentor.mobileNumber) }}</span>
              </div>
            </div>
            <div class="mentor-actions">
              <Button
                label="Изменить наставника"
                icon="pi pi-pencil"
                class="p-button-outlined p-button-sm"
                @click="openMentorSelectionDialog"
              />
            </div>
          </div>
          <div v-else class="no-mentor">
            <p class="no-mentor-text">
              <i class="pi pi-info-circle" />
              Наставник не выбран
            </p>
            <Button
              label="Выбрать наставника"
              icon="pi pi-plus"
              class="p-button-primary p-button-sm"
              @click="openMentorSelectionDialog"
            />
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Диалог выбора наставника -->
    <Dialog
      v-model:visible="showMentorSelectionDialog"
      header="Выбор наставника"
      :modal="true"
      :style="{ width: '600px', maxWidth: '90vw' }"
    >
      <div class="mentor-selection">
        <p class="selection-description">
          Выберите наставника для {{ selectedChildDetails?.child ? `${selectedChildDetails.child.lastName} ${selectedChildDetails.child.firstName} ${selectedChildDetails.child.patronymic}` : 'ребенка' }}
        </p>
        <div class="mentor-list">
          <!-- Опция "Я и являюсь наставником" -->
          <div 
            class="mentor-item parent-mentor-option"
            :class="{ 'selected': selectedMentorId === 'parent' }"
            @click="selectMentor('parent')"
          >
            <div class="mentor-info">
              <div class="mentor-name">
                <i class="pi pi-user" />
                Я и являюсь наставником
              </div>
              <div class="mentor-details">
                <span class="mentor-email">{{ user?.email }}</span>
                <span class="mentor-phone">{{ user?.mobileNumber ? FormatManager.formatMobileNumberFromDTO(user.mobileNumber) : '' }}</span>
              </div>
            </div>
            <div class="mentor-actions">
              <i v-if="selectedMentorId === 'parent'" class="pi pi-check selected-icon" />
            </div>
          </div>
          
          <!-- Список доступных наставников -->
          <div 
            v-for="mentor in availableMentors" 
            :key="mentor.id"
            class="mentor-item"
            :class="{ 'selected': selectedMentorId === mentor.id }"
            @click="selectMentor(mentor.id)"
          >
            <div class="mentor-info">
              <div class="mentor-name">
                {{ `${mentor.lastName} ${mentor.firstName} ${mentor.patronymic}` }}
              </div>
              <div class="mentor-details">
                <span class="mentor-email">{{ mentor.email }}</span>
                <span class="mentor-phone">{{ FormatManager.formatMobileNumberFromDTO(mentor.mobileNumber) }}</span>
              </div>
            </div>
            <div class="mentor-actions">
              <Button
                v-if="getSavedMentorIds.includes(mentor.id)"
                icon="pi pi-trash"
                class="p-button-danger p-button-sm p-button-text"
                @click.stop="removeMentorFromList(mentor.id)"
                v-tooltip="'Удалить из списка'"
              />
              <i v-if="selectedMentorId === mentor.id" class="pi pi-check selected-icon" />
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

    <ToastPopup :content="toastPopup" />
  </div>
</template>

<script lang="ts">
import Button from "primevue/button";
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
import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';
import { MentorLinksResolver } from '@/api/resolvers/mentorLinks/mentor-links.resolver.ts';
import type { ChildCompetenciesOutputDto } from '@/api/resolvers/childCompetencies/dto/output/child-competencies-output.dto.ts';

export default {
  name: "UserDashboardHome",
  components: {
    ToastPopup,
    AddChildForm,
    Button,
    Dialog,
  },
  data() {
    return {
      fileResolver: new FileResolver(),
      childResolver: new ChildResolver(),
      childDocumentsResolver: new ChildDocumentsResolver(),
      childCompetenciesResolver: new ChildCompetenciesResolver(),
      userResolver: new UserResolver(),
      mentorLinksResolver: new MentorLinksResolver(),
      userStore: useUserStore(),
      showAddChildDialog: false,
      isEditing: false,
      selectedChild: null as ChildOutputDto | null,
      selectedMentorId: null as null | number | string,

      // Новые свойства для компетенций и модальных окон
      showChildDetailsDialog: false,
      showMentorSelectionDialog: false,
      selectedChildDetails: null as { child: ChildOutputDto, competence: ChildCompetenciesOutputDto } | null,
      availableMentors: [] as UserOutputDto[],
      childCompetencies: [] as {
        child: ChildOutputDto,
        competencies: ChildCompetenciesOutputDto[]
      }[],
      expertsCache: new Map<number, UserOutputDto>(),
      expertNames: new Map<number, string>(),

      isLoading: false,
      addBirthFile: false,
      addSnilsFile: false,
      addConsentFile: false,
      addSchoolFile: false,
      addPlatformFile: false,

      toastPopup: {
        title: "",
        message: ""
      },

      childForm: {
        fullName: "",
        birthDate: "",
        snilsNumber: "",
        schoolName: "",
        platform: "",
        grade: null as number | null,
        childConsentFile: null as null | File,
        snilsScan: null as null | File,
        birthCertificate: null as null | File,
        schoolCertificate: null as null | File,
        platformCertificate: null as null | File,
      } as ChildFormFields,

      errors: {
        fullName: '',
        birthDate: '',
        snilsNumber: '',
        schoolName: '',
        platform: '',
        grade: '',
        snilsScan: '',
        schoolCertificate: '',
        birthCertificate: '',
        platformCertificate: ''
      } as ChildFormErrors
    };
  },
  computed: {
    FormatManager() {
      return FormatManager
    },
    user() {
      return this.userStore.user
    },
    getSavedMentorIds() {
      // Возвращаем ID наставников, которые уже связаны с родителем
      // В текущей реализации все доступные наставники считаются связанными
      return this.availableMentors.map(mentor => mentor.id);
    },
    debugInfo() {
      return {
        tempMentorId: typeof window !== 'undefined' ? localStorage.getItem('selectedMentorId') : null,
        savedMentorsCount: this.getSavedMentorIds.length,
        availableMentorsCount: this.availableMentors.length
      }
    }
  },
  watch: {
    showAddChildDialog() {
      this.errors = {
        birthCertificate: '',
        birthDate: '',
        childConsentFile: '',
        fullName: '',
        grade: '',
        platform: '',
        platformCertificate: '',
        schoolCertificate: '',
        schoolName: '',
        snilsNumber: '',
        snilsScan: ''
      }
    }
  },
  async mounted() {
    // Проверяем, есть ли сохраненный наставник после перехода по ссылке
    // Загружаем компетенции для всех детей
    await this.loadAllChildrenCompetencies();
    
    // Загружаем доступных наставников
    await this.loadAvailableMentors();
  },
  
  async activated() {
    // Обновляем список наставников при активации компонента
    // Это поможет обновить список после возврата с подтверждения ссылки
    await this.loadAvailableMentors();
  },
  methods: {
    validateForm() {
      let isValid = true
      // Валидация данных ребенка
      if (!this.childForm.fullName.trim()) {
        this.errors.fullName = "ФИО ребенка обязательно";
        isValid = false;
      }

      if (!this.childForm.birthDate) {
        this.errors.birthDate = "Дата рождения обязательна";
        isValid = false;
      } else if (!/^\d{2}\.\d{2}\.\d{4}$/.test(this.childForm.birthDate)) {
        this.errors.birthDate = "Введите дату в формате дд.мм.гггг";
        isValid = false;
      }

      if (!this.childForm.birthCertificate &&  (!this.isEditing || this.addBirthFile)) {
        this.errors.birthCertificate =
          "Необходимо загрузить скан свидетельства о рождении";
        isValid = false;
      }

      if (!this.childForm.snilsNumber && (!this.isEditing || this.addSnilsFile)) {
        this.errors.snilsNumber = "Номер СНИЛС обязателен";
        isValid = false;
      }

      if (!this.childForm.snilsScan && (!this.isEditing || this.addSnilsFile)) {
        this.errors.snilsScan = "Необходимо загрузить скан СНИЛС";
        isValid = false;
      }

      if (!this.childForm.schoolName && (!this.isEditing || this.addSchoolFile)) {
        this.errors.schoolName = "Название учреждения обязательно";
        isValid = false;
      }

      if (this.childForm.grade === null && (!this.isEditing || this.addSchoolFile)) {
        this.errors.grade = "Класс обучения обязателен";
        isValid = false;
      }

      if (!this.childForm.platform && (!this.isEditing || this.addPlatformFile)) {
        this.errors.platform = "Выберите площадку подготовки";
        isValid = false;
      }

      if (!this.childForm.schoolCertificate && (!this.isEditing || this.addSchoolFile)) {
        this.errors.schoolCertificate = "Необходимо загрузить справку из ОУ";
        isValid = false;
      }

      if (!this.childForm.platformCertificate && (!this.isEditing || this.addPlatformFile)) {
        this.errors.platformCertificate =
          "Необходимо загрузить справку из площадки подготовки";
        isValid = false;
      }

      if (!this.childForm.childConsentFile && (!this.isEditing || this.addConsentFile)) {
        this.errors.childConsentFile =
          "Необходимо загрузить согласие на обработку персональных данных";
        isValid = false;
      }
      
      return isValid
    },
    clearChildForm() {
      this.childForm = {
        birthCertificate: null,
        birthDate: '',
        childConsentFile: null,
        fullName: '',
        grade: null,
        platform: '',
        platformCertificate: null,
        schoolCertificate: null,
        schoolName: '',
        snilsNumber: '',
        snilsScan: null

      }
    },
    fillNewChild() {
      this.selectedChild = null
      this.clearChildForm()
      this.isEditing = false
      this.showAddChildDialog = true;
    },
    editChild(child: ChildOutputDto) {
      this.clearChildForm()
      this.isEditing = child.childDocuments !== null
      this.showAddChildDialog = true
      this.childForm.fullName = `${child.lastName} ${child.firstName} ${child.patronymic}`
      this.childForm.birthDate = FormatManager.formatBirthDateFromDTO(child.dateOfBirth)
      this.selectedChild = child
    },
    async addChild() {
      if (this.user === null || !this.validateForm()) return
      this.isLoading = true;
      if (this.selectedChild !== null && (this.isEditing || this.selectedChild.childDocuments === null)) {
        await this.childResolver.update({
          id: this.selectedChild.id,
          lastName: this.childForm.fullName.split(" ")[0],
          firstName: this.childForm.fullName.split(" ")[1],
          patronymic: this.childForm.fullName.split(" ")[2],
          dateOfBirth: FormatManager.formatBirthDateToDTO(this.childForm.birthDate),
          mentorId: null
        })
        await this.addChildDocs(this.selectedChild)
      } else {
        const childResponse = await this.childResolver.create({
          userId: this.user.id,
          lastName: this.childForm.fullName.split(" ")[0],
          firstName: this.childForm.fullName.split(" ")[1],
          patronymic: this.childForm.fullName.split(" ")[2],
          dateOfBirth: FormatManager.formatBirthDateToDTO(this.childForm.birthDate),
          mentorId: null
        })
        await this.addChildDocs(childResponse.message)
      }
      await this.userStore.fillChildren()
      this.isLoading = false
      this.showAddChildDialog = false
    },
    async addChildDocs(child: ChildOutputDto | string) {
      if (this.selectedChild === null || this.selectedChild.childDocuments === null) {
        if (this.childForm.childConsentFile !== null
          && this.childForm.schoolCertificate !== null
          && this.childForm.birthCertificate !== null
          && this.childForm.platformCertificate !== null
          && this.childForm.snilsScan !== null
          && this.childForm.grade !== null
          && this.user !== null
          && typeof child !== "string") {
          const response = await this.childDocumentsResolver.create({
            childId: child.id,
            additionalStudyingCertificateFile: this.childForm.platformCertificate,
            birthCertificateFile: this.childForm.birthCertificate,
            consentToChildPdpFile: this.childForm.childConsentFile,
            learningClass: this.childForm.grade,
            parentRole: this.user.children.length > 0
              ? this.user.children[0].childDocuments!.parentRole
              : "Не указано",
            snilsFile: this.childForm.snilsScan,
            snilsNumber: FormatManager.formatSnilsToDTO(this.childForm.snilsNumber),
            studyingCertificateFile: this.childForm.schoolCertificate,
            studyingPlace: this.childForm.schoolName,
            trainingGround: this.childForm.platform
          })
          if (typeof response.message === "string") {
            this.toastPopup = {
              title: `Ошибка ${response.status.toString()} при загрузке документов`,
              message: response.message
            }
          }
        }
      } else if (this.addBirthFile || this.addSnilsFile
        || this.addSchoolFile || this.addPlatformFile
        || this.addConsentFile) {
        await this.childDocumentsResolver.update({
          id: this.selectedChild!.childDocuments!.id,
          additionalStudyingCertificateFile: this.childForm.platformCertificate,
          birthCertificateFile: this.childForm.birthCertificate,
          consentToChildPdpFile: this.childForm.childConsentFile,
          learningClass: this.childForm.grade ?? this.selectedChild!.childDocuments!.learningClass,
          parentRole: this.selectedChild!.childDocuments!.parentRole,
          snilsFile: this.childForm.snilsScan,
          snilsNumber: this.childForm.snilsNumber
            ? FormatManager.formatSnilsToDTO(this.childForm.snilsNumber)
            : this.selectedChild!.childDocuments!.snilsNumber,
          studyingCertificateFile: this.childForm.schoolCertificate,
          studyingPlace: this.childForm.schoolName ?? this.selectedChild!.childDocuments!.studyingPlace,
          trainingGround: this.childForm.platform ?? this.selectedChild!.childDocuments!.trainingGround,
        })
      }
    },
    // Методы для работы с компетенциями
    getCompetenciesByChildId(childId: number) {
      const competencies = this.childCompetencies.find(row => row.child.id === childId)?.competencies
      return competencies ? competencies : []
    },
    getMentorName(child: ChildOutputDto) {
      if (child.mentor) {
        return `${child.mentor.lastName} ${child.mentor.firstName} ${child.mentor.patronymic}`;
      }
      return 'Наставник не назначен';
    },
    async loadCompetenciesByChild(child: ChildOutputDto) {
      try {
        console.log(`Загружаем компетенции для ребенка ID: ${child.id}`);
        const response = await this.childCompetenciesResolver.getByChildId(child.id)
        
        if (typeof response.message === "string" || response.status !== 200) {
          console.error(`Ошибка при загрузке компетенций для ребенка ${child.id}:`, {
            status: response.status,
            message: response.message
          });
          return;
        }
        
        console.log(`Успешно загружены компетенции для ребенка ${child.id}:`, response.message);
        this.childCompetencies.push({
          child: child,
          competencies: response.message
        });
      } catch (error) {
        console.error(`Критическая ошибка при загрузке компетенций для ребенка ${child.id}:`, error);
      }
    },
    async loadCompetenciesByChildWithRetry(child: ChildOutputDto, maxRetries: number = 3) {
      let lastError: any = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Попытка ${attempt}/${maxRetries} загрузки компетенций для ребенка ${child.id}`);
          await this.loadCompetenciesByChild(child);
          return; // Успешно загружено
        } catch (error) {
          lastError = error;
          console.warn(`Попытка ${attempt} неудачна для ребенка ${child.id}:`, error);
          
          if (attempt < maxRetries) {
            // Экспоненциальная задержка: 1s, 2s, 4s
            const delay = Math.pow(2, attempt - 1) * 1000;
            console.log(`Повторная попытка через ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      console.error(`Не удалось загрузить компетенции для ребенка ${child.id} после ${maxRetries} попыток:`, lastError);
    },
    async loadAllChildrenCompetencies() {
      if (!this.user?.children) return;

      try {
        console.log(`Начинаем загрузку компетенций для ${this.user.children.length} детей`);
        
        // Ограничиваем количество параллельных запросов (максимум 3 одновременно)
        const batchSize = 3;
        const children = this.user.children;
        
        for (let i = 0; i < children.length; i += batchSize) {
          const batch = children.slice(i, i + batchSize);
          const batchPromises = batch.map(child => this.loadCompetenciesByChildWithRetry(child));
          await Promise.all(batchPromises);
          
          // Небольшая задержка между батчами для снижения нагрузки на сервер
          if (i + batchSize < children.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        // Загружаем имена экспертов для всех компетенций
        await this.loadExpertNames();
        console.log('Загрузка компетенций завершена');
      } catch (error) {
        console.error('Ошибка при загрузке компетенций:', error);
      }
    },
    async loadExpertNames() {
      const expertIds = new Set<number>();
      
      // Собираем все уникальные ID экспертов
      this.childCompetencies.forEach(row => {
        row.competencies.forEach(competence => {
          expertIds.add(competence.direction.expertId);
        });
      });

      // Загружаем имена экспертов
      const promises = Array.from(expertIds).map(async (expertId) => {
        if (!this.expertNames.has(expertId)) {
          const expertName = await this.getExpertName(expertId);
          this.expertNames.set(expertId, expertName);
        }
      });

      await Promise.all(promises);
    },
    async getExpertName(expertId: number): Promise<string> {
      // Проверяем кэш
      if (this.expertsCache.has(expertId)) {
        const expert = this.expertsCache.get(expertId)!;
        return `${expert.lastName} ${expert.firstName} ${expert.patronymic}`;
      }

      try {
        // Загружаем данные эксперта
        const response = await this.userResolver.getById(expertId);
        if (typeof response.message === "string" || response.status !== 200) {
          return `ID ${expertId}`;
        }

        const expert = response.message;
        // Сохраняем в кэш
        this.expertsCache.set(expertId, expert);
        return `${expert.lastName} ${expert.firstName} ${expert.patronymic}`;
      } catch (error) {
        console.error('Ошибка при загрузке эксперта:', error);
        return `ID ${expertId}`;
      }
    },
    // Методы для модальных окон
    openChildDetailsDialog(child: ChildOutputDto, competence: ChildCompetenciesOutputDto) {
      this.selectedChildDetails = { child, competence };
      this.showChildDetailsDialog = true;
    },
    async openMentorSelectionDialog() {
      // Загружаем наставников с сервера
      await this.loadAvailableMentors();
      this.showMentorSelectionDialog = true;
    },
    
    async loadAvailableMentors() {
      try {
        if (!this.userStore.user) {
          this.toastPopup = {
            title: 'Ошибка',
            message: 'Пользователь не авторизован'
          };
          return;
        }

        console.log('Загружаем наставников для родителя:', this.userStore.user.id, 'тип:', typeof this.userStore.user.id);
        
        // Загружаем все связи наставников
        const response = await this.mentorLinksResolver.getAll();
        
        console.log('Ответ сервера (все связи):', response);
        
        if (response.status === 200 && typeof response.message !== "string") {
          // Фильтруем связи, где родитель является текущим пользователем
          // В MentorLinkOutputDto поле user содержит данные наставника
          const mentorLinks = response.message || [];
          console.log('Все связи наставников:', mentorLinks);
          
          // Пока что показываем всех наставников, так как логика связей не ясна
          // TODO: Нужно уточнить у бэкендера, как определяется связь родитель-наставник
          this.availableMentors = mentorLinks.map(link => link.user);
          console.log('Загружены наставники:', this.availableMentors);
        } else {
          console.warn('Не удалось загрузить наставников:', response);
          this.availableMentors = [];
        }
      } catch (error) {
        console.error('Ошибка при загрузке наставников:', error);
        this.toastPopup = {
          title: 'Ошибка',
          message: 'Не удалось загрузить список наставников'
        };
      }
    },
    async removeMentorFromList(mentorId: number) {
      // Удаляем связь родитель-наставник с сервера
      if (this.userStore.user) {
        try {
          // Получаем все связи и находим нужную
          const response = await this.mentorLinksResolver.getAll();
          
          if (response.status === 200 && typeof response.message !== "string") {
            const mentorLinks = response.message || [];
            // Находим связь с нужным наставником
            const mentorLink = mentorLinks.find(link => link.user.id === mentorId);
            
            if (mentorLink) {
              await this.mentorLinksResolver.deleteById(mentorLink.id);
              console.log(`Удалена связь с наставником ID: ${mentorId}`);
            }
          }
          
          // Обновляем список наставников
          this.availableMentors = this.availableMentors.filter(mentor => mentor.id !== mentorId);
          
          this.toastPopup = {
            title: 'Успех',
            message: 'Наставник удален из списка'
          };
        } catch (error) {
          console.error('Ошибка при удалении наставника:', error);
          this.toastPopup = {
            title: 'Ошибка',
            message: 'Не удалось удалить наставника'
          };
        }
      }
    },
    selectMentor(mentorId: number | string) {
      this.selectedMentorId = mentorId;
    },
    closeMentorSelectionDialog() {
      this.showMentorSelectionDialog = false;
      this.selectedMentorId = null;
    },
    async saveMentorSelection() {
      if (!this.selectedChildDetails || !this.selectedMentorId) return;

      try {
        let mentorId = null;
        
        // Определяем ID наставника
        if (this.selectedMentorId === 'parent') {
          // Если родитель выбирает себя, используем его ID
          mentorId = this.user?.id || null;
        } else {
          // Если выбран другой наставник
          mentorId = this.selectedMentorId as number;
        }

        // Обновляем наставника для ребенка
        await this.childResolver.update({
          id: this.selectedChildDetails.child.id,
          lastName: this.selectedChildDetails.child.lastName,
          firstName: this.selectedChildDetails.child.firstName,
          patronymic: this.selectedChildDetails.child.patronymic,
          dateOfBirth: this.selectedChildDetails.child.dateOfBirth,
          mentorId: mentorId
        });

        // Обновляем данные пользователя
        await this.userStore.fillChildren();
        
        // Сохраняем связь родитель-наставник на сервере
        if (this.userStore.user && mentorId !== null) {
          await this.mentorLinksResolver.create({
            userId: mentorId
          });
        }
        
        this.toastPopup = {
          title: 'Успех',
          message: 'Наставник успешно назначен'
        };
        
        this.closeMentorSelectionDialog();
        this.showChildDetailsDialog = false;
      } catch (error) {
        console.error('Ошибка при сохранении наставника:', error);
        this.toastPopup = {
          title: 'Ошибка',
          message: 'Не удалось сохранить наставника'
        };
      }
    }
  }
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
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 1.5rem;
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
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

.header-button {
  background: white !important;
  color: #ff9800 !important;
  border: 2px solid white !important;
  font-weight: 600 !important;
}

.header-button:hover {
  background: #f8f9fa !important;
  color: #f57c00 !important;
  border-color: #f8f9fa !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

.competencies-preview {
  text-align: center;
}

.preview-text {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-weight: 500;
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
.participants-preview {
  text-align: center;
}

.preview-text {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.mentor-available-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #e8f5e8;
  border: 1px solid #28a745;
  border-radius: 6px;
  color: #155724;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.mentor-available-notice i {
  color: #28a745;
}

/* Стили для компетенций */
.competencies-section {
  margin-top: 1rem;
}

.competencies-scrollable {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

/* Кастомный скроллбар для WebKit браузеров */
.competencies-scrollable::-webkit-scrollbar {
  width: 6px;
}

.competencies-scrollable::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.competencies-scrollable::-webkit-scrollbar-thumb {
  background: #ff9800;
  border-radius: 3px;
}

.competencies-scrollable::-webkit-scrollbar-thumb:hover {
  background: #f57c00;
}

.child-competencies {
  margin-bottom: 2rem;
}

.child-competencies:last-child {
  margin-bottom: 0;
}

.child-name {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #ff9800;
  padding-bottom: 0.5rem;
}

.competencies-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.competence-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #ff9800;
  cursor: pointer;
  transition: all 0.3s ease;
}

.competence-item:hover {
  background: #e3f2fd;
  border-left-color: #2196f3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
}

.competence-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.competence-item:hover .competence-icon {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  transform: scale(1.1);
}

.competence-info {
  flex: 1;
}

.competence-name {
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  transition: color 0.3s ease;
}

.competence-item:hover .competence-name {
  color: #2196f3;
}

.competence-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.competence-item:hover .competence-description {
  color: #1976d2;
}

.competence-expert {
  color: #ff9800;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;
}

.competence-mentor {
  color: #28a745;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;
  margin-top: 0.25rem;
}

.competence-item:hover .competence-expert {
  color: #1976d2;
}

.competence-item:hover .competence-mentor {
  color: #1976d2;
}

  /* Мобильные стили для touch устройств */
  @media (max-width: 768px) {
    .competence-item:active {
      background: #e3f2fd;
      border-left-color: #2196f3;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
    }
    
    .competence-item:active .competence-icon {
      background: linear-gradient(135deg, #2196f3, #1976d2);
      transform: scale(1.05);
    }
    
    .competence-item:active .competence-name {
      color: #2196f3;
    }
    
    .competence-item:active .competence-description {
      color: #1976d2;
    }
    
    .competence-item:active .competence-expert {
      color: #1976d2;
    }
    
    .competence-item:active .competence-mentor {
      color: #1976d2;
    }
  }

.no-competencies {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #6c757d;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #6c757d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #dee2e6;
}

.empty-text {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.empty-subtitle {
  font-size: 0.9rem;
  margin: 0;
}

/* Стили для модальных окон */
.child-details {
  max-height: 70vh;
  overflow-y: auto;
}

.details-section {
  margin-bottom: 2rem;
}

.details-section:last-child {
  margin-bottom: 0;
}

.section-title {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #ff9800;
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 500;
}

.detail-value {
  color: #2c3e50;
  font-weight: 500;
}

.competence-details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #ff9800;
}

.competence-details .competence-name {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.competence-details .competence-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.competence-details .competence-expert {
  color: #ff9800;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mentor-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #28a745;
}

.mentor-details {
  margin-bottom: 1rem;
}

.mentor-actions {
  display: flex;
  justify-content: flex-end;
}

.no-mentor {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #6c757d;
}

.no-mentor-text {
  color: #6c757d;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Стили для выбора наставника */
.mentor-selection {
  max-height: 60vh;
  overflow-y: auto;
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
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mentor-item:hover {
  background: #e9ecef;
  border-color: #ff9800;
}

.mentor-item.selected {
  background: #fff3cd;
  border-color: #ff9800;
}

.parent-mentor-option {
  background: #e8f5e8;
  border-color: #28a745;
}

.parent-mentor-option:hover {
  background: #d4edda;
  border-color: #28a745;
}

.parent-mentor-option.selected {
  background: #c3e6cb;
  border-color: #28a745;
}

.parent-mentor-option .mentor-name {
  color: #155724;
  font-weight: 600;
}

.parent-mentor-option .mentor-name i {
  margin-right: 0.5rem;
  color: #28a745;
}

.mentor-info {
  flex: 1;
}

.mentor-name {
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.mentor-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mentor-email,
.mentor-phone {
  color: #6c757d;
  font-size: 0.85rem;
}

.mentor-actions {
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
}

/* Мобильные стили для новых компонентов */
@media (max-width: 768px) {
  .competencies-scrollable {
    max-height: 300px;
  }
  
  .card-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .competence-item {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .competence-icon {
    align-self: flex-start;
  }
  
  .mentor-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .mentor-actions {
    align-self: flex-end;
  }
}

/* Для очень маленьких экранов */
@media (max-width: 480px) {
  .competencies-scrollable {
    max-height: 250px;
  }
}
</style>
