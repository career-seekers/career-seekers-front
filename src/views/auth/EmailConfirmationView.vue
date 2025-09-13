<template>
  <div class="confirmation-container">
    <div class="confirmation-card">
      <div class="confirmation-header">
        <div class="logo-container">
          <img
            src="@/assets/logo.png"
            alt="Career Seekers Logo"
            class="logo"
          >
        </div>
        <h1 class="confirmation-title">
          Подтверждение email
        </h1>
        <div class="divider" />
      </div>

      <div class="confirmation-content">
        <form
          class="confirmation-form"
          @submit.prevent="handleConfirmation"
        >
          <div class="field">
            <label
              for="confirmationCode"
              class="field-label"
            >Код подтверждения *</label>
            <InputText
              id="confirmationCode"
              v-model="confirmationForm.code"
              placeholder="Введите код из письма"
              class="w-full"
              :class="{ 'p-invalid': errors.code }"
              maxlength="6"
            />
            <small
              v-if="errors.code"
              class="p-error"
            >{{ errors.code }}</small>
          </div>

          <div class="field">
            <p class="confirmation-info">
              Мы отправили код подтверждения на email:
              <strong>{{ userEmail }}</strong>
            </p>
            <p class="confirmation-note">
              Если письмо не пришло, проверьте папку "Спам" или
              <a
                href="#"
                class="link"
                @click.prevent="resendCode"
              >отправьте код повторно</a>
            </p>
          </div>

          <Button
            type="submit"
            label="Подтвердить"
            class="w-full confirmation-button"
            :loading="isLoading"
          />

          <div class="back-link">
            <p>
              <a
                href="#"
                class="link"
                @click.prevent="goBack"
              >← Вернуться к регистрации</a>
            </p>
          </div>
        </form>
      </div>
    </div>
    <ToastPopup :content="errors.toastPopup" />
  </div>
</template>

<script lang="ts">
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { AuthResolver } from "@/api/resolvers/auth/auth.resolver.js";
import {
  UserRegistrationDto,
  UserWithChildRegistrationDto,
} from "@/api/resolvers/auth/dto/input/register-input.dto";
import { v4 as generateUuidV4 } from "uuid";
import ToastPopup from "@/components/ToastPopup.vue";
import {
  MentorStateInterface,
  ParentStateInterface,
  RegistrationData,
  TutorStateInterface,
} from "@/state/UserState.types";
import { fillUserState, redirectByUserState } from "@/state/UserState";

export default {
  name: "EmailConfirmationView",
  components: {
    ToastPopup,
    InputText,
    Button,
  },
  data() {
    return {
      isLoading: false,
      userEmail: "",
      confirmationForm: {
        code: "",
      },
      errors: {
        toastPopup: {
          title: "",
          message: "",
        },
        code: "",
      },
      authResolver: new AuthResolver(),
      registrationData: (
        JSON.parse(localStorage.getItem("dataToVerify")) as RegistrationData<
          UserWithChildRegistrationDto | UserRegistrationDto,
          TutorStateInterface | MentorStateInterface | ParentStateInterface
        >
      ).dto as UserRegistrationDto | UserWithChildRegistrationDto,
    };
  },
  mounted() {
    // Получаем email из query параметров или localStorage
    this.userEmail =
      this.$route.query.email ||
      localStorage.getItem("userEmail") ||
      "user@example.com";
  },
  methods: {
    validateForm() {
      this.errors.code = "";

      if (!this.confirmationForm.code) {
        this.errors.code = "Код подтверждения обязателен";
        return false;
      }

      if (this.confirmationForm.code.length !== 6) {
        this.errors.code = "Код должен содержать 6 цифр";
        return false;
      }

      if (!/^\d{6}$/.test(this.confirmationForm.code)) {
        this.errors.code = "Код должен содержать только цифры";
        return false;
      }

      return true;
    },

    async handleConfirmation() {
      if (!this.validateForm()) return;

      this.isLoading = true;
      this.errors.toastPopup = {
        title: "",
        message: "",
      };

      try {
        if (this.registrationData.childPatronymic)
          this.registrationData.type = "UserWithChildRegistrationDto";
        else this.registrationData.type = "UserRegistrationDto";
        this.registrationData.uuid = generateUuidV4();
        this.registrationData.verificationCode = this.confirmationForm.code;
        const response = await this.authResolver.register(
          this.registrationData,
        );
        if (typeof response.message === "string") {
          this.errors.toastPopup = {
            title: `Ошибка #${response.status}`,
            message: response.message,
          };
        } else {
          localStorage.setItem("access_token", response.message.accessToken);
          localStorage.setItem("refresh_token", response.message.refreshToken);
          localStorage.setItem("uuid", this.registrationData.uuid);
          await fillUserState();
          await redirectByUserState();
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        this.errors.code = "Неверный код подтверждения";
      } finally {
        this.isLoading = false;
      }
    },

    async resendCode() {
      try {
        const response = await this.authResolver.preRegister({
          email: this.userEmail,
          mobileNumber: this.registrationData.mobileNumber,
        });

        if (response.status !== 200) {
          this.errors.toastPopup = {
            title: `Ошибка #${response.status}`,
            message: response.message,
          };
        } else {
          this.errors.toastPopup = {
            title: "Код отправлен",
            message: "Проверьте почтовый ящик",
          };
        }
      } catch (error) {
        console.error("Ошибка повторной отправки:", error);
      }
    },

    goBack() {
      this.$router.push("/register");
    },
  },
};
</script>

<style scoped>
.confirmation-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.confirmation-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
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

.confirmation-header {
  text-align: center;
  padding: 2rem 2rem 0 2rem;
  flex-shrink: 0;
  background: white;
  border-radius: 12px 12px 0 0;
}

.confirmation-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 2rem 2rem 2rem;
  scrollbar-width: thin;
  scrollbar-color: #ff9800 #f1f1f1;
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

.logo-container {
  margin-bottom: 1.5rem;
}

.logo {
  max-width: 120px;
  height: auto;
  object-fit: contain;
}

.confirmation-title {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 600;
  font-family: "BIPS", sans-serif;
}

.confirmation-form {
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

.confirmation-button {
  margin-top: 0.5rem;
  height: 3rem;
  font-size: 1rem;
  font-weight: 500;
}

.confirmation-info {
  margin: 0;
  color: #2c3e50;
  font-size: 0.9rem;
  line-height: 1.5;
}

.confirmation-note {
  margin: 0.5rem 0 0 0;
  color: #6c757d;
  font-size: 0.85rem;
  line-height: 1.4;
}

.back-link {
  text-align: center;
  margin-top: 1rem;
}

.back-link p {
  margin: 0;
  color: #6c757d;
}

.link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

/* Кастомный скроллбар */
.confirmation-content::-webkit-scrollbar {
  width: 8px;
}

.confirmation-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
  margin: 8px 0;
}

.confirmation-content::-webkit-scrollbar-thumb {
  background: #ff9800;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.confirmation-content::-webkit-scrollbar-thumb:hover {
  background: #f57c00;
}

/* Кнопки на всю ширину на десктопе */
.p-button {
  width: 100%;
  justify-content: center;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.action-buttons .p-button {
  flex: 1;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .confirmation-container {
    padding: 1rem;
  }

  .confirmation-card {
    margin: 0;
    border-radius: 12px;
  }

  .confirmation-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }

  .confirmation-content {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
  }

  .confirmation-title {
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
  .p-inputtext {
    padding: 0.875rem;
    font-size: 1rem;
  }

  /* Кнопки действий */
  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }

  .action-buttons .p-button {
    width: 100%;
    flex: none;
  }
}
</style>
