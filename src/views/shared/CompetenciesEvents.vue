<template>
  <div class="documents-page">
    <div class="page-header">
      <div class="header-text">
        <h1 class="page-title">
          События
        </h1>
        <p class="page-subtitle">
          Управление событиями
        </p>
      </div>
      <Button
        label="Создать событие"
        icon="pi pi-plus"
        class="p-button-sm"
        @click="addEvent"
      />
    </div>
    
    <!-- Фильтры -->
    <div class="filters-section sticky-filters">
      <div class="filter-group">
        <label for="event-type-filter">Тип события:</label>
        <Dropdown
          id="event-type-filter"
          v-model="selectedType"
          option-label="label"
          option-value="value"
          placeholder="Все типы"
          :disabled="isLoading"
          class="filter-dropdown"
        />
      </div>
      <div class="filter-group">
        <label for="event-format-filter">Формат события:</label>
        <Dropdown
          id="event-format-filter"
          v-model="selectedFormat"
          option-label="label"
          option-value="value"
          placeholder="Все форматы"
          :disabled="isLoading"
          class="filter-dropdown"
        />
      </div>
      <div
        v-if="!competenceId"
        class="filter-group"
      >
        <label for="event-competence-filter">Компетенция:</label>
        <AutoComplete
          id="event-competence-filter"
          v-model="selectedCompetence"
          :suggestions="filteredCompetencies"
          dropdown
          field="name"
          placeholder="Все компетенции"
          class="filter-dropdown"
          :disabled="isLoading"
          force-selection
          @complete="filterCompetencies"
        >
          <template #item="slotProps">
            {{ slotProps ? formatCompetenceName(slotProps.item) : "Не выбран" }}
          </template>
          <template #option="slotProps">
            {{ slotProps ? formatCompetenceName(slotProps.option) : "Не выбран" }}
          </template>
        </AutoComplete>
      </div>
      <div
        v-if="!ageCategoryId"
        class="filter-group"
      >
        <label
          for="event-age-category-filter"
          class="field-label"
        >Возрастная группа</label>
        <Dropdown
          id="event-age-category-filter"
          v-model="selectedAgeCategory"
          :options="competenceAgeCategories(selectedCompetence)"
          :disabled="isLoading || !selectedCompetence"
          dropdown
          option-label="label"
          placeholder="Все группы"
          class="filter-dropdown"
        />
      </div>
      <div class="filter-group">
        <Button
          label="Сбросить"
          icon="pi pi-refresh"
          class="p-button-text p-button-sm"
          @click="resetFilters"
        />
      </div>
    </div>

    <!-- Кастомный sticky контейнер для табов -->
    <div
      v-if="isAdmin"
      class="custom-sticky-container"
      :class="{ 'sticky': isSticky }"
    >
      <!-- Табы для документов -->
      <TabView
        v-model:active-index="activeTab"
        class="documents-tabs"
      >
        <TabPanel
          v-for="tab in tabsConfig"
          :key="tab.key"
          :header="tab.header"
          :disabled="!tab.hasEvents"
        >
          <EventsList
            v-if="tab.events.length > 0"
            :events="filterEvents(tab.events)"
            :experts="experts"
            :enable-verification="true"
            @update="loadCompetencies"
            @delete="deleteEvent"
            @verify="verifyEvent"
          />
          <div v-else-if="!isLoading">
            <p>Нет событий</p>
          </div>
          <ProgressSpinner
            v-else
            style="width: 100%; margin-top: 10rem"
          />
        </TabPanel>
      </TabView>
    </div>
    <div v-else>
      <EventsList
        v-if="events.length > 0"
        :events="filterEvents(events)"
        :experts="experts"
        @update="loadCompetencies"
        @delete="deleteEvent"
        @verify="verifyEvent"
      />
      <div v-else-if="!isLoading">
        <p>Нет событий</p>
      </div>
      <ProgressSpinner
        v-else
        style="width: 100%; margin-top: 10rem"
      />
    </div>

    <ToastPopup :content="toastPopup" />

    <!-- Диалог подтверждения удаления -->
    <ConfirmDialog />

    <!-- Диалог добавления/редактирования события -->
    <Dialog
      v-model:visible="showAddEventDialog"
      :header="
        isEditing ? 'Редактировать событие' : 'Добавить событие'
      "
      :modal="true"
      :style="{ width: '550px' }"
    >
      <div class="expert-form">
        <div class="form-field">
          <label for="event-name-input">Название *</label>
          <InputText
            id="event-name-input"
            v-model="eventForm.name"
            placeholder="Введите заголовок для нового события"
            :class="{ 'p-invalid': errors.name }"
          />
          <small
            v-if="errors.name"
            class="p-error"
          >
            {{ errors.name }}
          </small>
        </div>

        <div class="form-field">
          <label for="event-short-description-input">Краткое описание *</label>
          <Textarea
            id="event-short-description-input"
            v-model="eventForm.shortDescription"
            placeholder="Укажите ведущего и основные тезисы мастер-класса"
            auto-resize
            rows="2"
            :class="{ 'p-invalid': errors.shortDescription }"
          />
          <small
            v-if="errors.shortDescription"
            class="p-error"
          >{{ errors.shortDescription }}</small>
        </div>

        <div class="form-field">
          <label
            for="event-start-datetime-input"
            class="field-label"
          >Дата начала *</label>
          <Calendar
            id="event-start-datetime-input"
            v-model="eventForm.startDateTime"
            placeholder="Выберите дату начала"
            show-icon
            show-time
            show-seconds
            :manual-input="false"
            :class="{ 'p-invalid': errors.startDateTime }"
          />
          <small
            v-if="errors.startDateTime"
            class="p-error"
          >{{ errors.startDateTime }}</small>
        </div>

        <div class="form-field">
          <label
            for="event-type-input"
            class="field-label"
          >Тип события *</label>
          <Dropdown
            id="event-type-input"
            v-model="eventForm.eventType"
            :options="eventTypeOptions"
            :class="{ 'p-invalid': errors.eventType }"
            dropdown
            option-label="label"
            option-value="value"
            placeholder="Выберите тип"
            class="filter-dropdown"
          />
          <small
            v-if="errors.ageCategory"
            class="p-error"
          >
            {{ errors.ageCategory }}
          </small>
        </div>

        <div class="form-field">
          <label
            for="event-format-input"
            class="field-label"
          >Формат события *</label>
          <Dropdown
            id="event-format-input"
            v-model="eventForm.eventFormat"
            :options="eventFormatOptions"
            :class="{ 'p-invalid': errors.eventFormat }"
            dropdown
            option-label="label"
            option-value="value"
            placeholder="Выберите формат"
            class="filter-dropdown"
          />
          <small
            v-if="errors.ageCategory"
            class="p-error"
          >
            {{ errors.ageCategory }}
          </small>
        </div>

        <div class="form-field">
          <label
            for="event-competence-input"
            class="field-label"
          >Компетенция *</label>
          <AutoComplete
            id="event-competence-input"
            v-model="eventForm.competence"
            :suggestions="filteredCompetencies"
            :class="{ 'p-invalid': errors.competence }"
            dropdown
            field="name"
            placeholder="Все компетенции"
            class="filter-dropdown"
            force-selection
            @complete="filterCompetencies"
          >
            <template #item="slotProps">
              {{ slotProps ? formatCompetenceName(slotProps.item) : "Не выбран" }}
            </template>
            <template #option="slotProps">
              {{ slotProps ? formatCompetenceName(slotProps.option) : "Не выбран" }}
            </template>
          </AutoComplete>
          <small
            v-if="errors.competence"
            class="p-error"
          >
            {{ errors.competence }}
          </small>
        </div>

        <div class="form-field">
          <label
            for="event-age-category-input"
            class="field-label"
          >Возрастная группа *</label>
          <Dropdown
            id="event-age-category-input"
            v-model="eventForm.ageCategory"
            :options="competenceAgeCategories(eventForm.competence)"
            :disabled="eventForm.competence === null || typeof eventForm.competence === 'string'"
            :class="{ 'p-invalid': errors.ageCategory }"
            dropdown
            option-label="label"
            placeholder="Все возрастные группы"
            class="filter-dropdown"
          />
          <small
            v-if="errors.ageCategory"
            class="p-error"
          >
            {{ errors.ageCategory }}
          </small>
        </div>

        <div class="form-field">
          <label for="event-venue-input">Место проведения *</label>
          <Textarea
            id="event-venue-input"
            v-model="eventForm.eventVenue"
            auto-resize
            rows="2"
            placeholder="Если формат оффлайн - то укажите площадку и ее адрес, если онлайн - укажите ТОЛЬКО ссылку"
          />
        </div>

        <div class="form-field">
          <label for="event-description-input">Примечание</label>
          <Textarea
            id="event-description-input"
            v-model="eventForm.description"
            auto-resize
            rows="5"
            placeholder="Любая дополнительная информация, если необходимо"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="Отмена"
          icon="pi pi-times"
          class="p-button-text"
          @click="showAddEventDialog = false"
        />
        <Button
          :label="isEditing ? 'Сохранить' : 'Добавить'"
          icon="pi pi-check"
          class="p-button-primary"
          @click="saveEvent"
        />
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts">
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import TabView from 'primevue/tabview';
  import TabPanel from 'primevue/tabpanel';
  import { CompetenceResolver } from '@/api/resolvers/competence/competence.resolver.ts';
  import ToastPopup from '@/components/ToastPopup.vue';
  import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
  import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
  import { Roles } from '@/state/UserState.types.ts';
  import AutoComplete from 'primevue/autocomplete';
  import ConfirmDialog from 'primevue/confirmdialog';
  import { useConfirm } from 'primevue/useconfirm';
  import ProgressSpinner from 'primevue/progressspinner';
  import {
    eventFormatOptions,
    EventFormats,
    eventTypeOptions,
    type EventTypes,
  } from '@/api/resolvers/events/dto/types.d';
  import type { EventOutputDto } from '@/api/resolvers/events/dto/output/event-output.dto.ts';
  import EventsList from '@/components/lists/EventsList.vue';
  import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';
  import { EventResolver } from '@/api/resolvers/events/event.resolver.ts';
  import Calendar from 'primevue/calendar';
  import Dialog from 'primevue/dialog';
  import Textarea from 'primevue/textarea';
  import InputText from 'primevue/inputtext';
  import type { EventFormNullable } from '@/utils/validation/forms.types';
  import type { EventFormErrors } from '@/utils/validation/forms-errors.types';
  import { ValidationManager } from '@/utils/validation/ValidationManager.ts';
  import { useAgeGroups } from '@/shared/UseAgeGroups.ts';
  import type { AgeCategoryOutputDto } from '@/api/resolvers/ageCategory/age-category-output.dto.ts';
  import { FormatManager } from '@/utils/FormatManager.ts';
  import type { EventsUrlParamsInputDto } from '@/api/resolvers/events/dto/input/events-url-params-input.dto.ts';
  import { useUserStore } from '@/stores/userStore.ts';

  interface TabConfig {
    key: string;
    header: string;
    events: EventOutputDto[];
    hasEvents: boolean;
  }

  export default {
    name: "CompetenciesEvents",
    components: {
      EventsList,
      ToastPopup,
      Button,
      Dropdown,
      TabView,
      TabPanel,
      AutoComplete,
      ConfirmDialog,
      ProgressSpinner,
      Calendar,
      Dialog,
      Textarea,
      InputText
    },
    props: {
      competenceId: {
        type: String,
        default: "",
      },
      ageCategoryId: {
        type: String,
        default: "",
      }
    },
    setup() {
      const confirm = useConfirm();

      return {
        confirm
      };
    },
    data() {
      return {
        userStore: useUserStore(),

        selectedEvent: null as null | EventOutputDto,
        selectedType: null as null | EventTypes,
        selectedFormat: null as null | EventFormats,
        selectedCompetence: null as CompetenceOutputDto | null,
        selectedAgeCategory: null as AgeCategoryOutputDto | null,

        events: [] as EventOutputDto[],
        competencies: [] as CompetenceOutputDto[],
        experts: [] as UserOutputDto[],
        filteredCompetencies: [] as CompetenceOutputDto[],

        toastPopup: {
          title: "",
          message: "",
        },

        errors: {} as EventFormErrors,
        eventForm: {} as EventFormNullable,

        competenceResolver: new CompetenceResolver(),
        userResolver: new UserResolver(),
        eventResolver: new EventResolver(),

        activeTab: 0,
        ageGroups: useAgeGroups,

        isSticky: false,
        isLoading: false,
        isEditing: false,
        showAddEventDialog: false,

        validationManager: ValidationManager,

        eventTypeOptions: eventTypeOptions,
        eventFormatOptions: eventFormatOptions,
      };
    },
    computed: {
      isAdmin() {
        return this.userStore.user?.role === Roles.ADMIN
      },
      rejectedEvents() {
        return this.events
          .filter((event: EventOutputDto) => event.verified === false)
          .sort((a: EventOutputDto, b: EventOutputDto) => b.id - a.id);
      },
      acceptedEvents() {
        return this.events
          .filter((event: EventOutputDto) => event.verified === true)
          .sort((a: EventOutputDto, b: EventOutputDto) => b.id - a.id);
      },
      uncheckedEvents() {
        return this.events
          .filter((event: EventOutputDto) => event.verified === null)
          .sort((a: EventOutputDto, b: EventOutputDto) => b.id - a.id);
      },
      tabsConfig() {
        const tabs = [
          {
            key: 'unchecked',
            header: 'Необработанные',
            events: this.uncheckedEvents,
            hasEvents: this.uncheckedEvents.length > 0
          },
          {
            key: 'accepted',
            header: 'Принятые',
            events: this.acceptedEvents,
            hasEvents: this.acceptedEvents.length > 0
          },
          {
            key: 'rejected',
            header: 'Отклоненные',
            events: this.rejectedEvents,
            hasEvents: this.rejectedEvents.length > 0
          }
        ];

        return tabs.sort((a, b) => {
          if (a.hasEvents && !b.hasEvents) return -1;
          if (!a.hasEvents && b.hasEvents) return 1;
          return 0;
        });
      },
    },
    watch: {
      tabsConfig: {
        handler(newTabsConfig: TabConfig[]) {
          const availableTabs = newTabsConfig.filter((tab: TabConfig) => tab.hasEvents);
          if (availableTabs.length > 0) {
            const currentTab = newTabsConfig[this.activeTab];
            if (!currentTab || !currentTab.hasEvents) {
              this.activeTab = 0;
            }
          }
        },
        immediate: true
      },
      eventForm: {
        handler() {
          this.errors = {} as EventFormErrors;
        },
        deep: true
      }
    },
    async mounted() {
      console.log(this.selectedCompetence)
      await this.renderPage(null);
    },
    methods: {
      async renderPage(eventsParams:  EventsUrlParamsInputDto | null) {

        this.isLoading = true;
        await Promise.all([
          this.loadCompetencies(),
          this.loadExperts(),
          this.loadEvents(eventsParams)
        ]);

        // Устанавливаем selectedCompetence только если ID валидный
        if (this.competenceId && !isNaN(Number(this.competenceId))) {
          this.selectedCompetence = this.competencies.find(
            comp => comp.id === Number(this.competenceId)
          ) ?? null;
        }

        this.isLoading = false;
      },
      validateParams() {
        const competenceId = this.competenceId;
        const ageCategoryId = this.ageCategoryId;

        // Если ID не число или невалидный → сбрасываем
        if (competenceId && (isNaN(Number(competenceId)) || Number(competenceId) <= 0)) {
          return false;
        }

        return !(ageCategoryId && (isNaN(Number(ageCategoryId)) || Number(ageCategoryId) <= 0));
      },
      competenceAgeCategories(competence: CompetenceOutputDto | null | string) {
        if (competence === null || typeof competence === "string") return this.ageGroups
        return [...competence.ageCategories]
          .filter(category => this.ageGroups
            .some(group => category.ageCategory === group.value)
          )
          .map(category => ({
            ...category,
            label: this.ageGroups
              .find(group => category.ageCategory === group.value)?.label
          }));
      },
      filterCompetencies(event: { query: string }) {
        const query = event.query ? event.query.toLowerCase() : '';
        let filtered = [];
        if (!query.length) {
          filtered = [...this.competencies];
        } else {
          filtered = [...this.competencies].filter(competence =>
            this.formatCompetenceName(competence).toLowerCase().includes(query))
        }

        const uniqueByName = new Map();
        filtered.forEach(item => {
          if (!uniqueByName.has(item.id)) {
            uniqueByName.set(item.id, item);
          }
        });

        this.filteredCompetencies = [...uniqueByName.values()]
          .sort((a, b) => a.name.localeCompare(b.name));
      },
      formatCompetenceName(competence: CompetenceOutputDto) {
        if (!competence) return '';
        const expert = this.experts.find(expert => expert.id === competence.expertId)
        return expert
          ? `${competence.name} (${expert?.lastName} ${expert?.firstName.substring(0, 1)}.${expert?.patronymic.substring(0, 1)}.)`
          : competence.name
      },
      filterEvents(events: EventOutputDto[]) {
        let filteredEvents = [...events]
        if (this.selectedType) {
          filteredEvents = filteredEvents
            .filter(event => event.eventType === this.selectedType)
        }

        if (this.selectedFormat !== null) {
          filteredEvents = filteredEvents
            .filter(event => event.eventFormat === this.selectedFormat)
        }

        if (this.competenceId) {
          filteredEvents = filteredEvents
            .filter(event => event.directionId.toString() === this.competenceId)
        }

        if (this.ageCategoryId) {
          filteredEvents = filteredEvents
            .filter(event => event.directionAgeCategoryId.toString() === this.ageCategoryId)
        }

        return filteredEvents;
      },
      resetFilters() {
        this.selectedType = null;
        this.selectedFormat = null;
        this.selectedCompetence = null;
        this.selectedAgeCategory = null;
      },
      async loadCompetencies() {
        const response = await this.competenceResolver.getAll();
        if (response.status === 200 && typeof response.message !== "string") {
          this.competencies = response.message
        } else {
          console.error('Failed to load competencies in AdminEvents:', response);
        }
      },
      async loadEvents(params: EventsUrlParamsInputDto | null) {
        this.events = []
        const response = await this.eventResolver.getAll(params)
        if (response.status === 200 && typeof response.message !== "string") {
          this.events = response.message.content
        }
      },
      async loadExperts() {
        const expResponse = await this.userResolver.getAllByRole(Roles.EXPERT);
        if (expResponse.status === 200 && typeof expResponse.message !== "string") {
          this.experts = expResponse.message;
        }

        const tutResponse = await this.userResolver.getAllByRole(Roles.TUTOR);
        if (tutResponse.status === 200 && typeof tutResponse.message !== "string") {
          this.experts = this.experts.concat(tutResponse.message);
        }
      },
      deleteEvent(event: EventOutputDto) {
        this.confirm.require({
          message: `Вы уверены, что хотите удалить событие №${event.id}?`,
          header: 'Подтверждение удаления',
          icon: 'pi pi-exclamation-triangle',
          rejectLabel: 'Отмена',
          acceptLabel: 'Удалить',
          acceptClass: 'p-button-danger',
          rejectClass: 'p-button-text',
          accept: async () => {
            try {
              const response = await this.eventResolver.delete(event.id);
              if (response.status === 200) {
                // Локально удаляем документ из списка без полной перезагрузки
                const eventIndex = this.events.findIndex(ev => ev.id === event.id);
                if (eventIndex !== -1) {
                  this.events.splice(eventIndex, 1);
                }

                // Также удаляем документ из компетенций
                this.competencies.forEach(competence => {
                  const evIndex = competence.documents.findIndex(ev => ev.id === event.id);
                  if (evIndex !== -1) {
                    competence.documents.splice(evIndex, 1);
                  }
                });

                // Удаляем компетенции без документов
                this.competencies = this.competencies.filter(competence => competence.documents.length > 0);

                // Показываем уведомление об успешном удалении
                this.toastPopup = {
                  title: "Успешно",
                  message: "Событие успешно удалено",
                };
              }
            } catch (error) {
              console.error('Ошибка при удалении события:', error);
              this.toastPopup = {
                title: "Ошибка",
                message: "Не удалось удалить событие",
              };
            }
          }
        });
      },
      verifyEvent(data: {
        event: EventOutputDto,
        status: boolean,
        success?: boolean,
        action?: string,
        actionPast?: string,
        showConfirm?: boolean
      }) {
        if (data.showConfirm) {
          // Показываем диалог подтверждения
          this.confirm.require({
            message: `Вы уверены, что хотите ${data.action} событие №${data.event.id}?`,
            header: `Подтверждение ${data.action === 'принять' ? 'принятия' : 'отклонения'}`,
            icon: data.status ? 'pi pi-check-circle' : 'pi pi-times-circle',
            rejectLabel: 'Отмена',
            acceptLabel: data.action,
            acceptClass: data.status ? 'p-button-success' : 'p-button-danger',
            rejectClass: 'p-button-text',
            accept: async () => {
              try {
                const response = await this.eventResolver.verify({
                  id: data.event.id,
                  verification: data.status
                });
                if (response.status === 200) {
                  const eventIndex = this.events.findIndex(event => event.id === data.event.id);
                  if (eventIndex !== -1) {
                    this.events[eventIndex].verified = data.status;

                    // Показываем уведомление об успешной верификации
                    this.toastPopup = {
                      title: "Успешно",
                      message: `Событие ${data.actionPast} успешно`,
                    };
                  }
                } else {
                  // Показываем уведомление об ошибке
                  this.toastPopup = {
                    title: "Ошибка",
                    message: "Не удалось обновить статус события",
                  };
                }
              } catch (error) {
                console.error('Ошибка при верификации события:', error);
                this.toastPopup = {
                  title: "Ошибка",
                  message: "Не удалось обновить статус события",
                };
              }
            }
          })
        } else if (data.success) {
          // Локально обновляем статус события в основном массиве
          const eventIndex = this.events.findIndex(event => event.id === data.event.id);
          if (eventIndex !== -1) {
            this.events[eventIndex].verified = data.status;
          }

          // Показываем уведомление об успешной верификации
          const action = data.status ? 'принят' : 'отклонен';
          this.toastPopup = {
            title: "Успешно",
            message: `Документ ${action} успешно`,
          };
        } else {
          // Показываем уведомление об ошибке
          this.toastPopup = {
            title: "Ошибка",
            message: "Не удалось обновить статус документа",
          };
        }
      },
      addEvent() {
        this.eventForm = {
          name: "",
          shortDescription: "",
          eventType: null,
          eventFormat: null,
          startDateTime: null,
          endDateTime: null,
          eventVenue: "",
          description: "",
          competence: null,
          ageCategory: null,
        };
        this.showAddEventDialog = true;
      },
      async saveEvent() {
        const validationResult = ValidationManager.validateEventForm(this.eventForm)
        const form = validationResult.form
        this.errors = validationResult.errors
        if (!validationResult.isValid) return
        let response
        if (this.isEditing && this.selectedEvent !== null) {
          response = await this.eventResolver.update({
            id: this.selectedEvent.id,
            name: form.name !== this.selectedEvent.name ? form.name : undefined,
            shortDescription: form.shortDescription !== this.selectedEvent.shortDescription ? form.shortDescription : undefined,
            eventType: form.eventType !== this.selectedEvent.eventType ? form.eventType : undefined,
            eventFormat: form.eventFormat !== this.selectedEvent.eventFormat ? form.eventFormat : undefined,
            startDateTime: FormatManager.formatBirthDateToDTO(form.startDateTime) !== this.selectedEvent.startDateTime ? form.startDateTime : undefined,
            endDateTime: form.endDateTime !== this.selectedEvent.endDateTime ? form.endDateTime : undefined,
            eventVenue: form.eventVenue !== this.selectedEvent.eventVenue ? form.eventVenue : undefined,
            description: form.description !== this.selectedEvent.description ? form.description : undefined,
            directionId: form.competence.id !== this.selectedEvent.directionId ? form.competence.id : undefined,
            directionAgeCategoryId: form.ageCategory.id !== this.selectedEvent.directionAgeCategoryId ? form.ageCategory.id : undefined,
          })
          this.toastPopup = {
            title: response.status.toString(),
            message: response.message
          }
        } else {
          response = await this.eventResolver.create({
            ...form,
            directionId: validationResult.form.competence.id,
            directionAgeCategoryId: validationResult.form.ageCategory.id,
          })
          this.toastPopup = {
            title: response.status.toString(),
            message: response.status === 200
              ? "Событие успешно отправлено на верификацию"
              : response.message
          }
        }
        if (response.status === 200) {
          await this.loadEvents(null)
          this.showAddEventDialog = false;
        }
      },
    },
  };
</script>

<style scoped>
  .documents-page {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }

  .page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
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

  .filters-section {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    flex-wrap: wrap;
  }

  /* Обычные фильтры */
  .sticky-filters {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease;
  }

  .sticky-filters:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 0.5rem;
    min-width: 150px;
    flex: 1;
  }

  .filter-group label {
    color: #2c3e50;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .filter-group:last-child {
    margin-left: auto;
    flex: 0.5;
    margin-bottom: 3px;
  }

  .filter-dropdown {
    width: 100%;
  }
  .p-autocomplete-panel {
    width: 100%;
  }

  .form-field label {
    color: #2c3e50;
    font-weight: 500;
    font-size: 0.9rem;
  }

  /* Мобильные стили */
  @media (max-width: 768px) {
    .documents-page {
      padding: 0 1rem;
      max-width: 100%;
      width: 100%;
    }

    .page-title {
      font-size: 1.5rem;
    }

    .filters-section {
      flex-direction: column;
      align-items: stretch;
    }

    .filter-group {
      min-width: auto;
    }
  }

  /* Стили для табов документов */
  .documents-tabs {
    margin-top: 2rem;
  }

  .documents-tabs :deep(.p-tabview-nav) {
    background: transparent;
    border-radius: 0;
    padding: 0.5rem 0;
  }

  .documents-tabs :deep(.p-tabview-nav li) {
    margin-right: 0.5rem;
  }

  .documents-tabs :deep(.p-tabview-nav li .p-tabview-nav-link) {
    border-radius: 6px;
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .documents-tabs :deep(.p-tabview-nav li.p-highlight .p-tabview-nav-link) {
    background: #ff9800;
    color: white;
    box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
  }

  .documents-tabs :deep(.p-tabview-panels) {
    background: transparent;
    border-radius: 0;
    box-shadow: none;
    padding: 0;
  }

  /* Стили для недоступных табов */
  .documents-tabs :deep(.p-tabview-nav li.disabled-tab .p-tabview-nav-link) {
    background: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
    border: 1px solid #dee2e6;
  }

  .documents-tabs :deep(.p-tabview-nav li.disabled-tab .p-tabview-nav-link:hover) {
    background: #f8f9fa;
    color: #6c757d;
    transform: none;
    box-shadow: none;
  }

  .documents-tabs :deep(.p-tabview-nav li.disabled-tab) {
    order: 999; /* Перемещаем в конец */
  }

  /* Обычный контейнер для табов */
  .custom-sticky-container {
    position: relative;
    background: white;
    transition: all 0.3s ease;
  }

  /* Очень маленькие экраны */
  @media (max-width: 480px) {
    .documents-page {
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

  .form-field {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }

  .form-field:last-child {
    margin: 0
  }

  .form-field label {
    color: #2c3e50;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

</style>
