<script lang="ts">

  import { type UserStateInterface } from '@/state/UserState.types.ts';
  import { FormatManager } from '@/utils/FormatManager.ts';
  import { useAuthStore } from '@/stores/authStore.ts';
  import { useUserStore } from '@/stores/userStore.ts';
  import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
  import { TelegramLinkResolver } from '@/api/resolvers/telegramLink/telegram-link.resolver.ts';
  import Dialog from 'primevue/dialog';
  import InputMask from 'primevue/inputmask';
  import InputText from 'primevue/inputtext';
  import Button from 'primevue/button';

  export default {
    name: 'EditCredentialsDialog',
    components: {
      Dialog,
      InputMask,
      InputText,
      Button
    },
    props: {
      showSettingsProp: {
        type: Boolean,
        required: true,
      },
    },
    emits: ['update'],
    data() {
      return {
        userResolver: new UserResolver(),
        telegramLinkResolver: new TelegramLinkResolver(),
        authStore: useAuthStore(),
        userStore: useUserStore(),

        isLoading: false,
        showUserSettingsDialog: this.showSettingsProp,

        userForm: {
          lastName: '',
          firstName: '',
          patronymic: null as string | null,
          birthDate: '',
          email: '',
          telegramLink: '',
          mobileNumber: '',
        },

        userErrors: {
          lastName: '',
          firstName: '',
          birthDate: '',
          email: '',
          telegramLink: '',
          mobileNumber: '',
        },
      }
    },
    computed: {
      telegramLinkFormatted() {
        return this.userForm.telegramLink.replace("@", "https://t.me/");
      },
    },
    watch: {
      showSettingsProp(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.showUserSettingsDialog = this.showSettingsProp
        }
        if (this.showUserSettingsDialog) this.showSettings()
      },
      showUserSettingsDialog() {
        if (!this.showUserSettingsDialog)
          this.$emit('update', this.showUserSettingsDialog);
      }
    },
    methods: {
      validateTelegramLink() {
        if (
          this.userForm.telegramLink &&
          !/^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(this.userForm.telegramLink)
        ) {
          this.userErrors.telegramLink = "Введите корректную ссылку";
        } else this.userErrors.telegramLink = "";
      },

      validateEmail() {
        if (
          this.userForm.email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.userForm.email)
        ) {
          this.userErrors.email = "Введите корректный email";
        } else {
          this.userErrors.email = "";
        }
      },
      showSettings() {
        const user = this.userStore.user as UserStateInterface | null
        if (user === null) return
        this.userForm = {
          lastName: user.lastName,
          firstName: user.firstName,
          patronymic: user.patronymic,
          birthDate: FormatManager.formatBirthDateFromDTO(user.dateOfBirth!),
          email: user.email,
          mobileNumber: user.mobileNumber,
          telegramLink: (user.telegramLink ?? "")
            .replace("https://t.me/", "\@")
            .replaceAll("\"", ""),
        }
        this.showUserSettingsDialog = true
      },
      async saveSettings() {
        this.isLoading = true
        await this.userResolver.update({
          id: this.userStore.user!.id,
          lastName: this.userForm.lastName,
          firstName: this.userForm.firstName,
          patronymic: this.userForm.patronymic,
          mobileNumber: FormatManager.formatMobileNumberToDTO(this.userForm.mobileNumber),
          email: this.userForm.email
        })
        const tgData = await this.authStore.loadByTokens()
        await this.telegramLinkResolver.update({
          id: tgData!.telegramLink!.id,
          tgLink: this.telegramLinkFormatted
        })
        const userData = await this.authStore.loadByTokens()
        await this.userStore.fillUser(userData!)
        this.isLoading = false
        this.showUserSettingsDialog = false
      },
    },
  };
</script>

<template>
  <Dialog
    v-model:visible="showUserSettingsDialog"
    header="Редактировать профиль"
    :modal="true"
    :style="{ width: '600px', maxWidth: '90vw', maxHeight: '95vh' }"
  >
    <form
      class="child-form"
      @submit.prevent="saveSettings"
    >
      <div class="field">
        <label
          for="lastName"
          class="field-label"
        >Фамилия *</label>
        <InputText
          id="lastName"
          v-model="userForm.lastName"
          placeholder="Введите вашу полную фамилию"
          class="w-full"
          :class="{ 'p-invalid': userErrors.lastName }"
        />
        <small
          v-if="userErrors.lastName"
          class="p-error"
        >{{ userErrors.lastName }}</small>
      </div>

      <div class="field">
        <label
          for="firstName"
          class="field-label"
        >Имя *</label>
        <InputText
          id="firstName"
          v-model="userForm.firstName"
          placeholder="Введите ваше полное имя"
          class="w-full"
          :class="{ 'p-invalid': userErrors.firstName }"
        />
        <small
          v-if="userErrors.firstName"
          class="p-error"
        >{{ userErrors.firstName }}</small>
      </div>

      <div class="field">
        <label
          for="patronymic"
          class="field-label"
        >Отчество</label>
        <InputText
          id="patronymic"
          v-model="userForm.patronymic"
          placeholder="Введите ваше полное отчество"
          class="w-full"
        />
      </div>

      <div class="field">
        <label
          for="birthDate"
          class="field-label"
        >Дата рождения</label>
        <InputMask
          id="birthDate"
          v-model="userForm.birthDate"
          mask="99.99.9999"
          disabled="true"
          placeholder="дд.мм.гггг"
          class="w-full"
          :class="{ 'p-invalid': userErrors.birthDate }"
        />
        <small
          v-if="userErrors.birthDate"
          class="p-error"
        >{{ userErrors.birthDate }}</small>
      </div>

      <div class="field">
        <label
          for="telegramLink"
          class="field-label"
        >Ссылка на Telegram *</label>
        <InputText
          id="telegramLink"
          v-model="userForm.telegramLink"
          placeholder="Например, @telegram_username"
          class="w-full"
          :class="{ 'p-invalid': userErrors.telegramLink }"
          @blur="validateTelegramLink"
        />
        <small
          v-if="userErrors.telegramLink"
          class="p-error"
        >{{ userErrors.telegramLink }}</small>
      </div>

      <div class="field">
        <label
          for="mobileNumber"
          class="field-label"
        >Контактный телефон *</label>
        <InputMask
          id="mobileNumber"
          v-model="userForm.mobileNumber"
          mask="+7 (999) 999-99-99"
          placeholder="+7 (___) ___-__-__"
          class="w-full"
          :class="{ 'p-invalid': userErrors.mobileNumber }"
        />
        <small
          v-if="userErrors.mobileNumber"
          class="p-error"
        >{{ userErrors.mobileNumber }}</small>
      </div>

      <div class="field">
        <label
          for="email"
          class="field-label"
        >Адрес электронной почты</label>
        <InputText
          id="email"
          v-model="userForm.email"
          disabled="true"
          type="email"
          placeholder="example@email.com"
          class="w-full"
          :class="{ 'p-invalid': userErrors.email }"
          @blur="validateEmail"
        />
        <small
          v-if="userErrors.email"
          class="p-error"
        >{{ userErrors.email }}</small>
      </div>

      <Button
        label="Сохранить"
        icon="pi pi-save"
        style="width: 100%; margin-top: 1rem"
        class="p-button-primary"
        type="submit"
        :loading="isLoading"
      />
    </form>
  </Dialog>
</template>

<style scoped>

</style>