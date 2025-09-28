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
              <span class="data-value">{{ formatMobileNumber(user.mobileNumber) }}</span>
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
          <h3 class="card-title">
            <i class="pi pi-list" />
            Список детей
          </h3>
        </div>
        <div class="card-content">
          <div
            class="competencies-preview"
          >
            <p class="preview-text">
              Всего детей: {{ user.children.length }}
            </p>
            <Button
              label="Добавить ребёнка"
              icon="pi pi-plus"
              class="p-button-primary"
              @click="showAddChildDialog = true"
            />
          </div>
        </div>
      </div>
    </div>
    <ChildrenList
      :children="user.children"
      @update:children-list="userStore.fillChildren"
      @open:child-form="(child) => editChild(child)"
    />
    <Dialog
      v-model:visible="showAddChildDialog"
      :header="
        isEditing ? 'Редактировать ребёнка' : 'Добавить ребёнка'
      "
      :modal="true"
      :style="{ width: '600px' }"
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
        />
      </form>
    </Dialog>
  </div>
</template>

<script lang="ts">
import Button from "primevue/button";
import { useUserStore } from '@/stores/userStore.ts';
import ChildrenList from '@/components/ChildrenList.vue';
import Dialog from 'primevue/dialog';
import AddChildForm, { type ChildFormErrors, type ChildFormFields } from '@/components/AddChildForm.vue';
import { ChildDocumentsResolver } from '@/api/resolvers/childDocuments/child-documents.resolver.ts';
import { ChildResolver } from '@/api/resolvers/child/child.resolver.ts';
import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';
import { FileResolver } from '@/api/resolvers/files/file.resolver.ts';

export default {
  name: "UserDashboardHome",
  components: {
    AddChildForm,
    ChildrenList,
    Button,
    Dialog,
  },
  data() {
    return {
      fileResolver: new FileResolver(),
      childResolver: new ChildResolver(),
      childDocumentsResolver: new ChildDocumentsResolver(),
      userStore: useUserStore(),
      showAddChildDialog: false,
      isEditing: false,
      selectedChild: null as ChildOutputDto | null,

      addBirthFile: false,
      addSnilsFile: false,
      addConsentFile: false,
      addSchoolFile: false,
      addPlatformFile: false,

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
    user() {
      return this.userStore.user
    },
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
  methods: {
    reformatBirthDate(birthDate: string) {
      const parts = birthDate.split("-");
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    },
    formatBirthDate(birthDate: string) {
      const [day, month, year] = birthDate.split('.').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));

      return date.toISOString();
    },
    formatMobileNumber(number: string) {
      return `${number.substring(0, 2)}
              (${number.substring(2, 5)})
              ${number.substring(5, 8)}
              ${number.substring(8, 10)}
              -${number.substring(10, 12)}`;
    },
    formatSnils(number: string) {
      return [
        number.substring(0, 3),
        number.substring(4, 7),
        number.substring(8, 11),
        number.substring(12, 14)
      ].join('')
    },
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
    async editChild(child: ChildOutputDto) {
      this.isEditing = true
      this.showAddChildDialog = true
      this.childForm.fullName = `${child.lastName} ${child.firstName} ${child.patronymic}`
      this.childForm.birthDate = this.reformatBirthDate(child.dateOfBirth)
      this.selectedChild = child
    },
    async addChild() {
      if (this.user === null || !this.validateForm()) return
      if (this.isEditing && this.selectedChild !== null) {
        await this.childResolver.update({
          id: this.selectedChild.id,
          lastName: this.childForm.fullName.split(" ")[0],
          firstName: this.childForm.fullName.split(" ")[1],
          patronymic: this.childForm.fullName.split(" ")[2],
          dateOfBirth: this.formatBirthDate(this.childForm.birthDate),
          mentorId: null
        })
        if (this.addBirthFile || this.addSnilsFile
          || this.addSchoolFile || this.addPlatformFile
          || this.addPlatformFile) {
          await this.childDocumentsResolver.update({
            id: this.selectedChild.childDocuments.id,
            additionalStudyingCertificateFile: this.childForm.platformCertificate,
            birthCertificateFile: this.childForm.birthCertificate,
            consentToChildPdpFile: this.childForm.childConsentFile,
            learningClass: this.childForm.grade ?? this.selectedChild.childDocuments.learningClass,
            parentRole: this.selectedChild.childDocuments.parentRole,
            snilsFile: this.childForm.snilsScan,
            snilsNumber: this.childForm.snilsNumber
              ? this.formatSnils(this.childForm.snilsNumber)
              : this.selectedChild.childDocuments.snilsNumber,
            studyingCertificateFile: this.childForm.schoolCertificate,
            studyingPlace: this.childForm.schoolName ?? this.selectedChild.childDocuments.studyingPlace,
            trainingGround: this.childForm.platform ?? this.selectedChild.childDocuments.trainingGround,
          })
        }
      } else {
        const childResponse = await this.childResolver.create({
          userId: this.user.id,
          lastName: this.childForm.fullName.split(" ")[0],
          firstName: this.childForm.fullName.split(" ")[1],
          patronymic: this.childForm.fullName.split(" ")[2],
          dateOfBirth: this.formatBirthDate(this.childForm.birthDate),
          mentorId: null
        })
        if (this.childForm.childConsentFile !== null
          && this.childForm.schoolCertificate !== null
          && this.childForm.birthCertificate !== null
          && this.childForm.platformCertificate !== null
          && this.childForm.snilsScan !== null
          && this.childForm.grade !== null
          && typeof childResponse.message !== "string") {
          await this.childDocumentsResolver.create({
            childId: childResponse.message.id,
            additionalStudyingCertificateFile: this.childForm.platformCertificate,
            birthCertificateFile: this.childForm.birthCertificate,
            consentToChildPdpFile: this.childForm.childConsentFile,
            learningClass: this.childForm.grade,
            parentRole: this.user.children[0].childDocuments.parentRole,
            snilsFile: this.childForm.snilsScan,
            snilsNumber: this.formatSnils(this.childForm.snilsNumber),
            studyingCertificateFile: this.childForm.schoolCertificate,
            studyingPlace: this.childForm.schoolName,
            trainingGround: this.childForm.platform
          })
        }
      }
      await this.userStore.fillChildren()
      this.showAddChildDialog = false
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

.mentor-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

/* Стили для выбранных компетенций */
.selected-competencies {
  margin: 1rem 0;
}

.competence-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  border-left: 3px solid #ff9800;
}

.competence-item:last-child {
  margin-bottom: 0;
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
}

.competence-info {
  flex: 1;
}

.competence-name {
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.competence-status {
  color: #6c757d;
  margin: 0;
  font-size: 0.85rem;
  font-weight: 500;
}

.competencies-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;
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

  .mentor-info {
    flex-direction: column;
    text-align: center;
  }

  .competencies-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .competence-item {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
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

  .mentor-avatar {
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
  }

  .mentor-name {
    font-size: 0.95rem;
  }

  .contact-item {
    font-size: 0.8rem;
  }

  .competence-item {
    padding: 0.5rem;
  }

  .competence-icon {
    width: 30px;
    height: 30px;
    font-size: 0.9rem;
  }

  .competence-name {
    font-size: 0.85rem;
  }

  .competence-status {
    font-size: 0.75rem;
  }

  .empty-state {
    padding: 1rem 0.25rem;
  }

  .empty-icon {
    font-size: 2rem;
  }

  .empty-text {
    font-size: 0.9rem;
  }

  .empty-subtitle {
    font-size: 0.8rem;
  }
}
</style>
