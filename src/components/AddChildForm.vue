<template>
  <div class="field">
    <label
      for="childFullName"
      class="field-label"
    >ФИО ребенка *</label>
    <InputText
      id="childFullName"
      v-model="childForm.fullName"
      placeholder="Введите полное имя ребенка, двойное имя вводите через '-'"
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
      for="childBirthDate"
      class="field-label"
    >Дата рождения *</label>
    <InputMask
      id="childBirthDate"
      v-model="childForm.birthDate"
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
      for="birthCertificate"
      class="field-label"
    >Скан свидетельства о рождении *</label>
    <FileUpload
      id="birthCertificate"
      mode="basic"
      accept=".pdf,.jpg,.jpeg,.png"
      :max-file-size="10000000"
      choose-label="Выберите файл"
      class="w-full"
      :class="{ 'p-invalid': errors.birthCertificate }"
      @select="onBirthCertificateSelect"
      @remove="onBirthCertificateRemove"
    />
    <small
      v-if="errors.birthCertificate"
      class="p-error"
    >{{
      errors.birthCertificate
    }}</small>
    <small class="p-text-secondary">Поддерживаемые форматы: PDF, JPG, PNG (максимум 10 МБ)</small>
  </div>

  <div class="field">
    <label
      for="snilsNumber"
      class="field-label"
    >Номер СНИЛС *</label>
    <InputMask
      id="snilsNumber"
      v-model="childForm.snilsNumber"
      mask="999-999-999 99"
      placeholder="000-000-000 00"
      class="w-full"
      :class="{ 'p-invalid': errors.snilsNumber }"
    />
    <small
      v-if="errors.snilsNumber"
      class="p-error"
    >{{
      errors.snilsNumber
    }}</small>
  </div>

  <div class="field">
    <label
      for="snilsScan"
      class="field-label"
    >Скан СНИЛС *</label>
    <FileUpload
      id="snilsScan"
      mode="basic"
      accept=".pdf,.jpg,.jpeg,.png"
      :max-file-size="10000000"
      choose-label="Выберите файл"
      class="w-full"
      :class="{ 'p-invalid': errors.snilsScan }"
      @select="onSnilsScanSelect"
      @remove="onSnilsScanRemove"
    />
    <small
      v-if="errors.snilsScan"
      class="p-error"
    >{{
      errors.snilsScan
    }}</small>
    <small class="p-text-secondary">Поддерживаемые форматы: PDF, JPG, PNG (максимум 10 МБ)</small>
  </div>

  <div class="field">
    <label
      for="schoolName"
      class="field-label"
    >Название ОУ *</label>
    <InputText
      id="schoolName"
      v-model="childForm.schoolName"
      placeholder="Введите полное название учреждения"
      class="w-full"
      :class="{ 'p-invalid': errors.schoolName }"
    />
    <small
      v-if="errors.schoolName"
      class="p-error"
    >{{
      errors.schoolName
    }}</small>
  </div>

  <div class="field">
    <label
      for="grade"
      class="field-label"
    >Класс обучения *</label>
    <Dropdown
      id="grade"
      v-model="childForm.grade"
      :options="gradeOptions"
      placeholder="Выберите класс"
      class="w-full"
      :class="{ 'p-invalid': errors.grade }"
      option-label="label"
      option-value="value"
    />
    <small
      v-if="errors.grade"
      class="p-error"
    >{{
      errors.grade
    }}</small>
  </div>

  <div class="field">
    <label
      for="schoolCertificate"
      class="field-label"
    >Скан справки из ОУ *</label>
    <FileUpload
      id="schoolCertificate"
      mode="basic"
      accept=".pdf,.jpg,.jpeg,.png"
      :max-file-size="10000000"
      choose-label="Выберите файл"
      class="w-full"
      :class="{ 'p-invalid': errors.schoolCertificate }"
      @select="onSchoolCertificateSelect"
      @remove="onSchoolCertificateRemove"
    />
    <small
      v-if="errors.schoolCertificate"
      class="p-error"
    >{{
      errors.schoolCertificate
    }}</small>
    <small class="p-text-secondary">Поддерживаемые форматы: PDF, JPG, PNG (максимум 10 МБ)</small>
  </div>

  <div class="field">
    <label
      for="platform"
      class="field-label"
    >Площадка подготовки *</label>
    <InputText
      id="platform"
      v-model="childForm.platform"
      placeholder="Полное название учреждения"
      class="w-full"
      :class="{ 'p-invalid': errors.platform }"
    />
    <small
      v-if="errors.platform"
      class="p-error"
    >{{
      errors.platform
    }}</small>
  </div>

  <div class="field">
    <label
      for="platformCertificate"
      class="field-label"
    >Скан справки из площадки подготовки *</label>
    <FileUpload
      id="platformCertificate"
      mode="basic"
      accept=".pdf,.jpg,.jpeg,.png"
      :max-file-size="10000000"
      choose-label="Выберите файл"
      class="w-full"
      :class="{ 'p-invalid': errors.platformCertificate }"
      @select="onPlatformCertificateSelect"
      @remove="onPlatformCertificateRemove"
    />
    <small
      v-if="errors.platformCertificate"
      class="p-error"
    >{{
      errors.platformCertificate
    }}</small>
    <small class="p-text-secondary">Поддерживаемые форматы: PDF, JPG, PNG (максимум 10 МБ)</small>
  </div>
  <div class="field">
    <label
      for="schoolCertificate"
      class="field-label"
    >Скан согласия на ОПД *</label>
    <FileUpload
      id="childConsentFile"
      mode="basic"
      accept=".pdf,.jpg,.jpeg,.png"
      :max-file-size="10000000"
      choose-label="Выберите файл"
      class="w-full"
      :class="{ 'p-invalid': errors.childConsentFile }"
      @select="onChildConsentFileSelect"
      @remove="onChildConsentFileRemove"
    />
    <small
      v-if="errors.childConsentFile"
      class="p-error"
    >{{
      errors.childConsentFile
    }}</small>
    <small class="p-text-secondary">Поддерживаемые форматы: PDF, JPG, PNG (максимум 10 МБ)</small>
  </div>
</template>

<script lang="ts">
  import InputText from "primevue/inputtext";
  import InputMask from "primevue/inputmask";
  import FileUpload, { type FileUploadSelectEvent } from 'primevue/fileupload';
  import Dropdown from "primevue/dropdown";
  import type { PropType } from 'vue';
  import { useGradeOptions } from '@/shared/UseGradeOptions.ts';

  export type ChildFormFields = {
    fullName: string,
    birthDate: string,
    snilsNumber: string,
    schoolName: string,
    platform: string,
    grade: number | null,
    childConsentFile: null | File,
    birthCertificate: null | File,
    snilsScan: null | File,
    schoolCertificate: null | File,
    platformCertificate: null | File,
  }

  export type ChildFormErrors = {
    fullName: string,
    birthDate: string,
    snilsNumber: string,
    schoolName: string,
    platform: string,
    grade: string,
    snilsScan: string,
    childConsentFile: string,
    schoolCertificate: string,
    birthCertificate: string,
    platformCertificate: string
  }

  export default {
    name: "AddChildForm",
    components: {
      InputText,
      InputMask,
      FileUpload,
      Dropdown,
    },
    props: {
      modelChildForm: {
        type: Object as PropType<ChildFormFields>,
        required: true,
      },
      modelChildFormErrors: {
        type: Object as PropType<ChildFormErrors>,
        required: true,
      },
    },
    emits: [
      'update:model-child-form',
      'update:model-child-form-errors'
    ],
    data() {
      return {
        isLoading: false,
        showAgreementDialog: false,
        showPoliticsDialog: false,
        gradeOptions: useGradeOptions,

        childForm: { ...this.modelChildForm },
        errors: { ... this.modelChildFormErrors },

        platformOptions: [
          { label: "Площадка 1", value: "platform1" },
          { label: "Площадка 2", value: "platform2" },
          { label: "Площадка 3", value: "platform3" },
        ],
      };
    },
    watch: {
      modelChildFormErrors: {
        handler(newVal) {
          this.errors = { ...newVal }
        },
        deep: true
      },
      childForm: {
        handler(newVal) {
          this.$emit("update:model-child-form", { ...newVal });
        },
        deep: true
      },
      errors: {
        handler(newVal) {
          if (JSON.stringify(this.$props.modelChildFormErrors) !== JSON.stringify(this.errors)) {
            this.$emit("update:model-child-form-errors", { ...newVal });
          }
        },
        deep: true
      }
    },
    methods: {
      onBirthCertificateSelect(event: FileUploadSelectEvent) {
        this.handleFileSelect(event, "birthCertificate");
      },

      onBirthCertificateRemove() {
        this.childForm.birthCertificate = null;
        this.errors.birthCertificate = "";
      },

      onSnilsScanSelect(event: FileUploadSelectEvent) {
        this.handleFileSelect(event, "snilsScan");
      },

      onSnilsScanRemove() {
        this.childForm.snilsScan = null;
        this.errors.snilsScan = "";
      },

      onSchoolCertificateSelect(event: FileUploadSelectEvent) {
        this.handleFileSelect(event, "schoolCertificate");
      },

      onSchoolCertificateRemove() {
        this.childForm.schoolCertificate = null;
        this.errors.schoolCertificate = "";
      },

      onPlatformCertificateSelect(event: FileUploadSelectEvent) {
        this.handleFileSelect(event, "platformCertificate");
      },

      onPlatformCertificateRemove() {
        this.childForm.platformCertificate = null;
        this.errors.platformCertificate = "";
      },
      onChildConsentFileSelect(event: FileUploadSelectEvent) {
        this.handleFileSelect(event, "childConsentFile");
      },

      onChildConsentFileRemove() {
        this.childForm.childConsentFile = null;
        this.errors.childConsentFile = "";
      },
      handleFileSelect(event: FileUploadSelectEvent, fieldName: string) {
        const file = event.files[0];
        const typedFieldName = fieldName as keyof typeof this.errors;
        if (file) {
          if (file.size > 10000000) {
            (this.errors[typedFieldName] as string) = "Размер файла не должен превышать 10 МБ";
            return;
          }

          const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ];
          if (!allowedTypes.includes(file.type)) {
            (this.errors[typedFieldName] as string) =
              "Поддерживаются только файлы PDF, JPG, PNG, DOC, DOCX";
            return;
          }

          const childTypedKey = fieldName as keyof typeof this.childForm;
          (this.childForm[childTypedKey] as File) = file;
          (this.errors[typedFieldName] as string) = "";
        }
      },
    },
  };
</script>

<style scoped>

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }



  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .field-label {
    font-weight: 500;
    color: #2c3e50;
    font-size: 0.9rem;
  }


  .step-navigation .p-button {
    flex: 1;
    justify-content: center;
  }

  /* Мобильные стили для кнопок навигации */
  @media (max-width: 768px) {
    .step-navigation {
      flex-direction: column;
      gap: 0.75rem;
    }

    .step-navigation .p-button {
      width: 100%;
      flex: none;
    }
  }

  .login-link {
    text-align: center;
    margin-top: 1rem;
  }

  .login-link p {
    margin: 0;
    color: #6c757d;
  }


  /* Стили для FileUpload на мобильных устройствах */
  @media (max-width: 768px) {
    :deep(.p-fileupload .p-button) {
      width: 100%;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0.75rem 1rem;
    }

    :deep(.p-fileupload .p-button-label) {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: block;
    }
  }

  :deep(.p-fileupload-buttonbar) {
    background: transparent;
    border: none;
    padding: 0;
  }

  :deep(.p-fileupload-content) {
    display: none;
  }

  :deep(.p-fileupload .p-button) {
    background: transparent;
    border: 2px solid #ff9800;
    color: #ff9800;
    width: 100%;
    transition: all 0.3s ease;
  }

  :deep(.p-fileupload .p-button:hover) {
    background: #ff9800;
    color: white;
    border-color: #ff9800;
  }

  :deep(.p-fileupload .p-button:focus) {
    box-shadow: 0 0 0 0.2rem rgba(255, 152, 0, 0.25);
  }

  :deep(.p-checkbox) {
    margin-right: 0.5rem;
  }

  /* Стили для select элементов */
  select {
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 1rem;
    background-color: white;
    color: #495057;
    transition: all 0.2s ease;
  }

  select:focus {
    outline: none;
    border-color: #ff9800;
    box-shadow: 0 0 0 0.2rem rgba(255, 152, 0, 0.25);
  }

  select.p-invalid {
    border-color: #e24c4c;
  }

  select.p-invalid:focus {
    border-color: #e24c4c;
    box-shadow: 0 0 0 0.2rem rgba(226, 76, 76, 0.25);
  }


  /* Общие мобильные стили */
  @media (max-width: 768px) {

    .step-title {
      font-size: 1.25rem;
    }

    .field {
      margin-bottom: 1.25rem;
    }

    .field-label {
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
    }

    /* Кнопки на всю ширину */
    .p-button {
      width: 100%;
      justify-content: center;
      padding: 0.875rem 1rem;
      font-size: 1rem;
    }
    /* Диалоги на мобильных */
    :deep(.p-dialog) {
      width: 95vw !important;
      margin: 1rem;
    }

  }
</style>
