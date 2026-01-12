<script lang="ts">
  import { type PropType } from 'vue';
  import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';
  import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
  import Button from 'primevue/button';
  import Paginator from 'primevue/paginator';
  import type { EventOutputDto } from '@/api/resolvers/events/dto/output/event-output.dto.ts';
  import { eventFormatOptions, eventTypeOptions, EventVerifications } from '@/api/resolvers/events/dto/types.d';
  import { FormatManager } from '@/utils/FormatManager.ts';
  import { useUserStore } from '@/stores/userStore.ts';
  import { Roles } from '@/state/UserState.types.ts';

  export default {
    name: 'EventsList',
    components: {
      Button,
      Paginator,
    },
    props: {
      enableVerification: {
        type: Boolean,
        default: false,
      },
      events: {
        type: Array as PropType<EventOutputDto[]>,
        required: true,
      },
      experts: {
        type: Array as PropType<UserOutputDto[]>,
        required: true,
      },
      totalPages: {
        type: Number,
        required: true,
      },
      currentPage: {
        type: Number,
        required: true,
      },
      pageSize: {
        type: Number,
        required: true,
      },
      totalRecords: {
        type: Number,
        required: true,
      }
    },
    emits: ['update', 'delete', 'verify', 'page-change'],
    data() {
      return {
        userStore: useUserStore(),

        eventTypes: eventTypeOptions,
        eventFormats: eventFormatOptions,

        userResolver: new UserResolver(),
      }
    },
    computed: {
      EventVerifications() {
        return EventVerifications
      },
      FormatManager() {
        return FormatManager
      },
    },
    methods: {
      allowedToEdit(event: EventOutputDto) {
        const user = this.userStore.user
        if (event.verified !== EventVerifications.UNCHECKED) return false;
        return user?.role === Roles.ADMIN ||
          (user?.role === Roles.TUTOR && event.directionTutorId === user?.id) ||
          (user?.role === Roles.EXPERT && event.directionExpertId === user?.id)
      },
      eventExpert(event: EventOutputDto) {
        return this.experts.find((expert) => expert.id === event.directionExpertId);
      },
      verifyEvent(event: EventOutputDto, status: EventVerifications) {
        const action = status === EventVerifications.ACCEPTED ? 'Принять' : 'Отклонить';
        const actionPast = status === EventVerifications.ACCEPTED ? 'принято' : 'отклонено';

        this.$emit('verify', {
          event,
          status,
          action,
          actionPast,
          showConfirm: true
        });
      },
    }
  };
</script>

<template>
  <div
    v-if="events.length > 0"
    class="events-grid"
  >
    <div
      v-for="event in events"
      :key="event.id"
      class="event-card"
    >
      <div class="event-header">
        <div class="event-icon">
          <i class="pi pi-calendar-times" />
        </div>
        <div class="event-info">
          <h3 class="event-name">
            #{{ event.id }} {{ event.name }}
          </h3>
        </div>
        <div
          v-if="allowedToEdit(event) || userStore.user?.id === 4"
          class="event-actions"
        >
          <Button
            v-tooltip="'Редактировать'"
            icon="pi pi-pencil"
            style="background: white"
            class="p-button-text p-button-sm p-button-danger"
            @click="$emit('update', event)"
          />
          <Button
            v-tooltip="'Удалить'"
            icon="pi pi-trash"
            style="background: white"
            class="p-button-text p-button-sm p-button-danger"
            @click="$emit('delete', event)"
          />
        </div>
      </div>

      <div class="event-content">

        <div
          class="description-info"
        >
          <h4 class="description-title">
            Краткое описание:
          </h4>
          <p class="mentor-name">
            {{ event.shortDescription }}
          </p>
        </div>

        <div class="event-details">
          <div class="detail-item">
            <span class="detail-label">Тип:</span>
            <span class="detail-value">{{
                eventTypes.find(eventType => eventType.value === event.eventType)?.label
              }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Формат:</span>
            <span class="detail-value">
              {{
                eventFormats.find(eventFormat => eventFormat.value === event.eventFormat)?.label
              }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Дата и время:</span>
            <span class="detail-value">{{
                FormatManager.formatDateFromDTO(event.startDateTime)
              }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Компетенция:</span>
            <span class="detail-value">{{
                event.directionName
              }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Возрастная группа:</span>
            <span class="detail-value">{{
                event.directionAgeCategoryName
              }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Место проведения:</span>
            <span class="detail-value">
              <a
                v-if="event.eventFormat.toString() === 'ONLINE'"
                target="_blank"
                :href="event.eventVenue"
              >
                {{ event.eventVenue }}
              </a>
              <i v-else>{{ event.eventVenue }}</i>
            </span>
          </div>
        </div>

        <div
          v-if="event.description"
        >
          <h4 class="mentor-title">
            Примечание:
          </h4>
          <p class="description-optional">
            {{ event.description }}
          </p>
        </div>

        <div
          class="mentor-info"
        >
          <h4 class="mentor-title">
            Связанный эксперт:
          </h4>
          <p
            v-if="eventExpert(event)"
            class="mentor-name"
          >
            {{
              eventExpert(event)?.lastName +
              " " +
              eventExpert(event)?.firstName +
              " " +
              eventExpert(event)?.patronymic
            }}
          </p>
          <p
            v-else
            class="mentor-name"
          >
            ...
          </p>
        </div>
        <div
          v-if="event.verified === EventVerifications.UNCHECKED && enableVerification"
          class="verify"
        >
          <Button
            icon="pi pi-check"
            style="background: white"
            label="Принять"
            class="p-button-text p-button-sm p-button-success"
            @click="verifyEvent(event, EventVerifications.ACCEPTED)"
          />
          <Button
            icon="pi pi-times"
            style="background: white"
            label="Отклонить"
            class="p-button-text p-button-sm p-button-danger"
            @click="verifyEvent(event, EventVerifications.REJECTED)"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Обычная пагинация (скрывается при скролле) -->
  <div
    v-if="events.length > 0"
    class="pagination-container"
  >
    <Paginator
      :first="currentPage * pageSize"
      :rows="pageSize"
      :total-records="totalRecords"
      :rows-per-page-options="[2, 4, 8, 16]"
      template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      @page="(event) => $emit('page-change', event)"
    />
  </div>
</template>

<style scoped>

  .events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
    width: 100%;
    margin-bottom: 4rem;
  }

  .event-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    overflow: hidden;
    transition:
      box-shadow 0.3s ease,
      border-color 0.3s ease;
  }

  .event-card:hover {
    box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
    border: 2px solid #ff9800;
  }

  .event-header {
    background: linear-gradient(135deg, #ff9800, #f57c00);
    color: white;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .event-icon {
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

  .status-title {
    display: flex;
    justify-content: space-between;
  }

  .status-title .unchecked {
    color: yellow;
  }

  .status-title .accepted {
    color: lime;
  }

  .status-title .rejected {
    color: red
  }

  .event-info {
    flex: 1;
  }

  .event-name {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .event-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .event-content {
    padding: 1.5rem;
  }

  .description-info {
    margin-bottom: 1rem;
  }

  .description-optional {
    font-style: italic;
    margin: 0.5rem 0 1.5rem 0;
  }

  .mentor-name {
    font-style: italic;
    margin: 0.5rem 0;
  }

  .description-title,
  .mentor-title {
    margin: 0;
  }

  .event-details {
    margin-bottom: 1rem;
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

  .verify {
    display: flex;
    gap: 1.5rem;
    justify-content: flex-end;
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
  .event-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .event-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  /* Стили для диалога подтверждения */
  :deep(.p-confirm-dialog) {
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  :deep(.p-confirm-dialog .p-dialog-header) {
    background: linear-gradient(135deg, #ff9800, #f57c00);
    color: white;
    border-radius: 12px 12px 0 0;
    padding: 1.5rem;
  }

  :deep(.p-confirm-dialog .p-dialog-title) {
    font-weight: 600;
    font-size: 1.1rem;
  }

  :deep(.p-confirm-dialog .p-dialog-content) {
    padding: 2rem 1.5rem;
    background: #f8f9fa;
  }

  :deep(.p-confirm-dialog .p-dialog-message) {
    color: #2c3e50;
    font-size: 1rem;
    line-height: 1.5;
    margin: 0;
  }

  :deep(.p-confirm-dialog .p-dialog-footer) {
    padding: 1rem 1.5rem 1.5rem;
    background: white;
    border-radius: 0 0 12px 12px;
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  :deep(.p-confirm-dialog .p-button) {
    border-radius: 8px;
    font-weight: 500;
    padding: 0.75rem 1.5rem;
    transition: all 0.3s ease;
  }

  :deep(.p-confirm-dialog .p-button-danger) {
    background: #dc3545;
    border-color: #dc3545;
  }

  :deep(.p-confirm-dialog .p-button-danger:hover) {
    background: #c82333;
    border-color: #bd2130;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  }

  :deep(.p-confirm-dialog .p-button-text) {
    color: #6c757d;
    background: transparent;
    border: 1px solid #dee2e6;
  }

  :deep(.p-confirm-dialog .p-button-text:hover) {
    background: #f8f9fa;
    border-color: #adb5bd;
    color: #495057;
  }

  @media screen and (max-width: 768px) {
    .events-grid {
      grid-template-columns: 1fr;
    }
  }
</style>