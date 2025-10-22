<script lang="ts">

import type {ChildOutputDto} from '@/api/resolvers/child/dto/output/child-output.dto.ts';
import type {PropType} from 'vue';
import Button from 'primevue/button';
import {FormatManager} from '@/utils/FormatManager.ts';
import {ChildResolver} from '@/api/resolvers/child/child.resolver.ts';
import {useUserStore} from '@/stores/userStore.ts';
import {useAgeGroups} from '@/shared/UseAgeGroups.ts';
import type {DocsOutputFileUploadDto} from '@/api/resolvers/files/dto/output/docs-output-file-upload.dto.ts';
import {Roles} from '@/state/UserState.types.ts';
import {CompetenceDocumentsResolver} from '@/api/resolvers/competenceDocuments/competence-documents.resolver.ts';
import {FileType} from '@/api/resolvers/files/file.resolver.ts';
import apiConf from '@/api/api.conf.ts';
import {QueueStatuses} from '@/api/resolvers/childCompetencies/types.ts';
import {useQueueStatuses} from '@/shared/UseQueueStatuses.ts';
import type {AgeCategories} from '@/api/resolvers/ageCategory/ageCategories.ts';
import InputText from 'primevue/inputtext';
import { ChildCompetenciesResolver } from '@/api/resolvers/childCompetencies/child-competencies.resolver.ts';

export type ChildDetailsDialogData = {
  child: ChildOutputDto;
  childDocs: {
    birthFile: DocsOutputFileUploadDto,
    snilsFile: DocsOutputFileUploadDto,
    schoolFile: DocsOutputFileUploadDto,
    platformFile: DocsOutputFileUploadDto,
    consentFile: DocsOutputFileUploadDto,
  } | null,
  competencies: {
    id: number;
    name: string;
    description: string;
    queueStatus: QueueStatuses,
    expert: {
      lastName: string;
      firstName: string;
      patronymic: string;
    },
    assignId: number;
    teacherName: string | null;
    institution: string | null;
    post: string | null;
  }[]
}

type TeacherInfo = {
  assignId: number;
  teacherName: string | null;
  institution: string | null;
  post: string | null;
}

export default {
  name: 'ChildrenList',
  components: {
    Button,
    InputText
  },
  props: {
    childrenDetails: {
      type: Array as PropType<ChildDetailsDialogData[]>,
      required: true
    }
  },
  emits: [
    "edit-child",
    "edit-mentor",
    "update-toast-popup",
    "update-children",
  ],
  data() {
    return {
      childResolver: new ChildResolver(),
      competenceDocumentsResolver: new CompetenceDocumentsResolver(),
      childCompetenceResolver: new ChildCompetenciesResolver(),
      userStore: useUserStore(),
      ageGroups: useAgeGroups,
      queueStatuses: useQueueStatuses,
      blockedCompetencesId: [30, 38, 39, 44, 48, 52, 53, 66, 69, 78, 79, 90, 99, 105, 106, 107, 108, 119, 121, 126],
      originalChildrenDetails: JSON.parse(JSON.stringify(this.childrenDetails)) as ChildDetailsDialogData[],
      teacherFormsErrors: [] as {
        assignId: number;
        teacherName: string,
        institution: string,
        post: string,
      }[]
    }
  },
  computed: {
    QueueStatuses() {
      return QueueStatuses
    },
    FileType() {
      return FileType
    },
    Roles() {
      return Roles
    },
    FormatManager() {
      return FormatManager
    },
  },
  watch: {
    childrenDetails() {
      this.originalChildrenDetails = JSON.parse(JSON.stringify(this.childrenDetails)) as ChildDetailsDialogData[]
    },
  },
  methods: {
    async deleteChild(child: ChildOutputDto) {
      if (confirm(
          `Вы уверены что хотите удалить ребенка '${child.firstName}'?`
      )) {
        const response = await this.childResolver.deleteById(child.id)
        if (response.status === 200) {
          await this.userStore.fillChildren()
          this.$emit("update-children")
        }
      }
    },
    async competenceDocuments(competenceId: number) {
      const response = await this.competenceDocumentsResolver.getAllByCompetenceId(competenceId)
      if (typeof response.message !== "string") return response.message
      return []
    },
    async viewCompetenceDocument(competenceId: number, docType: FileType, ageCategory: AgeCategories | undefined) {
      const docs = await this.competenceDocuments(competenceId)
      const doc = docs.find(d => d.documentType === docType && d.ageCategory === ageCategory)
      if (doc)
        window.open(`${apiConf.endpoint}/file-service/v1/files/view/${doc.documentId}`, '_blank');
    },
    async downloadCompetenceDocument(competenceId: number, docType: FileType, ageCategory: AgeCategories | undefined) {
      const docs = await this.competenceDocuments(competenceId)
      const doc = docs.find(d => d.documentType === docType && d.ageCategory === ageCategory)
      if (doc)
        window.location.href = `${apiConf.endpoint}/file-service/v1/files/download/${doc.documentId}`;
    },
    checkDocument(doc: DocsOutputFileUploadDto) {
      if (!doc || !doc.id) {
        this.$emit("update-toast-popup", {
          title: 'Ошибка',
          message: 'Документ недоступен для просмотра'
        });
        return false;
      }
      return true
    },
    viewDocument(doc: DocsOutputFileUploadDto) {
      if (this.checkDocument(doc))
        window.open(`${apiConf.endpoint}/file-service/v1/files/view/${doc.id}`, '_blank');
    },
    downloadDocument(doc: DocsOutputFileUploadDto) {
      if (this.checkDocument(doc))
        window.location.href = `${apiConf.endpoint}/file-service/v1/files/download/${doc.id}`;
    },
    compareDetails(childId: number, competenceId: number) {
      const competenceInfo = this.childrenDetails
        .find(childDetails => childDetails.child.id === childId)?.competencies
        ?.find(competence => competence.id === competenceId);
      const originalCompetenceInfo = this.originalChildrenDetails
        .find(childDetails => childDetails.child.id === childId)?.competencies
        ?.find(competence => competence.id === competenceId);
      if (!competenceInfo || !originalCompetenceInfo) return false;
      return (
        competenceInfo.teacherName === originalCompetenceInfo.teacherName &&
        competenceInfo.institution === originalCompetenceInfo.institution &&
        competenceInfo.post === originalCompetenceInfo.post
      );
    },
    getTeacherFormErrorsByAssignId(id: number) {
      let formErrors = this.teacherFormsErrors.find(form => form.assignId === id)
      if (!formErrors) {
        formErrors = {
          assignId: id,
          teacherName: "",
          institution: "",
          post: ""
        }
        this.teacherFormsErrors.push(formErrors)
      }
      return formErrors
    },
    validateForm(teacherInfo: TeacherInfo) {
      let isValid = true
      const formErrors = this.getTeacherFormErrorsByAssignId(teacherInfo.assignId)

      if (!(teacherInfo.teacherName === null &&
        teacherInfo.institution === null &&
        teacherInfo.post === null)
      ) {
        teacherInfo.teacherName = teacherInfo.teacherName ?? ""
        teacherInfo.institution = teacherInfo.institution ?? ""
        teacherInfo.post = teacherInfo.post ?? ""
      }
      if (teacherInfo.teacherName === "") {
        formErrors.teacherName = "ФИО педагога не может быть пустым!"
        isValid = false
      } else formErrors.teacherName = ""

      if (teacherInfo.institution === "") {
        formErrors.institution = "Образовательное учреждение не может быть пустым!"
        isValid = false
      } else formErrors.institution = ""

      if (teacherInfo.post === "") {
        formErrors.post = "Должность педагога не может быть пустой!"
        isValid = false
      } else formErrors.post = ""

      return isValid
    },
    async updateTeacherInfo(childId: number, teacherInfo: TeacherInfo) {
      if (this.validateForm(teacherInfo)) {
        const response = await this.childCompetenceResolver.setTeacherInfo({
          ...teacherInfo,
          id: teacherInfo.assignId,
        })
        if (response.status === 200) {
          const originalCompetenceInfo = this.originalChildrenDetails
            .find(origChildDetails => origChildDetails.child.id === childId)?.competencies
            .find(competence => competence.assignId === teacherInfo.assignId)
          if (originalCompetenceInfo) {
            originalCompetenceInfo.teacherName = teacherInfo.teacherName
            originalCompetenceInfo.institution = teacherInfo.institution
            originalCompetenceInfo.post = teacherInfo.post
          }
        }
        this.$emit('update-toast-popup', response.status, response.message)
      }
    },
  }
};
</script>

<template>
  <div class="experts-grid">
    <div
      v-for="childDetails in childrenDetails"
      :key="childDetails.child.id"
      class="expert-card"
    >
      <div class="expert-header">
        <div class="expert-avatar">
          <i class="pi pi-user" />
        </div>
        <div class="expert-info">
          <h3 class="expert-name">
            {{
              childDetails.child.lastName +
                " " +
                childDetails.child.firstName +
                " " +
                childDetails.child.patronymic
            }}
          </h3>
        </div>
        <div class="expert-actions">
          <Button
            v-tooltip="'Редактировать данные ребенка'"
            icon="pi pi-pencil"
            disabled
            class="p-button-secondary p-button-sm edit-button"
            @click="$emit('edit-child', childDetails.child)"
          />
          <Button
            v-tooltip="'Удалить'"
            icon="pi pi-trash"
            disabled
            class="p-button-secondary p-button-sm"
            @click="deleteChild(childDetails.child)"
          />
        </div>
      </div>

      <div class="expert-content">
        <div class="expert-details">
          <div class="detail-item">
            <span class="detail-label">Возрастная группа:</span>
            <span class="detail-value">
              {{ ageGroups.find(group => group.value === childDetails?.child.childDocuments?.ageCategory)?.label }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Образовательное учреждение:</span>
            <span class="detail-value">
              {{ childDetails.child.childDocuments?.studyingPlace || 'Не указано' }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Площадка подготовки:</span>
            <span class="detail-value">
              {{ childDetails.child.childDocuments?.trainingGround || 'Не указано' }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">СНИЛС:</span>
            <span class="detail-value">
              {{
                childDetails.child.childDocuments !== null
                  ? FormatManager.formatSnilsFromDTO(childDetails.child.childDocuments.snilsNumber)
                  : 'Не указан'
              }}
            </span>
          </div>
          <div
            v-if="childDetails.child.childDocuments !== null &&
              childDetails.child.childDocuments?.learningClass > 0"
            class="detail-item"
          >
            <span class="detail-label">Класс:</span>
            <span class="detail-value">
              {{ childDetails.child.childDocuments?.learningClass }}
            </span>
          </div>
        </div>

        <!-- Информация о документах -->
        <div class="info-section">
          <h4 class="section-title">
            <i class="pi pi-file" />
            Документы
          </h4>
          <div
            v-if="childDetails.childDocs !== null"
            class="info-grid docs-grid"
          >
            <div class="info-item">
              <div class="doc-info">
                <span class="info-label">Скан свидетельства о рождении:</span>
                <span class="info-value">
                  {{
                    `Статус: ${childDetails.childDocs.birthFile.verified ? 'Документ одобрен' : 'Документ на проверке'}`
                  }}
                </span>
              </div>
              <div class="doc-actions">
                <Button
                  label="Просмотреть"
                  icon="pi pi-eye"
                  class="p-button-secondary p-button-sm"
                  @click="viewDocument(childDetails.childDocs.birthFile)"
                />
                <Button
                  label="Скачать"
                  icon="pi pi-download"
                  class="p-button-secondary p-button-sm"
                  @click="downloadDocument(childDetails.childDocs.birthFile)"
                />
              </div>
            </div>
            <div class="info-item">
              <div class="doc-info">
                <span class="info-label">СНИЛС:</span>
                <span class="info-value">
                  {{
                    `Статус: ${childDetails.childDocs.snilsFile.verified ? 'Документ одобрен' : 'Документ на проверке'}`
                  }}
                </span>
              </div>
              <div class="doc-actions">
                <Button
                  label="Просмотреть"
                  icon="pi pi-eye"
                  class="p-button-secondary p-button-sm"
                  @click="viewDocument(childDetails.childDocs.snilsFile)"
                />
                <Button
                  label="Скачать"
                  icon="pi pi-download"
                  class="p-button-secondary p-button-sm"
                  @click="downloadDocument(childDetails.childDocs.snilsFile)"
                />
              </div>
            </div>
            <div class="info-item">
              <div class="doc-info">
                <span class="info-label">Скан справки из ОУ:</span>
                <span class="info-value">
                  {{
                    `Статус: ${childDetails.childDocs.schoolFile.verified ? 'Документ одобрен' : 'Документ на проверке'}`
                  }}
                </span>
              </div>
              <div class="doc-actions">
                <Button
                  label="Просмотреть"
                  icon="pi pi-eye"
                  class="p-button-secondary p-button-sm"
                  @click="viewDocument(childDetails.childDocs.schoolFile)"
                />
                <Button
                  label="Скачать"
                  icon="pi pi-download"
                  class="p-button-secondary p-button-sm"
                  @click="downloadDocument(childDetails.childDocs.schoolFile)"
                />
              </div>
            </div>
            <div class="info-item">
              <div class="doc-info">
                <span class="info-label">Скан справки из площадки подготовки:</span>
                <span class="info-value">
                  {{
                    `Статус: ${childDetails.childDocs.platformFile.verified ? 'Документ одобрен' : 'Документ на проверке'}`
                  }}
                </span>
              </div>
              <div class="doc-actions">
                <Button
                  label="Просмотреть"
                  icon="pi pi-eye"
                  class="p-button-secondary p-button-sm"
                  @click="viewDocument(childDetails.childDocs.platformFile)"
                />
                <Button
                  label="Скачать"
                  icon="pi pi-download"
                  class="p-button-secondary p-button-sm"
                  @click="downloadDocument(childDetails.childDocs.platformFile)"
                />
              </div>
            </div>
            <div class="info-item">
              <div class="doc-info">
                <span class="info-label">Скан согласия на ОПД:</span>
                <span class="info-value">
                  {{
                    `Статус: ${childDetails.childDocs.consentFile.verified ? 'Документ одобрен' : 'Документ на проверке'}`
                  }}
                </span>
              </div>
              <div class="doc-actions">
                <Button
                  label="Просмотреть"
                  icon="pi pi-eye"
                  class="p-button-secondary p-button-sm"
                  @click="viewDocument(childDetails.childDocs.consentFile)"
                />
                <Button
                  label="Скачать"
                  icon="pi pi-download"
                  class="p-button-secondary p-button-sm"
                  @click="downloadDocument(childDetails.childDocs.consentFile)"
                />
              </div>
            </div>
          </div>
          <div
            v-else
          >
            <p class="no-mentor-text">
              <i class="pi pi-info-circle" />
              Нет загруженных документов
            </p>
          </div>
        </div>

        <!-- Информация о компетенциях -->
        <h4
          v-if="childDetails.competencies.length > 0"
          class="section-title"
        >
          <i class="pi pi-star" />
          Компетенции
        </h4>
        <div
          v-for="competence in childDetails.competencies"
          :key="competence.id"
          class="details-section"
        >
          <div class="competence-details">
            <div class="competence-name">
              {{ competence.name }}
            </div>
            <div class="competence-description">
              {{ competence.description }}
            </div>
            <div class="competence-expert">
              <i class="pi pi-user" />
              Главный эксперт:
              {{
                `${competence.expert.lastName} ${competence.expert.firstName} ${competence.expert.patronymic}`
              }}
            </div>
            <div
              class="competence-name competence-status"
              :class="competence.queueStatus === QueueStatuses.PARTICIPATES
                ? 'accepted' : 'denied'"
            >
              Статус:
              <div class="status-message competence-expert">
                {{
                  competence.queueStatus === QueueStatuses.PARTICIPATES
                    ? 'Заявка принята' : 'Заявка в листе ожидания'
                }}
                <i
                  :class="competence.queueStatus === QueueStatuses.PARTICIPATES
                    ? 'pi pi-check' : 'pi pi-clock'"
                />
              </div>
            </div>
            <div class="competence-docs">
              <div class="competence-name">
                Опубликованные документы
              </div>
              <div class="doc-item">
                <div class="doc-info">
                  <span class="info-label">Полное описание компетенции:</span>
                </div>
                <div class="doc-actions">
                  <Button
                    label="Просмотреть"
                    icon="pi pi-eye"
                    class="p-button-secondary p-button-sm"
                    @click="viewCompetenceDocument(
                      competence.id, FileType.DESCRIPTION,
                      childDetails.child.childDocuments?.ageCategory
                    )"
                  />
                  <Button
                    label="Скачать"
                    icon="pi pi-download"
                    class="p-button-secondary p-button-sm"
                    @click="downloadCompetenceDocument(
                      competence.id, FileType.DESCRIPTION,
                      childDetails.child.childDocuments?.ageCategory
                    )"
                  />
                </div>
              </div>

              <div
                v-if="!blockedCompetencesId.includes(competence.id)"
                class="doc-item"
              >
                <div class="doc-info">
                  <span class="info-label">Конкурсное задание отборочного этапа:</span>
                </div>
                <div class="doc-actions">
                  <Button
                    label="Просмотреть"
                    icon="pi pi-eye"
                    class="p-button-secondary p-button-sm"
                    @click="viewCompetenceDocument(
                      competence.id,
                      (childDetails.child.childDocuments?.ageCategory! == 'PRESCHOOL_1' ||
                        childDetails.child.childDocuments?.ageCategory! == 'PRESCHOOL_2')
                        ? FileType.FINAL_TASK : FileType.TASK,
                      childDetails.child.childDocuments?.ageCategory
                    )"
                  />
                  <Button
                    label="Скачать"
                    icon="pi pi-download"
                    class="p-button-secondary p-button-sm"
                    @click="downloadCompetenceDocument(
                      competence.id,
                      (childDetails.child.childDocuments?.ageCategory! == 'PRESCHOOL_1' ||
                        childDetails.child.childDocuments?.ageCategory! == 'PRESCHOOL_2')
                        ? FileType.FINAL_TASK : FileType.TASK,
                      childDetails.child.childDocuments?.ageCategory
                    )"
                  />
                </div>
              </div>
            </div>
            <div class="competence-docs">
              <div class="competence-name">
                Педагог, помогающий в подготовке к компетенции
              </div>
              <div class="preparation-details">
                <div class="field">
                  <label
                    :for="'teacher-name'+competence.assignId"
                    class="field-label"
                  >ФИО полностью *</label>
                  <InputText
                    :id="'teacher-name'+competence.assignId"
                    v-model="competence.teacherName"
                    placeholder="Иванов Иван Иванович"
                    type="text"
                    class="w-full"
                    :class="{ 'p-invalid': getTeacherFormErrorsByAssignId(competence.assignId).teacherName }"
                    @blur="validateForm(competence)"
                  />
                  <small
                    v-if="getTeacherFormErrorsByAssignId(competence.assignId).teacherName"
                    class="p-error"
                  >{{ getTeacherFormErrorsByAssignId(competence.assignId).teacherName }}</small>
                </div>
                <div class="field">
                  <label
                    :for="'institution'+competence.assignId"
                    class="field-label"
                  >Образовательное учреждение *</label>
                  <InputText
                    :id="'institution'+competence.assignId"
                    v-model="competence.institution"
                    placeholder="Государственное общеобразовательное учреждение"
                    type="text"
                    class="w-full"
                    :class="{ 'p-invalid': getTeacherFormErrorsByAssignId(competence.assignId).institution }"
                    @blur="validateForm(competence)"
                  />
                  <small
                    v-if="getTeacherFormErrorsByAssignId(competence.assignId).institution"
                    class="p-error"
                  >{{ getTeacherFormErrorsByAssignId(competence.assignId).institution }}</small>
                </div>
                <div class="field">
                  <label
                    :for="'post'+competence.assignId"
                    class="field-label"
                  >Должность *</label>
                  <InputText
                    :id="'post'+competence.assignId"
                    v-model="competence.post"
                    placeholder="Должность в ОУ"
                    type="text"
                    class="w-full"
                    :class="{ 'p-invalid': getTeacherFormErrorsByAssignId(competence.assignId).post }"
                    @blur="validateForm(competence)"
                  />
                  <small
                    v-if="getTeacherFormErrorsByAssignId(competence.assignId).post"
                    class="p-error"
                  >{{ getTeacherFormErrorsByAssignId(competence.assignId).post }}</small>
                </div>
                <Button
                  label="Сохранить"
                  :disabled="compareDetails(childDetails.child.id, competence.id) || !validateForm(competence)"
                  @click="updateTeacherInfo(childDetails.child.id, competence)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Информация о наставнике -->
        <div class="details-section">
          <h4 class="section-title">
            <i class="pi pi-users" />
            Наставник
          </h4>
          <div
            v-if="childDetails.child.mentor !== null"
            class="mentor-info"
          >
            <div class="mentor-details">
              <div class="detail-item">
                <span class="detail-label">ФИО:</span>
                <span class="detail-value">
                  {{
                    `${childDetails.child.mentor.lastName} ${childDetails.child.mentor.firstName} ${childDetails.child.mentor.patronymic}`
                  }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">{{ childDetails.child.mentor.email }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Телефон:</span>
                <span class="detail-value">
                  {{ FormatManager.formatMobileNumberFromDTO(childDetails.child.mentor.mobileNumber) }}
                </span>
              </div>
            </div>
            <div
              v-if="userStore.user?.role === Roles.USER"
              class="mentor-actions"
            >
              <Button
                label="Изменить наставника"
                icon="pi pi-pencil"
                class="p-button-primary p-button-sm"
                @click="$emit('edit-mentor', childDetails.child)"
              />
            </div>
          </div>
          <div
            v-else
            class="no-mentor"
          >
            <p class="no-mentor-text">
              <i class="pi pi-info-circle" />
              Наставник не выбран
            </p>
            <Button
              v-if="userStore.user?.role === Roles.USER"
              label="Выбрать наставника"
              icon="pi pi-plus"
              class="p-button-primary p-button-sm"
              @click="$emit('edit-mentor', childDetails.child)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.experts-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 2rem;
}

.expert-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  overflow: hidden;
  transition: box-shadow 0.3s ease,
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

.expert-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.expert-content {
  padding: 1.5rem;
}

.expert-details {
  margin-bottom: 1.5rem;
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

.card-title i {
  margin-right: 0.75rem;
  font-size: 1.1rem;
}

.docs-grid {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.docs-grid .info-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #ff9800;
  transition: all 0.3s ease;
}

.docs-grid .info-item:hover {
  background: #e3f2fd;
  border-left-color: #2196f3;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
}

.docs-grid .info-label {
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.docs-grid .info-value {
  color: #6c757d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.docs-grid .info-value::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff9800;
  flex-shrink: 0;
}

.docs-grid .info-item:hover .info-value::before {
  background: #2196f3;
}

.docs-grid .doc-info {
  flex: 1;
  margin-bottom: 1rem;
}

.docs-grid .doc-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
  min-width: 120px;
}

.section-title {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #ff9800;
  padding-bottom: 0.5rem;
}

.doc-item {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .info-label {
    font-size: 0.9rem;
  }

  .doc-actions {
    display: flex;
    gap: 1rem;
  }
}


.mentor-available-notice i {
  color: #28a745;
}

/* Стили для диалога подтверждения удаления */

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

.competence-item:hover .competence-expert {
  color: #1976d2;
}

.preparation-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: space-between;

  .field {
    margin-bottom: 0;
  }
}

/* Мобильные стили для touch устройств */
@media (max-width: 768px) {
  .expert-header {
    padding: 1rem
  }

  .expert-name {
    font-size: 1.1rem;
  }

  .mentor-selection .mentor-info {
    flex-direction: column;
    gap: 0.5rem;
  }

  .mentor-selection .mentor-actions {
    align-self: flex-end;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .docs-grid .info-item {
    padding: 0.75rem;
  }

  .docs-grid .info-label {
    font-size: 0.85rem;
  }

  .docs-grid .info-value {
    font-size: 0.85rem;
  }

  .docs-grid .doc-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .docs-grid .doc-actions {
    min-width: auto;
    width: 100%;
  }

  .edit-button {
    margin-left: 0;
    align-self: flex-end;
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
}

.mentor-simple i {
  color: #28a745;
  font-size: 0.9rem;
}

/* Стили для модальных окон */

.info-section {
  margin-bottom: 2rem;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 500;
}

.info-value {
  color: #2c3e50;
  font-weight: 500;
}

.details-section {
  margin-bottom: 2rem;
}

.details-section:last-child {
  margin-bottom: 0;
}

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

.edit-button {
  margin-left: 1rem;
  flex-shrink: 0;
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

.competence-details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #ff9800;
  margin-bottom: 0.5rem;
}

.competence-details .competence-name {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.competence-docs, .competence-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 1rem 1rem 1rem 0.8rem;
  border-radius: 5px;
  border-left: 3px solid #2196f3;
  background: #daecfc;
}


.competence-status {
  display: flex;
  justify-content: space-between;

  .competence-expert.status-message {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
}

.competence-status.accepted {
  border-color: #28a745;
  background: #dcf8e3;

  .status-message {
    color: #28a745;
  }
}

.competence-status.denied {
  border-color: #cb9700;
  background: #fff2c9;

  .status-message {
    color: #cb9700;
  }
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

.mentor-name i {
  color: #ff9800;
  font-size: 1rem;
}

.mentor-selection .mentor-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mentor-selection .mentor-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media screen and (max-width: 768px) {
  .competence-status {
    flex-direction: column;
  }

  .doc-item {
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;

    .doc-actions {
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }
}

@media screen and (max-width: 480px) {
  .expert-header {
    padding: 0.75rem
  }

  .expert-name {
    font-size: 1rem;
  }
}

</style>