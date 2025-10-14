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
          Регистрация наставника
        </h1>
        <div class="divider" />
      </div>

      <div class="register-content">
        <form
          class="register-form"
          @submit.prevent="handleRegister"
        >
          <div class="field">
            <label
              for="lastName"
              class="field-label"
            >Фамилия *</label>
            <InputText
              id="lastName"
              v-model="registerForm.lastName"
              placeholder="Введите вашу полную фамилию"
              class="w-full"
              :class="{ 'p-invalid': errors.lastName }"
            />
            <small
              v-if="errors.lastName"
              class="p-error"
            >{{
              errors.lastName
            }}</small>
          </div>

          <div class="field">
            <label
              for="firstName"
              class="field-label"
            >Имя *</label>
            <InputText
              id="firstName"
              v-model="registerForm.firstName"
              placeholder="Введите ваше полное имя"
              class="w-full"
              :class="{ 'p-invalid': errors.firstName }"
            />
            <small
              v-if="errors.firstName"
              class="p-error"
            >{{
              errors.firstName
            }}</small>
          </div>

          <div class="field">
            <label
              for="patronymic"
              class="field-label"
            >Отчество</label>
            <InputText
              id="patronymic"
              v-model="registerForm.patronymic"
              placeholder="Введите ваше полное отчество"
              class="w-full"
            />
          </div>

          <div class="field">
            <label
              for="parentBirthDate"
              class="field-label"
            >Дата рождения *</label>
            <InputMask
              id="parentBirthDate"
              v-model="registerForm.birthDate"
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
              for="position"
              class="field-label"
            >Должность *</label>
            <InputText
              id="position"
              v-model="registerForm.position"
              placeholder="Введите вашу должность"
              class="w-full"
              :class="{ 'p-invalid': errors.position }"
            />
            <small
              v-if="errors.position"
              class="p-error"
            >{{
              errors.position
            }}</small>
          </div>

          <div class="field">
            <label
              for="educationalInstitution"
              class="field-label"
            >Образовательное учреждение *</label>
            <InputText
              id="educationalInstitution"
              v-model="registerForm.educationalInstitution"
              placeholder="Введите название учебного заведения"
              class="w-full"
              :class="{ 'p-invalid': errors.educationalInstitution }"
            />
            <small
              v-if="errors.educationalInstitution"
              class="p-error"
            >{{
              errors.educationalInstitution
            }}</small>
          </div>

          <div class="field">
            <label
              for="telegramLink"
              class="field-label"
            >Ссылка на Telegram *</label>
            <InputText
              id="relationship"
              v-model="registerForm.telegramLink"
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
              for="phone"
              class="field-label"
            >Контактный телефон *</label>
            <InputMask
              id="phone"
              v-model="registerForm.phone"
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
              v-model="registerForm.email"
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
            <label
              for="password"
              class="field-label"
            >Пароль *</label>
            <Password
              id="password"
              v-model="registerForm.password"
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
              v-model="registerForm.confirmPassword"
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
                v-model="registerForm.consent"
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

          <div class="field">
            <div class="flex align-items-center">
              <Checkbox
                v-model="registerForm.agreement"
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
                >
                  политикой использования сервиса
                </a>
              </label>
            </div>
            <small
              v-if="errors.agreement"
              class="p-error"
            >{{
              errors.agreement
            }}</small>
          </div>

          <div class="field">
            <div class="flex align-items-center">
              <Checkbox
                v-model="registerForm.rules"
                input-id="rules"
                :binary="true"
                :class="{ 'p-invalid': errors.rules }"
              />
              <label
                for="rules"
                class="ml-2 agreement-label"
              >
                с
                <a
                  href="#"
                  class="link"
                  @click.prevent="showRules"
                >
                  Положением
                </a>
                ознакомлен
              </label>
            </div>
            <small
              v-if="errors.rules"
              class="p-error"
            >{{
              errors.rules
            }}</small>
          </div>

          <Button
            type="submit"
            label="Зарегистрироваться"
            class="w-full register-button"
            :loading="isLoading"
          />

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
        <p class="footer-text">
          <a href="https://t.me/career_seekers_help">Техническая поддержка <strong>(10:00-20:00)</strong></a>
          <a href="tel:89675900328">8 (967) 590-03-28 <strong>(10:00-18:00)</strong></a>
        </p>
      </div>
    </div>

    <!-- Диалог условий использования -->
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
          source="/docs/agreement_mentor.pdf"
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

    <Dialog
      v-model:visible="showRulesDialog"
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
          left: 0;
          top: 0;
          height: 90vh;
          width: 100%;
          overflow: hidden;
          background-color: white;
          border-radius: 6px;
        "
      >
        <iframe
          title="PDF Document"
          width="100%"
          height="100%"
          :src="rulesLink"
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
          @click="showRulesDialog = false"
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
import Checkbox from "primevue/checkbox";
import Dialog from "primevue/dialog";
import ToastPopup from "@/components/ToastPopup.vue";
import { AuthResolver } from "@/api/resolvers/auth/auth.resolver.js";
import type { UserRegistrationDto } from "@/api/resolvers/auth/dto/input/register-input.dto.ts";
import {
  type MentorCachedData,
  type RegistrationData, Roles,
} from '@/state/UserState.types';
import { FileManager } from "@/utils/FileManager";
import VuePdfEmbed from "vue-pdf-embed";

export default {
  name: "MentorRegisterView",
  components: {
    VuePdfEmbed,
    ToastPopup,
    InputText,
    InputMask,
    Password,
    Button,
    Checkbox,
    Dialog,
  },
  data() {
    return {
      isLoading: false,
      showPoliticsDialog: false,
      showAgreementDialog: false,
      showRulesDialog: false,
      registerForm: {
        firstName: "",
        lastName: "",
        patronymic: null,
        birthDate: "",
        position: "",
        educationalInstitution: "",
        telegramLink: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        rules: false,
        consent: false,
        consentFile: new File(["Содержимое файла"], "myfile.txt", {
          type: "text/plain",
        }),
        agreement: false,
      },
      errors: {
        lastName: "",
        firstName: "",
        birthDate: "",
        position: "",
        educationalInstitution: "",
        telegramLink: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        consent: "",
        agreement: "",
        rules: "",
        toastPopup: {
          title: "",
          message: "",
        },
      },
    };
  },
  computed: {
    rulesLink() {
      return "/public/docs/rules.pdf#toolbar=0&#navpanes=0&#view=Fit"
    },
    mobileNumberFormatted() {
      return this.registerForm.phone.replaceAll(/\s|-|\(|\)|/g, "");
    },
    dateOfBirthFormatted() {
      const [day, month, year] = this.registerForm.birthDate.split(".");
      const date = new Date(
        Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)),
      );
      return date.toISOString();
    },
    telegramLinkFormatted() {
      return this.registerForm.telegramLink.replace("@", "https://t.me/");
    },
  },
  methods: {
    validateEmail() {
      if (
        this.registerForm.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.registerForm.email)
      ) {
        this.errors.email = "Введите корректный email";
      } else this.errors.email = "";
    },

    validateTelegramLink() {
      if (
        this.registerForm.telegramLink &&
        !/^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(this.registerForm.telegramLink)
      ) {
        this.errors.telegramLink = "Введите корректную ссылку";
      } else this.errors.telegramLink = "";
    },

    validatePassword() {
      if (!this.registerForm.password) {
        this.errors.password = "Пароль обязателен";
        return;
      } else if (this.registerForm.password.length < 8) {
        this.errors.password = "Пароль должен содержать минимум 8 символов";
        return;
      } else if (
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.registerForm.password)
      ) {
        this.errors.password =
          "Пароль должен содержать заглавные и строчные буквы, а также цифры";
        return;
      }
      this.errors.password = "";
    },

    validateForm() {
      // Очищаем предыдущие ошибки

      Object.keys(this.errors).forEach((key) => {
        const typedKey = key as keyof typeof this.errors;
        if (typeof this.errors[typedKey] === "string") {
          (this.errors[typedKey] as string) = "";
        } else {
          (this.errors[typedKey] as { title: string; message: string; }) = {
            title: '',
            message: ''
          };
        }
      });

      let isValid = true;

      // Проверка ФИО
      if (!this.registerForm.lastName.trim()) {
        this.errors.lastName = "Фамилия обязательна";
        isValid = false;
      }

      if (!this.registerForm.firstName.trim()) {
        this.errors.firstName = "Имя обязательно";
        isValid = false;
      }

      //Проверка даты рождения
      if (!this.registerForm.birthDate.trim()) {
        this.errors.birthDate = "Дата рождения обязательна";
        isValid = false;
      }

      // Проверка образовательного учреждения
      if (!this.registerForm.educationalInstitution.trim()) {
        this.errors.educationalInstitution =
          "Образовательное учреждение обязательно";
        isValid = false;
      }

      // Проверка должности
      if (!this.registerForm.position.trim()) {
        this.errors.position = "Должность обязательна";
        isValid = false;
      }

      //Проверка телеграм ссылки
      if (!this.registerForm.telegramLink.trim()) {
        this.errors.telegramLink = "Ссылка обязательна для связи";
        isValid = false;
      } else if (
        !/^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(this.registerForm.telegramLink)
      ) {
        this.errors.telegramLink = "Введите корректную ссылку";
        isValid = false;
      }

      // Проверка телефона
      if (!this.registerForm.phone) {
        this.errors.phone = "Телефон обязателен";
        isValid = false;
      } else if (this.registerForm.phone.replace(/\D/g, "").length !== 11) {
        this.errors.phone = "Введите корректный номер телефона";
        isValid = false;
      }

      // Проверка email
      if (!this.registerForm.email) {
        this.errors.email = "Email обязателен";
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.registerForm.email)) {
        this.errors.email = "Введите корректный email";
        isValid = false;
      }

      // Проверка пароля
      if (!this.registerForm.password) {
        this.errors.password = "Пароль обязателен";
        isValid = false;
      } else if (this.registerForm.password.length < 8) {
        this.errors.password = "Пароль должен содержать минимум 8 символов";
        isValid = false;
      } else if (
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.registerForm.password)
      ) {
        this.errors.password =
          "Пароль должен содержать заглавные и строчные буквы, а также цифры";
        isValid = false;
      }

      // Проверка подтверждения пароля
      if (!this.registerForm.confirmPassword) {
        this.errors.confirmPassword = "Подтверждение пароля обязательно";
        isValid = false;
      } else if (
        this.registerForm.password !== this.registerForm.confirmPassword
      ) {
        this.errors.confirmPassword = "Пароли не совпадают";
        isValid = false;
      }

      // Проверка согласия на обработку данных
      if (!this.registerForm.consent) {
        this.errors.consent =
          "Необходимо согласиться с обработкой персональных данных";
        isValid = false;
      }

      // Проверка согласия с условиями
      if (!this.registerForm.agreement) {
        this.errors.agreement =
          "Необходимо согласиться с политикой использования сервиса";
        isValid = false;
      }

      // Проверка согласия с положением
      if (!this.registerForm.rules) {
        this.errors.rules =
          "Необходимо согласиться с Положением";
        isValid = false;
      }

      return isValid;
    },

    async handleRegister() {
      if (!this.validateForm()) return;
      this.errors.toastPopup = {
        title: "",
        message: "",
      };
      this.isLoading = true;

      try {
        const authResolver = new AuthResolver();
        const response = await authResolver.preRegister({
          email: this.registerForm.email.toLowerCase(),
          mobileNumber: this.mobileNumberFormatted,
        });
        if (response.status !== 200) {
          this.errors.toastPopup = {
            title: `Ошибка #${response.status}`,
            message: response.message,
          };
        } else {
          const fileManager = new FileManager();
          const registrationDto: RegistrationData<UserRegistrationDto, MentorCachedData> = {
            dto: {
              type: "UserRegistrationDto",
              verificationCode: "",
              lastName: this.registerForm.lastName,
              firstName: this.registerForm.firstName,
              patronymic: this.registerForm.patronymic,
              dateOfBirth: this.dateOfBirthFormatted,
              email: this.registerForm.email.toLowerCase(),
              mobileNumber: this.mobileNumberFormatted,
              password: this.registerForm.password,
              role: Roles.MENTOR,
              uuid: "",
            },
            extra: {
              post: this.registerForm.position,
              institution: this.registerForm.educationalInstitution,
              consentToMentorPdpFilename: await fileManager.saveFileToCache(
                this.registerForm.consentFile,
              ),
            },
          };
          localStorage.setItem("dataToVerify", JSON.stringify(registrationDto));
          localStorage.setItem(
            "telegramLink",
            JSON.stringify(this.telegramLinkFormatted),
          );
          this.$router.push({
            path: "/email-confirmation",
            query: { email: this.registerForm.email.toLowerCase() },
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

    showRules() {
      this.showRulesDialog = true;
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
  max-width: 500px;
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

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-top: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: fadeInUp 0.6s ease-out both;
}

.field:nth-child(1) {
  animation-delay: 0.4s;
}
.field:nth-child(2) {
  animation-delay: 0.5s;
}
.field:nth-child(3) {
  animation-delay: 0.6s;
}
.field:nth-child(4) {
  animation-delay: 0.7s;
}
.field:nth-child(5) {
  animation-delay: 0.8s;
}
.field:nth-child(6) {
  animation-delay: 0.9s;
}
.field:nth-child(7) {
  animation-delay: 1s;
}
.field:nth-child(8) {
  animation-delay: 1.1s;
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

.field-label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.register-button {
  margin-top: 0.5rem;
  height: 3rem;
  font-size: 1rem;
  font-weight: 500;
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

/* Кнопки на всю ширину на десктопе */
.p-button {
  width: 100%;
  justify-content: center;
}

:deep(.p-checkbox) {
  margin-right: 0.5rem;
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

.footer-text {
  color: #6c757d;
  margin: 1rem 0 0 0;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  a {
    color: darkcyan;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  a:hover {
    color: #ff9800;
  }
}

/* Мобильные стили */
@media (max-width: 768px) {

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
  .p-password-input {
    padding: 0.875rem;
    font-size: 1rem;
  }

  /* FileUpload на мобильных */
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

  /* Диалоги на мобильных */
  :deep(.p-dialog) {
    width: 95vw !important;
    margin: 1rem;
  }
}
</style>
