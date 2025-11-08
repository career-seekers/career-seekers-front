<template>
  <div class="mentors-page">
    <div class="page-header">
      <h1 class="page-title">
        Кураторы
      </h1>
      <p class="page-subtitle">
        Управление кураторами
      </p>
    </div>

    <div class="filters-section sticky-filters">
      <div class="search-group">
        <InputText
          v-model="searchQuery"
          placeholder="Поиск по ФИО куратора, образовательному учреждению, номеру телефона или электронной почте..."
          class="search-input"
        />
        <i class="pi pi-search search-icon" />
      </div>
    </div>

    <!-- Список кураторов -->
    <div
      class="experts-grid"
      v-if="paginatedTutors.length > 0"
    >
      <div
        v-for="tutor in paginatedTutors"
        :key="tutor.id"
        class="expert-card"
      >
        <div class="expert-header">
          <div class="expert-avatar">
            <i class="pi pi-user" />
          </div>
          <div class="expert-info">
            <h3 class="expert-name">
              {{
                tutor.lastName +
                  " " +
                  tutor.firstName +
                  " " +
                  tutor.patronymic
              }}
            </h3>
            <p class="expert-position">
              {{ tutor.tutorDocuments !== null ? 'Подтверждено' : 'Не подтверждено' }}
            </p>
          </div>
          <div class="expert-actions">
            <Button
              v-tooltip="'Редактировать'"
              icon="pi pi-pencil"
              class="p-button-text p-button-sm"
              style="background: white"
              @click="editTutor(tutor)"
            />
            <Button
              v-tooltip="'Удалить'"
              icon="pi pi-trash"
              class="p-button-text p-button-sm p-button-danger"
              style="background: white"
              @click="deleteTutor(tutor)"
            />
          </div>
        </div>

        <div class="expert-content">
          <div class="expert-details">
            <div class="detail-item">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ tutor.email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Телефон:</span>
              <span class="detail-value">{{
                reformatPhone(tutor.mobileNumber)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Должность:</span>
              <span class="detail-value">{{
                tutor.tutorDocuments 
                  ? tutor.tutorDocuments.post
                  : "Не указано"
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Образовательное учреждение:</span>
              <span class="detail-value">{{
                tutor.tutorDocuments
                  ? tutor.tutorDocuments.institution
                  : "Не указано"
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ProgressSpinner
      v-else
      style="width: 100%; margin-top: 10rem"
    />

    <!-- Обычная пагинация (скрывается при скролле) -->
    <div
      class="pagination-container"
      v-if="paginatedTutors.length > 0"
    >
      <Paginator
        :first="currentPage * itemsPerPage"
        :rows="itemsPerPage"
        :total-records="totalRecords"
        :rows-per-page-options="[8, 16, 24, 32]"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        @page="onPageChange"
      />
    </div>


    <!-- Диалог редактирования куратора -->
    <Dialog
      v-model:visible="showEditTutorDialog"
      :header="
        isEditing ? 'Редактировать эксперта' : 'Добавить главного эксперта'
      "
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div class="expert-form">
        <div class="form-field">
          <label for="fullName">ФИО *</label>
          <InputText
            id="fullName"
            v-model="tutorForm.fullName"
            placeholder="Введите ФИО эксперта"
            :class="{ 'p-invalid': !tutorForm.fullName }"
          />
          <small
            v-if="errors.fullName"
            class="p-error"
          >{{
            errors.fullName
          }}</small>
        </div>

        <div class="form-field">
          <label for="birthDate">Дата рождения *</label>
          <InputMask
            id="birthDate"
            v-model="tutorForm.birthDate"
            mask="99.99.9999"
            class="w-full"
            placeholder="дд.мм.гггг"
            :class="{ 'p-invalid': !tutorForm.birthDate }"
          />
          <small
            v-if="errors.birthDate"
            class="p-error"
          >{{
            errors.birthDate
          }}</small>
        </div>

        <div class="form-field">
          <label for="email">Email *</label>
          <InputText
            id="email"
            v-model="tutorForm.email"
            type="email"
            placeholder="Введите email"
            :class="{ 'p-invalid': !tutorForm.email }"
          />
          <small
            v-if="errors.email"
            class="p-error"
          >{{ errors.email }}</small>
        </div>

        <div class="form-field">
          <label
            for="parentPhone"
            class="field-label"
          >Контактный телефон *</label>
          <InputMask
            id="parentPhone"
            v-model="tutorForm.phone"
            mask="+7 (999) 999-99-99"
            placeholder="+7 (___) ___-__-__"
            class="w-full"
            :class="{ 'p-invalid': !tutorForm.phone }"
          />
          <small
            v-if="errors.phone"
            class="p-error"
          >{{ errors.phone }}</small>
        </div>

        <div class="form-field">
          <label for="institution">Место работы *</label>
          <InputText
            id="institution"
            v-model="tutorForm.institution"
            placeholder="Введите место работы"
            :class="{ 'p-invalid': !tutorForm.institution }"
          />
          <small
            v-if="errors.institution"
            class="p-error"
          >{{
            errors.institution
          }}</small>
        </div>

        <div class="form-field">
          <label for="post">Должность *</label>
          <InputText
            id="post"
            v-model="tutorForm.post"
            placeholder="Введите должность"
            :class="{ 'p-invalid': !tutorForm.post}"
          />
          <small
            v-if="errors.post"
            class="p-error"
          >{{ errors.post }}</small>
        </div>
      </div>

      <template #footer>
        <Button
          label="Отмена"
          icon="pi pi-times"
          class="p-button-text"
          @click="cancelEdit"
        />
        <Button
          :label="isEditing ? 'Сохранить' : 'Добавить'"
          icon="pi pi-check"
          class="p-button-primary"
          @click="saveTutor"
        />
      </template>
    </Dialog>

    <ToastPopup :content="errors.toastPopup" />
  </div>
</template>

<script lang="ts">
  import ToastPopup from '@/components/ToastPopup.vue';
  import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
  import { Roles } from '@/state/UserState.types.ts';
  import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';
  import Button from 'primevue/button';
  import type { UpdateUserInputDto } from '@/api/resolvers/user/dto/input/update-user-input.dto.ts';
  import Dialog from 'primevue/dialog';
  import InputText from 'primevue/inputtext';
  import InputMask from 'primevue/inputmask';
  import Paginator from 'primevue/paginator';
  import { TutorDocumentsResolver } from '@/api/resolvers/tutorDocuments/tutor-documents.resolver.ts';
  import ProgressSpinner from 'primevue/progressspinner';

  export default {
    name: 'AdminTutors',
    components: {
      ToastPopup,
      Button,
      Dialog,
      InputText,
      InputMask,
      Paginator,
      ProgressSpinner
    },
    data() {
      return {
        userResolver: new UserResolver(),
        tutorDocumentsResolver: new TutorDocumentsResolver(),
        
        tutors: [] as UserOutputDto[],
        isEditing: false,
        editingTutorId: null as null | number,
        oldMail: null as null | string,

        searchQuery: "",

        tutorForm: {
          fullName: "",
          birthDate: "",
          phone: "",
          email: "",
          post: "",
          institution: "",
        },
        
        errors: {
          toastPopup: {
            title: "",
            message: ""
          },
          fullName: "",
          birthDate: "",
          phone: "",
          email: "",
          post: "",
          institution: "",
        },
        
        showEditTutorDialog: false,
        // Пагинация
        currentPage: 0,
        itemsPerPage: 8,
      }
    },
    computed: {
      filteredTutors(): UserOutputDto[] {
        let filtered = this.tutors
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase()
          filtered = filtered.filter(tutor => {
            return tutor.lastName.toLowerCase().includes(query) ||
                tutor.firstName.toLowerCase().includes(query) ||
                tutor.patronymic.toLowerCase().includes(query) ||
                tutor.tutorDocuments?.institution.toLowerCase().includes(query) ||
                tutor.email.toLowerCase().includes(query) ||
                tutor.mobileNumber.toLowerCase().includes(query)
          })
        }
        return filtered.sort((a, b) => a.lastName.localeCompare(b.lastName));
      },

      paginatedTutors(): UserOutputDto[] {
        const start = this.currentPage * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredTutors.slice(start, end);
      },

      totalRecords(): number {
        return this.filteredTutors.length;
      },

      mobileNumberFormatted() {
        return this.tutorForm.phone.replaceAll(/\s|-|\(|\)/g, "");
      },
    },
    async beforeMount() { await this.loadTutors(); },
    methods: {
      editTutor(tutor: UserOutputDto) {
        this.isEditing = true;
        this.editingTutorId = tutor.id;
        this.tutorForm = {
          fullName: `${tutor.lastName} ${tutor.firstName} ${tutor.patronymic}`,
          email: tutor.email,
          phone: this.reformatPhone(tutor.mobileNumber),
          birthDate: this.reformatDateOfBirth(tutor.dateOfBirth),
          post: tutor.tutorDocuments?.post ?? "",
          institution: tutor.tutorDocuments?.institution ?? "",
        };
        this.oldMail = tutor.email;
        this.showEditTutorDialog = true;
      },
      reformatDateOfBirth(date: string) {
        const [year, month, day] = date.substring(0, 10).split("-");
        return `${day}.${month}.${year}`;
      },
      reformatPhone(phone: string) {
        return `${phone.substring(0, 2)} (${phone.substring(2, 5)}) ${phone.substring(5, 8)}-${phone.substring(8, 10)}-${phone.substring(10, 12)}`;
      },
      async saveTutor() {
        if (!this.validateForm()) {
          return;
        }

        if (this.isEditing) {
          const tutor = this.tutors.find(
            (tutor: UserOutputDto) => tutor.id === this.editingTutorId,
          );
          if (tutor) {
            const editedTutor: UpdateUserInputDto = {
              firstName: this.tutorForm.fullName.split(" ")[1],
              lastName: this.tutorForm.fullName.split(" ")[0],
              mobileNumber: this.mobileNumberFormatted,
              email: this.tutorForm.email,
              patronymic: this.tutorForm.fullName.split(" ")[2],
              id: this.editingTutorId!,
            };

            if (tutor.tutorDocuments != null) {
              const response = await this.tutorDocumentsResolver.update({
                id: tutor.tutorDocuments.id,
                post: this.tutorForm.post,
                institution: this.tutorForm.institution,
              })
              if (response.status !== 200) {
                this.errors.toastPopup = {
                  title: response.status.toString(),
                  message: response.message.toString()
                }
              }
            }

            const response = await this.userResolver.update(editedTutor);
            if (response.status === 200) {
              this.cancelEdit();
            } else {
              this.errors.toastPopup = {
                title: response.status.toString(),
                message: response.message,
              };
            }
          }
        }
        await this.loadTutors();
      },
      cancelEdit() {
        this.isEditing = false;
        this.editingTutorId = null;
        this.tutorForm = {
          fullName: "",
          email: "",
          phone: "",
          birthDate: "",
          post: "",
          institution: ""
        };
        this.showEditTutorDialog = false;
      },
      validateForm() {
        let isValid = true;

        if (!this.tutorForm.fullName.trim()) {
          this.errors.fullName = "ФИО обязательно";
          isValid = false;
        }

        if (!this.tutorForm.email.trim()) {
          this.errors.email = "email обязателен";
          isValid = false;
        }

        if (!this.tutorForm.phone.trim()) {
          this.errors.phone = "Номер телефона обязателен";
          isValid = false;
        }

        if (!this.tutorForm.birthDate.trim()) {
          this.errors.birthDate = "Дата рождения обязательна";
          isValid = false;
        }

        if (!this.tutorForm.post.trim()) {
          this.errors.post = "Должность обязательна";
          isValid = false;
        }

        if (!this.tutorForm.institution.trim()) {
          this.errors.institution = "Образовательное учреждение обязательно";
          isValid = false;
        }

        return isValid;
      },
      async loadTutors() {
        const response = await this.userResolver.getAllByRole(Roles.TUTOR)
        if (typeof response.message !== "string") {
          this.tutors = response.message
        }
      },
      async deleteTutor(tutor: UserOutputDto) {
        if (
          confirm(`Вы уверены, что хотите удалить куратора ${tutor.firstName}?`)
        ) {
          const response = await this.userResolver.delete(tutor.id);
          if (response.status === 200) {
            await this.loadTutors();
          } else {
            this.errors.toastPopup = {
              title: response.status.toString(),
              message: response.message,
            };
          }
        }
      },

      onPageChange(event: any) {
        this.currentPage = event.page;
        this.itemsPerPage = event.rows;
        // Плавная прокрутка к началу списка
        this.$nextTick(() => {
          const grid = this.$el.querySelector('.experts-grid');
          if (grid) {
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      },

    },
  };
</script>

<style scoped>

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

  .experts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
    width: 100%;
  }

  .expert-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    overflow: hidden;
    transition:
      box-shadow 0.3s ease,
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

  .filters-section {
    display: flex;
    gap: 1rem;
    align-items: end;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    flex-wrap: wrap;
  }

  /* Sticky фильтры */
  .sticky-filters {
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease;
  }

  .sticky-filters:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .search-group {
    position: relative;
    flex: 1;
    min-width: 250px;
  }

  .search-input {
    width: 100%;
    padding-right: 2.5rem;
  }

  .search-icon {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    pointer-events: none;
  }

  .expert-info {
    flex: 1;
  }

  .expert-name {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .expert-position {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .expert-actions {
    display: flex;
    gap: 0.5rem;
  }

  .expert-content {
    padding: 1.5rem;
  }

  .expert-details {
    margin-bottom: 1.5rem;
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

  /* Форма */
  .expert-form {
    padding: 1rem 0;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    margin: 1rem 0;
  }

  .form-field label {
    color: #2c3e50;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  /* Мобильные стили */
  @media (max-width: 768px) {

    .experts-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .page-title {
      font-size: 1.5rem;
    }

    .expert-header {
      padding: 1rem;
      flex-direction: column;
      text-align: center;
    }

    .expert-avatar {
      width: 50px;
      height: 50px;
      font-size: 1.2rem;
    }

    .expert-content {
      padding: 1rem;
    }

    .detail-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .detail-value {
      text-align: left;
    }
  }

  /* Очень маленькие экраны */
  @media (max-width: 480px) {

    .page-title {
      font-size: 1.3rem;
    }

    .page-subtitle {
      font-size: 0.9rem;
    }

    .expert-header {
      padding: 0.75rem;
    }

    .expert-avatar {
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }

    .expert-name {
      font-size: 1rem;
    }

    .expert-position {
      font-size: 0.8rem;
    }

    .expert-content {
      padding: 0.75rem;
    }
  }

  /* Стили для пагинации */
  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
    margin-bottom: 2rem;
    padding: 1rem;
    transition: opacity 0.3s ease;
  }



  /* Простые анимации для карточек */
  .expert-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .expert-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
</style>
