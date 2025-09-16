<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="logo-container">
          <img
            src="@/assets/logo.png"
            alt="Career Seekers Logo"
            class="logo"
          >
        </div>
        <h1 class="register-title">
          Регистрация родителя
        </h1>

        <!-- Индикатор шагов -->
        <div class="steps-indicator">
          <div
            class="step"
            :class="{ active: currentStep >= 1, completed: currentStep > 1 }"
          >
            <div class="step-number">
              1
            </div>
            <div class="step-label">
              Данные родителя
            </div>
          </div>
          <div
            class="step"
            :class="{ active: currentStep >= 2, completed: currentStep > 2 }"
          >
            <div class="step-number">
              2
            </div>
            <div class="step-label">
              Данные ребенка
            </div>
          </div>
          <div
            class="step"
            :class="{ active: currentStep >= 3, completed: currentStep > 3 }"
          >
            <div class="step-number">
              3
            </div>
            <div class="step-label">
              Выбор наставника
            </div>
          </div>
        </div>

        <div class="divider" />
      </div>

      <div class="register-content">
        <form
          class="register-form"
          @submit.prevent="handleSubmit"
        >
          <!-- Шаг 1: Данные родителя -->
          <div
            v-if="currentStep === 1"
            class="step-content"
          >
            <h3 class="step-title">
              Данные родителя
            </h3>

            <div class="field">
              <label
                for="parentFullName"
                class="field-label"
              >ФИО *</label>
              <InputText
                id="parentFullName"
                v-model="parentForm.fullName"
                placeholder="Введите ваше полное имя"
                class="w-full"
                :class="{ 'p-invalid': errors.parentFullName }"
              />
              <small
                v-if="errors.parentFullName"
                class="p-error"
              >{{
                errors.parentFullName
              }}</small>
            </div>

            <div class="field">
              <label
                for="parentBirthDate"
                class="field-label"
              >Дата рождения *</label>
              <InputMask
                id="parentBirthDate"
                v-model="parentForm.birthDate"
                mask="99.99.9999"
                placeholder="дд.мм.гггг"
                class="w-full"
                :class="{ 'p-invalid': errors.parentBirthDate }"
              />
              <small
                v-if="errors.parentBirthDate"
                class="p-error"
              >{{
                errors.parentBirthDate
              }}</small>
            </div>

            <div class="field">
              <label
                for="relationship"
                class="field-label"
              >Кем приходится? *</label>
              <InputText
                id="relationship"
                v-model="parentForm.relationship"
                placeholder="Например: мать, отец, опекун"
                class="w-full"
                :class="{ 'p-invalid': errors.relationship }"
              />
              <small
                v-if="errors.relationship"
                class="p-error"
              >{{
                errors.relationship
              }}</small>
            </div>

            <div class="field">
              <label
                for="telegramLink"
                class="field-label"
              >Ссылка на Telegram *</label>
              <InputText
                id="relationship"
                v-model="parentForm.telegramLink"
                placeholder="Например, @telegram_username"
                class="w-full"
                :class="{ 'p-invalid': errors.telegramLink }"
                @blur="validateTelegramLink"
              />
              <small
                v-if="errors.telegramLink"
                class="p-error"
              >{{
                errors.telegramLink
              }}</small>
            </div>

            <div class="field">
              <label
                for="parentPhone"
                class="field-label"
              >Контактный телефон *</label>
              <InputMask
                id="parentPhone"
                v-model="parentForm.phone"
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
                for="parentEmail"
                class="field-label"
              >Адрес электронной почты *</label>
              <InputText
                id="parentEmail"
                v-model="parentForm.email"
                type="email"
                placeholder="example@email.com"
                class="w-full"
                :class="{ 'p-invalid': errors.email }"
                @blur="validateEmail"
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
                  v-model="parentForm.consent"
                  input-id="consent"
                  :binary="true"
                  :class="{ 'p-invalid': errors.consent }"
                />
                <label
                  for="consent"
                  class="ml-2 agreement-label"
                >
                  Я согласен(-а) на
                  <a
                    href="#"
                    class="link"
                    @click.prevent="showAgreement"
                  >
                    обработку персональных данных
                  </a>
                </label>
              </div>
              <small
                v-if="errors.consent"
                class="p-error"
              >{{
                errors.consent
              }}</small>
            </div>
          </div>

          <!-- Шаг 2: Данные ребенка -->
          <div
            v-if="currentStep === 2"
            class="step-content"
          >
            <h3 class="step-title">
              Данные ребенка
            </h3>

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
                :class="{ 'p-invalid': errors.childFullName }"
              />
              <small
                v-if="errors.childFullName"
                class="p-error"
              >{{
                errors.childFullName
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
                :class="{ 'p-invalid': errors.childBirthDate }"
              />
              <small
                v-if="errors.childBirthDate"
                class="p-error"
              >{{
                errors.childBirthDate
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
              <Dropdown
                id="platform"
                v-model="childForm.platform"
                :options="platformOptions"
                placeholder="Выберите площадку"
                class="w-full"
                :class="{ 'p-invalid': errors.platform }"
                option-label="label"
                option-value="value"
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
          </div>

          <!-- Шаг 3: Выбор наставника -->
          <div
            v-if="currentStep === 3"
            class="step-content"
          >
            <h3 class="step-title">
              Выбор наставника
            </h3>

            <div class="field">
              <label
                for="mentor"
                class="field-label"
              >Выберите наставника *</label>
              <Dropdown
                id="mentor"
                v-model="mentorForm.mentor"
                :options="mentorOptions"
                placeholder="Выберите наставника"
                class="w-full"
                :class="{ 'p-invalid': errors.mentor }"
                option-label="name"
                option-value="id"
                :disabled="mentorForm.isParentMentor"
              />
              <small
                v-if="errors.mentor"
                class="p-error"
              >{{
                errors.mentor
              }}</small>
            </div>

            <div class="field">
              <div class="flex align-items-center">
                <Checkbox
                  id="isParentMentor"
                  v-model="mentorForm.isParentMentor"
                  :binary="true"
                  class="mr-2"
                  @change="onParentMentorChange"
                />
                <label
                  for="isParentMentor"
                  class="agreement-label"
                >
                  Я (родитель) являюсь наставником
                </label>
              </div>
            </div>

            <div class="field">
              <label
                for="password"
                class="field-label"
              >Пароль *</label>
              <Password
                id="password"
                v-model="mentorForm.password"
                placeholder="Введите пароль"
                class="w-full"
                :class="{ 'p-invalid': errors.password }"
                :feedback="true"
                toggle-mask
                weak-label="Слабый"
                medium-label="Средний"
                strong-label="Надежный"
                prompt-label="Введите пароль"
                @blur="validatePassword"
              />
              <small
                v-if="errors.password"
                class="p-error"
              >{{
                errors.password
              }}</small>
            </div>

            <div class="field">
              <label
                for="confirmPassword"
                class="field-label"
              >Подтверждение пароля *</label>
              <Password
                id="confirmPassword"
                v-model="mentorForm.confirmPassword"
                placeholder="Подтвердите пароль"
                class="w-full"
                :class="{ 'p-invalid': errors.confirmPassword }"
                :feedback="false"
                toggle-mask
              />
              <small
                v-if="errors.confirmPassword"
                class="p-error"
              >{{
                errors.confirmPassword
              }}</small>
            </div>

            <div class="field">
              <div class="flex align-items-center">
                <Checkbox
                  v-model="parentForm.agreement"
                  input-id="agreement"
                  :binary="true"
                  :class="{ 'p-invalid': errors.agreement }"
                />
                <label
                  for="agreement"
                  class="ml-2 agreement-label"
                >
                  Я согласен с
                  <a
                    href="#"
                    class="link"
                    @click.prevent="showPolitics"
                  >политикой использования сервиса</a>
                </label>
              </div>
              <small
                v-if="errors.agreement"
                class="p-error"
              >{{
                errors.agreement
              }}</small>
            </div>
          </div>

          <!-- Кнопки навигации -->
          <div class="step-navigation">
            <Button
              v-if="currentStep > 1"
              type="button"
              label="Назад"
              class="p-button-secondary"
              @click="previousStep"
            />
            <Button
              v-if="currentStep < 3"
              type="button"
              label="Далее"
              class="p-button-primary"
              @click="nextStep"
            />
            <Button
              v-if="currentStep === 3"
              type="submit"
              label="Зарегистрироваться"
              class="p-button-primary"
              :loading="isLoading"
            />
          </div>

          <div class="login-link">
            <p>
              Уже есть аккаунт?
              <router-link
                to="/login"
                class="link"
              >
                Войти
              </router-link>
            </p>
          </div>
        </form>
      </div>
    </div>

    <!-- Диалоги -->
    <Dialog
      v-model:visible="showAgreementDialog"
      modal
      :show-header="false"
      :style="{
        width: '90vw',
        maxWidth: '650px',
        height: '90vh',
        position: 'relative',
        borderRadius: '6px',
      }"
      class="privacy-dialog"
    >
      <div
        style="
          display: flex;

          position: absolute;
          left: 0;
          top: 0;
          height: 90vh;
          width: 100%;
          overflow: hidden;
          background-color: white;
          border-radius: 6px;
        "
      >
        <VuePdfEmbed
          style="width: 100%; position: absolute"
          source="/docs/agreement.pdf"
        />
        <Button
          style="
            position: absolute;
            top: 0.5rem;
            padding: 1rem;
            right: 0.5rem;
            width: auto;
            height: 5%;
          "
          icon="pi pi-times"
          class="p-button-text p-button-plain"
          aria-label="Close"
          @click="showAgreementDialog = false"
        />
      </div>
    </Dialog>

    <!-- Диалог политики конфиденциальности -->
    <Dialog
      v-model:visible="showPoliticsDialog"
      modal
      :show-header="false"
      :style="{
        width: '90vw',
        maxWidth: '650px',
        height: '90vh',
        position: 'relative',
        borderRadius: '6px',
      }"
      class="privacy-dialog"
    >
      <div
        style="
          position: absolute;
          padding: 3rem 0;
          left: 0;
          height: 90vh;
          width: 100%;
          background-color: white;
          border-radius: 6px;
        "
      >
        <div style="height: 100%; overflow: scroll">
          <VuePdfEmbed source="/docs/politics.pdf" />
        </div>
        <Button
          style="
            position: fixed;
            top: 0.5rem;
            padding: 1rem;
            right: 0.5rem;
            width: auto;
            height: 5%;
          "
          icon="pi pi-times"
          class="p-button-text p-button-plain"
          aria-label="Close"
          @click="showPoliticsDialog = false"
        />
      </div>
    </Dialog>

    <ToastPopup :content="errors.toastPopup" />
  </div>
</template>

<script lang="ts">
import InputText from "primevue/inputtext";
import InputMask from "primevue/inputmask";
import Password from "primevue/password";
import Button from "primevue/button";
import FileUpload, { type FileUploadSelectEvent } from 'primevue/fileupload';
import Checkbox from "primevue/checkbox";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import { AuthResolver } from "@/api/resolvers/auth/auth.resolver";
import ToastPopup from "@/components/ToastPopup.vue";
import type { UserWithChildRegistrationDto } from "@/api/resolvers/auth/dto/input/register-input.dto.ts";
import {
  type ParentStateInterface,
  type RegistrationData, Roles,
} from '@/state/UserState.types';
import { FileManager } from "@/utils/FileManager";
import VuePdfEmbed from "vue-pdf-embed";

export default {
  name: "ParentRegisterView",
  components: {
    VuePdfEmbed,
    ToastPopup,
    InputText,
    InputMask,
    Password,
    Button,
    FileUpload,
    Checkbox,
    Dialog,
    Dropdown,
  },
  data() {
    return {
      currentStep: 1 as number,
      isLoading: false,
      showAgreementDialog: false,
      showPoliticsDialog: false,

      parentForm: {
        fullName: "",
        birthDate: "",
        relationship: "",
        telegramLink: "",
        phone: "",
        email: "",
        consent: false,
        agreement: "",
        childConsentFile: new File(["Содержимое файла"], "myfile.txt", {
          type: "text/plain",
        }),
      },

      childForm: {
        fullName: "",
        birthDate: "",
        birthCertificate: null as null | File,
        snilsNumber: "",
        snilsScan: null as null | File,
        schoolName: "",
        grade: null as number | null,
        platform: null as string | null,
        schoolCertificate: null as null | File,
        platformCertificate: null as null | File,
      },

      mentorForm: {
        mentor: null,
        password: "",
        confirmPassword: "",
        agreement: false,
        isParentMentor: false,
      },

      errors: {
        mentor: "",
        childFullName: "",
        parentFullName: "",
        childBirthDate: "",
        parentBirthDate: "",
        snilsNumber: "",
        grade: "",
        relationship: "",
        telegramLink: "",
        phone: "",
        email: "",
        consent: "",
        snilsScan: "",
        schoolName: "",
        password: "",
        platform: "",
        confirmPassword: "",
        birthCertificate: "",
        schoolCertificate: "",
        platformCertificate: "",
        agreement: "",
        toastPopup: {
          title: "",
          message: "",
        },
        birthDate: '',
        parentEmail: "",
        parentPhone: "",

      },

      gradeOptions: [
        { label: "1 класс", value: 1 },
        { label: "2 класс", value: 2 },
        { label: "3 класс", value: 3 },
        { label: "4 класс", value: 4 },
        { label: "5 класс", value: 5 },
        { label: "6 класс", value: 6 },
        { label: "7 класс", value: 7 },
        { label: "8 класс", value: 8 },
      ],

      platformOptions: [
        { label: "Площадка 1", value: "platform1" },
        { label: "Площадка 2", value: "platform2" },
        { label: "Площадка 3", value: "platform3" },
      ],

      mentorOptions: [
        { id: 1, name: "Иванов Иван Иванович" },
        { id: 2, name: "Петрова Мария Сергеевна" },
        { id: 3, name: "Сидоров Алексей Петрович" },
      ],
    };
  },
  computed: {
    mobileNumberFormatted() {
      return this.parentForm.phone.replaceAll(/\s|-|\(|\)|/g, "");
    },
    snilsFormatted() {
      return this.childForm.snilsNumber.replaceAll(/\s|-/g, "");
    },
    telegramLinkFormatted() {
      return this.parentForm.telegramLink.replace("@", "https://t.me/");
    },
  },
  methods: {
    validateEmail() {
      if (
        this.parentForm.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.parentForm.email)
      ) {
        this.errors.email = "Введите корректный email";
      } else {
        this.errors.email = "";
      }
    },
    validatePassword() {
      if (!this.mentorForm.password) {
        this.errors.password = "Пароль обязателен";
        return;
      } else if (this.mentorForm.password.length < 8) {
        this.errors.password = "Пароль должен содержать минимум 8 символов";
        return;
      } else if (
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.mentorForm.password)
      ) {
        this.errors.password =
          "Пароль должен содержать заглавные и строчные буквы, а также цифры";
        return;
      }
      this.errors.password = "";
    },

    formatBirthDate(birthDate: string) {
      const [day, month, year] = birthDate.split(".");
      const date = new Date(
        Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)),
      );
      return date.toISOString();
    },

    validateStep(step: number) {
      this.errors = {
        parentPhone: "",
        parentEmail: "",
        birthDate: '',
        mentor: "",
        childFullName: "",
        parentFullName: "",
        childBirthDate: "",
        parentBirthDate: "",
        snilsNumber: "",
        grade: "",
        relationship: "",
        telegramLink: "",
        phone: "",
        email: "",
        consent: "",
        snilsScan: "",
        schoolName: "",
        password: "",
        platform: "",
        confirmPassword: "",
        birthCertificate: "",
        schoolCertificate: "",
        platformCertificate: "",
        agreement: "",
        toastPopup: {
          title: "",
          message: "",
        }
      };

      let isValid = true;

      if (step === 1) {
        // Валидация данных родителя
        if (!this.parentForm.fullName.trim()) {
          this.errors.parentFullName = "ФИО обязательно";
          isValid = false;
        }

        if (!this.parentForm.relationship.trim()) {
          this.errors.relationship = "Укажите, кем вы приходитесь ребенку";
          isValid = false;
        }

        if (!this.parentForm.telegramLink.trim()) {
          this.errors.telegramLink = "Ссылка обязательна для связи";
          isValid = false;
        } else if (
          !/^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(this.parentForm.telegramLink)
        ) {
          this.errors.telegramLink = "Введите корректную ссылку";
          isValid = false;
        }

        if (!this.parentForm.birthDate.trim()) {
          this.errors.parentBirthDate = "Дата рождения обязательна";
          isValid = false;
        }

        if (!this.parentForm.phone) {
          this.errors.parentPhone = "Телефон обязателен";
          isValid = false;
        } else if (this.parentForm.phone.replace(/\D/g, "").length !== 11) {
          this.errors.parentPhone = "Введите корректный номер телефона";
          isValid = false;
        }

        if (!this.parentForm.email) {
          this.errors.parentEmail = "Email обязателен";
          isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.parentForm.email)) {
          this.errors.parentEmail = "Введите корректный email";
          isValid = false;
        }

        // Проверка согласия на обработку данных
        if (!this.parentForm.consent) {
          this.errors.consent =
            "Необходимо согласиться с обработкой персональных данных";
          isValid = false;
        }
      }

      if (step === 2) {
        // Валидация данных ребенка
        if (!this.childForm.fullName.trim()) {
          this.errors.childFullName = "ФИО ребенка обязательно";
          isValid = false;
        }

        if (!this.childForm.birthDate) {
          this.errors.childBirthDate = "Дата рождения обязательна";
          isValid = false;
        } else if (!/^\d{2}\.\d{2}\.\d{4}$/.test(this.childForm.birthDate)) {
          this.errors.birthDate = "Введите дату в формате дд.мм.гггг";
          isValid = false;
        }

        if (!this.childForm.birthCertificate) {
          this.errors.birthCertificate =
            "Необходимо загрузить скан свидетельства о рождении";
          isValid = false;
        }

        if (!this.childForm.snilsNumber) {
          this.errors.snilsNumber = "Номер СНИЛС обязателен";
          isValid = false;
        }

        if (!this.childForm.snilsScan) {
          this.errors.snilsScan = "Необходимо загрузить скан СНИЛС";
          isValid = false;
        }

        if (!this.childForm.grade) {
          this.errors.grade = "Выберите класс обучения";
          isValid = false;
        }

        if (!this.childForm.schoolName) {
          this.errors.schoolName = "Название учреждения обязательно";
          isValid = false;
        }

        if (!this.childForm.platform) {
          this.errors.platform = "Выберите площадку подготовки";
          isValid = false;
        }

        if (!this.childForm.schoolCertificate) {
          this.errors.schoolCertificate = "Необходимо загрузить справку из ОУ";
          isValid = false;
        }

        if (!this.childForm.platformCertificate) {
          this.errors.platformCertificate =
            "Необходимо загрузить справку из площадки подготовки";
          isValid = false;
        }
      }

      if (step === 3) {
        // Валидация выбора наставника и пароля
        if (!this.mentorForm.isParentMentor && !this.mentorForm.mentor) {
          this.errors.mentor =
            "Выберите наставника или отметьте, что вы являетесь наставником";
          isValid = false;
        }

        if (!this.mentorForm.password) {
          this.errors.password = "Пароль обязателен";
          isValid = false;
        } else if (this.mentorForm.password.length < 8) {
          this.errors.password = "Пароль должен содержать минимум 8 символов";
          isValid = false;
        }

        if (!this.mentorForm.confirmPassword) {
          this.errors.confirmPassword = "Подтверждение пароля обязательно";
          isValid = false;
        } else if (
          this.mentorForm.password !== this.mentorForm.confirmPassword
        ) {
          this.errors.confirmPassword = "Пароли не совпадают";
          isValid = false;
        }

        // Проверка согласия с условиями использования
        if (!this.parentForm.agreement) {
          this.errors.agreement =
            "Необходимо согласиться с политикой использования сервиса";
          isValid = false;
        }
      }

      return isValid;
    },

    nextStep() {
      if (this.validateStep(this.currentStep)) {
        this.currentStep++;
      }
    },

    previousStep() {
      this.currentStep--;
    },

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

    validateTelegramLink() {
      if (
        this.parentForm.telegramLink &&
        !/^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(this.parentForm.telegramLink)
      ) {
        this.errors.telegramLink = "Введите корректную ссылку";
      } else this.errors.telegramLink = "";
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

        if (fieldName === "childConsentFile") {
          this.parentForm.childConsentFile = file;
        } else {
          const childTypedKey = fieldName as keyof typeof this.childForm;
          (this.childForm[childTypedKey] as File) = file;
        }
        (this.errors[typedFieldName] as string) = "";
      }
    },

    handleSubmit: async function () {
      if (!this.validateStep(3)) return;

      this.isLoading = true;
      this.errors.toastPopup = {
        title: "",
        message: "",
      };

      try {
        const authResolver = new AuthResolver();
        const response = await authResolver.preRegister({
          email: this.parentForm.email.toLowerCase(),
          mobileNumber: this.parentForm.phone,
        });

        if (response.status !== 200) {
          this.errors.toastPopup = {
            title: `Ошибка #${response.status}`,
            message: response.message,
          };
        } else {
          const fileManager = new FileManager();
          const registrationData: RegistrationData<
            UserWithChildRegistrationDto,
            ParentStateInterface
          > = {
            dto: {
              type: "UserWithChildRegistrationDto",
              verificationCode: "",
              lastName: this.parentForm.fullName.split(" ")[0],
              firstName: this.parentForm.fullName.split(" ")[1],
              patronymic: this.parentForm.fullName.split(" ")[2],
              dateOfBirth: this.formatBirthDate(this.parentForm.birthDate),
              email: this.parentForm.email.toLowerCase(),
              mobileNumber: this.mobileNumberFormatted,
              password: this.mentorForm.password,
              role: Roles.USER,
              uuid: "",
              mentorEqualsUser: this.mentorForm.isParentMentor,
              childLastName: this.childForm.fullName.split(" ")[0],
              childFirstName: this.childForm.fullName.split(" ")[1],
              childPatronymic: this.childForm.fullName.split(" ")[2],
              childDateOfBirth: this.formatBirthDate(this.childForm.birthDate),
              mentorId: this.mentorForm.isParentMentor ? null : 0,
            },
            extra: {
              snilsNumber: this.snilsFormatted,
              snilsFileName: await fileManager.saveFileToCache(
                this.childForm.snilsScan as File,
              ),
              studyingPlace: this.childForm.schoolName,
              studyingCertificateFileName: await fileManager.saveFileToCache(
                this.childForm.schoolCertificate as File,
              ),
              learningClass: this.childForm.grade as number,
              trainingGround: this.childForm.platform as string,
              additionalStudyingCertificateFileName:
                await fileManager.saveFileToCache(
                  this.childForm.platformCertificate as File,
                ),
              parentRole: this.parentForm.relationship,
              consentToChildPdpFileName: await fileManager.saveFileToCache(
                this.parentForm.childConsentFile,
              ),
              birthCertificateFileName: await fileManager.saveFileToCache(
                this.childForm.birthCertificate as File,
              ),
            },
          };
          localStorage.setItem(
            "dataToVerify",
            JSON.stringify(registrationData),
          );
          localStorage.setItem(
            "telegramLink",
            JSON.stringify(this.telegramLinkFormatted),
          );
          this.$router.push({
            path: "/email-confirmation",
            query: { email: this.parentForm.email.toLowerCase() },
          });
        }
      } catch (error) {
        console.error("Ошибка регистрации:", error);
      } finally {
        this.isLoading = false;
      }
    },

    showAgreement() {
      this.showAgreementDialog = true;
    },

    showPolitics() {
      this.showPoliticsDialog = true;
    },

    onParentMentorChange() {
      // Если родитель является наставником, очищаем выбор наставника
      if (this.mentorForm.isParentMentor) {
        this.mentorForm.mentor = null;
        this.errors.mentor = "";
      }
    },
  },
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.register-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.8s ease-out 0.2s both;
}

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

.register-header {
  text-align: center;
  padding: 2rem 2rem 0 2rem;
  flex-shrink: 0;
  background: white;
  border-radius: 12px 12px 0 0;
}

.divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #e0e0e0 20%,
    #e0e0e0 80%,
    transparent 100%
  );
  margin: 1.5rem 0 0 0;
}

.register-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 2rem 2rem 2rem;
  scrollbar-width: thin;
  scrollbar-color: #ff9800 #f1f1f1;
}

.logo-container {
  margin-bottom: 1.5rem;
}

.logo {
  max-width: 120px;
  height: auto;
  object-fit: contain;
}

.register-title {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 600;
  font-family: "BIPS", sans-serif;
}

/* Индикатор шагов */
.steps-indicator {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
  gap: 1.5rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.step.active,
.step.completed {
  opacity: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #ff9800;
  color: white;
}

.step.completed .step-number {
  background: #4caf50;
  color: white;
}

.step-label {
  font-size: 0.75rem;
  color: #666;
  text-align: center;
  margin-top: 0.25rem;
}

.step.active .step-label,
.step.completed .step-label {
  color: #2c3e50;
  font-weight: 500;
}

.step-content {
  animation: fadeInUp 0.6s ease-out;
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

.step-title {
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.step-navigation {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
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

.agreement-label {
  font-size: 0.9rem;
  color: #2c3e50;
  line-height: 1.4;
}

.link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password-input) {
  width: 100%;
}

:deep(.p-fileupload) {
  width: 100%;
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

/* Кастомный скроллбар */
.register-content::-webkit-scrollbar {
  width: 8px;
}

.register-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
  margin: 8px 0;
}

.register-content::-webkit-scrollbar-thumb {
  background: #ff9800;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.register-content::-webkit-scrollbar-thumb:hover {
  background: #f57c00;
}

/* Общие мобильные стили */
@media (max-width: 768px) {
  .register-container {
    padding: 1rem;
  }

  .register-card {
    margin: 0;
    border-radius: 12px;
  }

  .register-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }

  .register-content {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
  }

  .register-title {
    font-size: 1.5rem;
  }

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

  /* Поля ввода */
  .p-inputtext,
  .p-password-input,
  select {
    padding: 0.875rem;
    font-size: 1rem;
  }

  /* Диалоги на мобильных */
  :deep(.p-dialog) {
    width: 95vw !important;
    margin: 1rem;
  }
}
</style>
