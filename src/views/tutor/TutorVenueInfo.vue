<template>
  <div class="venue-info-page">
    <div class="page-header">
      <h1 class="page-title">Информация о площадке</h1>
      <p class="page-subtitle">
        Управление информацией о вашей образовательной площадке
      </p>
    </div>

    <div class="venue-form-container">
      <div class="form-card">
        <div class="form-header">
          <h3 class="form-title">
            <i class="pi pi-building"></i>
            Основная информация
          </h3>
          <!--          <div class="status-badge">-->
          <!--            {{ venueData }}-->
          <!--          </div>-->
        </div>

        <div class="form-content">
          <form @submit.prevent="">
            <div class="form-section">
              <h4 class="section-title">Общие данные</h4>

              <div class="form-row">
                <div class="form-field full-width">
                  <label for="venueName">Название площадки *</label>
                  <InputText
                    id="venueName"
                    v-model="venueData.fullName"
                    placeholder="Введите название площадки"
                    :class="{ 'p-invalid': !venueData.fullName }"
                    :disabled="venueData.verified"
                  />
                  <small v-if="errors.fullName" class="p-error">{{
                    errors.fullName
                  }}</small>
                </div>
              </div>

              <div class="form-row">
                <div class="form-field full-width">
                  <label for="venueName">Краткое название площадки *</label>
                  <InputText
                    id="venueName"
                    v-model="venueData.shortName"
                    placeholder="Введите краткое название площадки"
                    :class="{ 'p-invalid': !venueData.shortName }"
                    :disabled="venueData.verified"
                  />
                  <small v-if="errors.shortName" class="p-error">{{
                    errors.shortName
                  }}</small>
                </div>
              </div>

              <div class="form-row">
                <div class="form-field full-width">
                  <label for="venueAddress">Адрес *</label>
                  <InputText
                    id="venueAddress"
                    v-model="venueData.address"
                    placeholder="Введите полный адрес площадки"
                    :class="{ 'p-invalid': !venueData.address }"
                    :disabled="venueData.verified"
                  />
                  <small v-if="errors.address" class="p-error">{{
                    errors.address
                  }}</small>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h4 class="section-title">Контактная информация</h4>

              <div class="form-field">
                <label for="contactEmail">Email *</label>
                <InputText
                  id="contactEmail"
                  v-model="venueData.email"
                  placeholder="info@venue.ru"
                  :class="{ 'p-invalid': !venueData.email }"
                  :disabled="venueData.verified"
                />
                <small v-if="errors.email" class="p-error">{{
                  errors.email
                }}</small>
              </div>

              <div class="form-row"></div>

              <div class="form-field">
                <label for="website">Веб-сайт</label>
                <InputText
                  id="website"
                  v-model="venueData.website"
                  placeholder="https://venue.ru"
                  :disabled="venueData.verified"
                />
              </div>
            </div>

            <div class="form-actions">
              <Button
                label="Редактировать"
                icon="pi pi-pencil"
                class="p-button-outlined"
                @click="editPlatform"
                :disabled="!venueData.verified"
              />
              <Button
                label="Отправить на модерацию"
                icon="pi pi-send"
                class="p-button-primary"
                @click="sendForModeration"
                :disabled="!isChanged"
              />
            </div>
          </form>
        </div>
      </div>

      <!-- История изменений -->
      <!--      <div class="history-card">-->
      <!--        <div class="card-header">-->
      <!--          <h3 class="card-title">-->
      <!--            <i class="pi pi-history"></i>-->
      <!--            История изменений-->
      <!--          </h3>-->
      <!--        </div>-->
      <!--        <div class="card-content">-->
      <!--          <div class="history-list">-->
      <!--            <div-->
      <!--              v-for="change in changeHistory"-->
      <!--              :key="change.id"-->
      <!--              class="history-item"-->
      <!--            >-->
      <!--              <div class="history-icon">-->
      <!--                <i :class="change.icon"></i>-->
      <!--              </div>-->
      <!--              <div class="history-content">-->
      <!--                <div class="history-text">{{ change.text }}</div>-->
      <!--                <div class="history-time">{{ change.time }}</div>-->
      <!--              </div>-->
      <!--            </div>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </div>-->
    </div>
    <ToastPopup :content="errors.toastPopup" />
  </div>
</template>

<script lang="ts">
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import InputNumber from "primevue/inputnumber";
import { PlatformOutputDto } from "@/api/resolvers/platform/dto/output/platform-output.dto";
import { UserState } from "../../../state/UserState";
import { PlatformInputDto } from "@/api/resolvers/platform/dto/input/platform-input.dto";
import { PlatformResolver } from "@/api/resolvers/platform/platform.resolver";
import ToastPopup from "@/components/ToastPopup.vue";

export default {
  name: "TutorVenueInfo",
  components: {
    ToastPopup,
    Button,
    InputText,
    Textarea,
    InputNumber,
  },
  data() {
    return {
      platformResolver: new PlatformResolver(),
      oldMail: "",
      cachedData: null,
      isChanged: false,
      venueData: {
        id: null,
        fullName: "",
        shortName: "",
        address: "",
        email: "",
        website: "",
        verified: false,
        userId: UserState.id,
      } as PlatformOutputDto,
      errors: {
        toastPopup: {
          title: "",
          message: "",
        },
        fullName: "",
        shortName: "",
        address: "",
        email: "",
      },
      changeHistory: [
        {
          id: 1,
          icon: "pi pi-send",
          text: "Информация отправлена на модерацию",
          time: "15.12.2024, 14:30",
        },
        {
          id: 2,
          icon: "pi pi-pencil",
          text: "Обновлено описание площадки",
          time: "15.12.2024, 14:25",
        },
        {
          id: 3,
          icon: "pi pi-plus",
          text: "Добавлена информация об оборудовании",
          time: "15.12.2024, 14:20",
        },
        {
          id: 4,
          icon: "pi pi-file-edit",
          text: "Создана первая версия информации о площадке",
          time: "10.12.2024, 10:15",
        },
      ],
    };
  },
  watch: {
    venueData: {
      handler() {
        if (this.cachedData === null) this.cachedData = { ...this.venueData };
        this.isChanged =
          JSON.stringify(this.venueData) !== JSON.stringify(this.cachedData);
      },
      deep: true,
    },
  },
  methods: {
    async sendForModeration() {
      if (this.validateForm()) {
        this.venueData.moderationStatus = "На модерации";
        this.addHistoryEntry(
          "pi pi-send",
          "Информация отправлена на модерацию",
        );

        const data: PlatformInputDto = {
          userId: UserState.id,
          fullName: this.venueData.fullName,
          shortName: this.venueData.shortName,
          address: this.venueData.address,
          email: this.venueData.email,
          website: this.venueData.website,
          verified: false,
        };

        const response =
          this.venueData.verified || this.venueData.id !== null
            ? await this.platformResolver.update({
                id: this.venueData.id,
                ...data,
                email:
                  this.oldMail === this.venueData.email
                    ? undefined
                    : this.venueData.email,
              })
            : await this.platformResolver.create(data);

        if (response.status === 200) {
          await this.loadPlatform();
        } else {
          this.errors.toastPopup = {
            title: response.status,
            message: response.message,
          };
        }
      }
    },
    editPlatform() {
      if (this.venueData.verified && this.venueData.id !== null) {
        this.venueData.verified = false;
      }
    },
    async loadPlatform() {
      const response = await this.platformResolver.getByUserId(UserState.id);
      if (response.status === 200) {
        this.oldMail = response.message.email;
        this.venueData = response.message;
        this.cachedData = null;
      }
    },
    validateForm() {
      let isValid = true;
      if (!this.venueData.fullName.trim()) {
        this.errors.fullName = "Полное название обязательно";
        isValid = false;
      }
      if (!this.venueData.shortName.trim()) {
        this.errors.shortName = "Краткое название обязательно";
        isValid = false;
      }
      if (!this.venueData.address.trim()) {
        this.errors.address = "Адрес обязателен";
        isValid = false;
      }
      if (!this.venueData.email.trim()) {
        this.errors.email = "Адрес электронной почты обязателен";
        isValid = false;
      }
      return isValid;
    },
    addHistoryEntry(icon, text) {
      const newEntry = {
        id: Date.now(),
        icon,
        text,
        time: new Date().toLocaleString("ru-RU"),
      };
      this.changeHistory.unshift(newEntry);
    },
  },
  async mounted() {
    await this.loadPlatform();
  },
};
</script>

<style scoped>
.venue-info-page {
  max-width: 1000px;
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

.venue-form-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  width: 100%;
}

.form-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  overflow: hidden;
  transition:
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}

.form-card:hover {
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
  border: 2px solid #ff9800;
}

.form-header {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.form-title i {
  margin-right: 0.75rem;
  font-size: 1.1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.status-approved {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid #28a745;
}

.status-rejected {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid #dc3545;
}

.status-draft {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
  border: 1px solid #6c757d;
}

.form-content {
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #ff9800;
  padding-bottom: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.history-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  overflow: hidden;
  transition:
    box-shadow 0.3s ease,
    border-color 0.3s ease;
  height: fit-content;
}

.history-card:hover {
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
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.card-title i {
  margin-right: 0.75rem;
  font-size: 1rem;
}

.card-content {
  padding: 1.5rem;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.history-item:last-child {
  border-bottom: none;
}

.history-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.history-content {
  flex: 1;
}

.history-text {
  color: #2c3e50;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.history-time {
  color: #6c757d;
  font-size: 0.8rem;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .venue-info-page {
    padding: 0 1rem;
    max-width: 100%;
    width: 100%;
  }

  .venue-form-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .form-content {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .card-content {
    padding: 1rem;
  }
}

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .venue-info-page {
    padding: 0 0.5rem;
    max-width: 100%;
    width: 100%;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
  }

  .form-header {
    padding: 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .form-content {
    padding: 1rem;
  }

  .form-section {
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 1rem;
  }

  .form-row {
    gap: 0.75rem;
  }

  .form-actions {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
  }

  .card-header {
    padding: 1rem;
  }

  .card-content {
    padding: 0.75rem;
  }

  .history-icon {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }

  .history-text {
    font-size: 0.85rem;
  }

  .history-time {
    font-size: 0.75rem;
  }
}
</style>
