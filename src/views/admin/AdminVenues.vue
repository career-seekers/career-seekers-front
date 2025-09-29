<template>
  <div class="mentors-page">
    <div class="page-header">
      <h1 class="page-title">
        Площадки
      </h1>
      <p class="page-subtitle">
        Управление площадками
      </p>
    </div>

    <!-- Кнопка добавления эксперта -->
    <div class="filters-section sticky-filters">
      <div class="search-group">
        <InputText
          v-model="searchQuery"
          placeholder="Поиск по названию площадки..."
          class="search-input"
        />
        <i class="pi pi-search search-icon" />
      </div>
    </div>

    <!-- Список площадок -->
    <div class="venues-grid">
      <div
        v-for="venue in paginatedVenues"
        :key="venue.id"
        class="venue-card"
      >
        <div class="venue-header">
          <div class="venue-avatar">
            <i class="pi pi-building" />
          </div>
          <div class="venue-info">
            <h3 class="venue-name">
              {{ venue.shortName }}
            </h3>
          </div>
          <div class="venue-actions">
            <Button
              v-tooltip="'Верифицировать'"
              :disabled="venue.verified"
              icon="pi pi-check"
              class="p-button-text p-button-sm"
              style="background: white"
              @click="verifyVenue(venue)"
            />
            <Button
              v-tooltip="'Удалить'"
              icon="pi pi-trash"
              class="p-button-text p-button-sm p-button-danger"
              style="background: white"
              @click="deleteVenue(venue)"
            />
          </div>
        </div>
        <div class="venue-content">
          <div class="venue-details">
            <div class="detail-item">
              <span class="detail-label">Полное название:</span>
              <span class="detail-value">{{ venue.fullName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Адрес:</span>
              <span class="detail-value">{{ venue.address }}</span>
            </div>
            <div
              v-if="venue.website"
              class="detail-item"
            >
              <span class="detail-label">Сайт:</span>
              <span class="detail-value">
                <a
                  :href="venue.website"
                  target="_blank"
                >
                  {{ venue.website }}
                </a>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Статус:</span>
              <span class="detail-value">{{ venue.verified ? 'Верифицирована' : 'Не верифицирована' }}</span>
            </div>
          </div>

          <div
            v-if="venueTutor(venue)"
            class="mentor-info"
          >
            <h4 class="mentor-title">
              Связанный куратор:
            </h4>
            <p class="mentor-name">
              {{
                venueTutor(venue)?.lastName + " " +
                  venueTutor(venue)?.firstName + " " +
                  venueTutor(venue)?.patronymic
              }}
            </p>
          </div>
        </div>
        <ToastPopup :content="errors.toastPopup" />
      </div>
    </div>

    <!-- Обычная пагинация (скрывается при скролле) -->
    <div
      class="pagination-container"
      :class="{ 'hidden': showFloatingPagination }"
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
  </div>
</template>

<script lang="ts">
  import Button from "primevue/button";
  import InputText from "primevue/inputtext";
  import Paginator from "primevue/paginator";
  import ToastPopup from "@/components/ToastPopup.vue";
  import type { UserOutputDto } from "@/api/resolvers/user/dto/output/user-output.dto.ts";
  import { Roles } from "@/state/UserState.types";
  import type { PlatformOutputDto } from '@/api/resolvers/platform/dto/output/platform-output.dto.ts';
  import { PlatformResolver } from '@/api/resolvers/platform/platform.resolver.ts';
  import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';

  export default {
    name: "AdminVenues",
    components: {
      ToastPopup,
      Button,
      InputText,
      Paginator,
    },
    data() {
      return {
        searchQuery: "",
        oldMail: "",
        showAddVenueDialog: false,
        isEditing: false,
        editingVenueId: null as null | number,
        errors: {
          toastPopup: {
            title: "",
            message: "",
          },
          fullName: "",
          shortName: "",
          address: "",
          email: "",
          website: "",
        },
        venues: [] as PlatformOutputDto[],
        tutors: [] as UserOutputDto[],
        platformResolver: new PlatformResolver(),
        userResolver: new UserResolver(),
        // Пагинация
        currentPage: 0,
        itemsPerPage: 8,
      };
    },
    computed: {
      filteredVenues(): PlatformOutputDto[] {
        let filtered = this.venues
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase()
          filtered = filtered.filter(venue => {
            return venue.fullName.toLowerCase().includes(query) ||
              venue.shortName.toLowerCase().includes(query)
          })
        }
        return filtered
      },

      paginatedVenues(): PlatformOutputDto[] {
        const start = this.currentPage * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredVenues.slice(start, end);
      },

      totalRecords(): number {
        return this.filteredVenues.length;
      },
    },
    watch: {
      showAddVenueDialog() {
        this.errors = {
          toastPopup: {
            title: "",
            message: "",
          },
          fullName: "",
          shortName: "",
          address: "",
          email: "",
          website: "",
        };
      },
    },
    async beforeMount() {
      await this.loadVenues();
      await this.loadTutors()
    },
    methods: {
      venueTutor(venue: PlatformOutputDto) {
        return this.tutors.find(tutor => tutor.id === venue.userId)
      },
      async deleteVenue(venue: PlatformOutputDto) {
        if (
          confirm(`Вы уверены, что хотите удалить площадку ${venue.shortName}?`)
        ) {
          const response = await this.platformResolver.delete(venue.id);
          if (response.status === 200) {
            await this.loadVenues();
          } else {
            this.errors.toastPopup = {
              title: response.status.toString(),
              message: response.message,
            };
          }
        }
      },
      async verifyVenue(venue: PlatformOutputDto) {
        const response = await this.platformResolver.updatePlatformVerification(venue.id)
        if (response.status === 200) {
          venue.verified = true
        } else {
          this.errors.toastPopup = {
            title: response.status.toString(),
            message: response.message.toString(),
          };
        }
      },
      async loadVenues() {
        console.log('Loading venues...');
        console.log('PlatformResolver:', this.platformResolver);
        console.log('Access token for venues:', localStorage.getItem("access_token"));
        console.log('API endpoint for venues:', 'https://api.career-seekers.ru/events-service/v1/platforms');
        const response = await this.platformResolver.getAll();
        console.log('Venues response:', response);
        console.log('Venues response status:', response.status);
        console.log('Venues response message:', response.message);
        if (response.status === 200 && typeof response.message !== "string") {
          this.venues = response.message;
          console.log('Venues loaded:', this.venues);
        } else {
          console.error('Failed to load venues:', response);
          this.errors.toastPopup = {
            title: response.status.toString(),
            message: response.message.toString(),
          };
        }
      },
      async loadTutors() {
        const response = await this.userResolver.getAllByRole(Roles.TUTOR);
        if (response.status === 200 && typeof response.message !== "string") {
          this.tutors = response.message;
        } else {
          this.errors.toastPopup = {
            title: response.status.toString(),
            message: response.message.toString(),
          };
        }
      },

      onPageChange(event: any) {
        this.currentPage = event.page;
        this.itemsPerPage = event.rows;
        // Плавная прокрутка к началу списка
        this.$nextTick(() => {
          const grid = this.$el.querySelector('.venues-grid');
          if (grid) {
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      },

    },
  };
</script>

<style scoped>
  .venues-page {
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

  .page-actions {
    margin-bottom: 2rem;
    text-align: right;
  }

  .venues-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
    width: 100%;
  }

  .venue-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    overflow: hidden;
    transition:
      box-shadow 0.3s ease,
      border-color 0.3s ease;
  }

  .venue-card:hover {
    box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
    border: 2px solid #ff9800;
  }

  .venue-header {
    background: linear-gradient(135deg, #ff9800, #f57c00);
    color: white;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .venue-avatar {
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

  .venue-info {
    flex: 1;
  }

  .venue-name {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .venue-position {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .venue-actions {
    display: flex;
    gap: 0.5rem;
  }

  .venue-content {
    padding: 1.5rem;
  }

  .venue-details {
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

  .competencies-section {
    margin-bottom: 1.5rem;
  }

  .competencies-title {
    color: #2c3e50;
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    font-weight: 600;
    border-bottom: 2px solid #ff9800;
    padding-bottom: 0.25rem;
  }

  .competencies-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .competence-tag {
    background: #f8f9fa;
    color: #2c3e50;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    border: 1px solid #e9ecef;
  }

  .venue-status {
    text-align: center;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .status-active {
    background: rgba(40, 167, 69, 0.2);
    color: #28a745;
    border: 1px solid #28a745;
  }

  .status-pending {
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
    border: 1px solid #ffc107;
  }

  .status-inactive {
    background: rgba(108, 117, 125, 0.2);
    color: #6c757d;
    border: 1px solid #6c757d;
  }

  /* Форма */
  .venue-form {
    padding: 1rem 0;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    margin: 1rem 0;
  }

  .form-field.full-width {
    grid-column: 1 / -1;
  }

  .form-field label {
    color: #2c3e50;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  /* Мобильные стили */
  @media (max-width: 768px) {
    .venues-page {
      padding: 0 1rem;
      max-width: 100%;
      width: 100%;
    }

    .venues-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .page-title {
      font-size: 1.5rem;
    }

    .venue-header {
      padding: 1rem;
      flex-direction: column;
      text-align: center;
    }

    .venue-avatar {
      width: 50px;
      height: 50px;
      font-size: 1.2rem;
    }

    .venue-content {
      padding: 1rem;
    }

    .form-row {
      grid-template-columns: 1fr;
      gap: 0.75rem;
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
    .venues-page {
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

    .venue-header {
      padding: 0.75rem;
    }

    .venue-avatar {
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }

    .venue-name {
      font-size: 1rem;
    }

    .venue-position {
      font-size: 0.8rem;
    }

    .venue-content {
      padding: 0.75rem;
    }

    .competence-tag {
      font-size: 0.75rem;
      padding: 0.2rem 0.5rem;
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
  .venue-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .venue-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
</style>
