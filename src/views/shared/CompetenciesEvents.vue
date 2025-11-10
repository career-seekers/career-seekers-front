<template>
  <div class="documents-page">
    <div class="page-header">
      <h1 class="page-title">
        События
      </h1>
      <p class="page-subtitle">
        Управление событиями
      </p>
    </div>
    
    <!-- Фильтры -->
    <div class="filters-section sticky-filters">
      <div class="filter-group">
        <label for="typeFilter">Тип события:</label>
        <Dropdown
          id="typeFilter"
          v-model="selectedType"
          option-label="label"
          option-value="value"
          placeholder="Все типы"
          :disabled="isLoading"
          class="filter-dropdown"
        />
      </div>
      <div class="filter-group">
        <label for="typeFilter">Формат события:</label>
        <Dropdown
          id="typeFilter"
          v-model="selectedFormat"
          option-label="label"
          option-value="value"
          placeholder="Все типы"
          :disabled="isLoading"
          class="filter-dropdown"
        />
      </div>
      <div class="filter-group">
        <label for="statusFilter">Компетенция:</label>
        <AutoComplete
          id="statusFilter"
          v-model="selectedCompetence"
          :suggestions="filteredCompetencies"
          dropdown
          field="name"
          placeholder="Все компетенции"
          class="filter-dropdown"
          :disabled="isLoading"
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
      
      <div class="filter-group">
        <Button
          label="Сбросить фильтры"
          icon="pi pi-refresh"
          class="p-button-text p-button-sm"
          @click="resetFilters"
        />
      </div>
    </div>

    <!-- Кастомный sticky контейнер для табов -->
    <div
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
          <EventsToVerifyList
            v-if="tab.events.length > 0"
            :events="filterEvents(tab.events)"
            :experts="experts"
            :verify-status="tab.key === 'unchecked' ? 'UNCHECKED' : tab.key === 'accepted' ? 'ACCEPTED' : 'REJECTED'"
            @update="loadCompetencies"
            @delete="handleDeleteEvent"
            @verify="handleVerifyDocument"
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

      <ToastPopup :content="errors.toastPopup" />

      <!-- Диалог подтверждения удаления -->
      <ConfirmDialog />
    </div>
  </div>
</template>

<script lang="ts">
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import TabView from 'primevue/tabview';
  import TabPanel from 'primevue/tabpanel';
  import { CompetenceResolver } from '@/api/resolvers/competence/competence.resolver';
  import ToastPopup from '@/components/ToastPopup.vue';
  import { UserResolver } from '@/api/resolvers/user/user.resolver';
  import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
  import { Roles } from '@/state/UserState.types.ts';
  import AutoComplete from 'primevue/autocomplete';
  import ConfirmDialog from 'primevue/confirmdialog';
  import { useConfirm } from 'primevue/useconfirm';
  import ProgressSpinner from 'primevue/progressspinner';
  import { EventFormats, type EventTypes } from '@/api/resolvers/events/dto/types.d';
  import type { EventOutputDto } from '@/api/resolvers/events/dto/output/event-output.dto.ts';
  import EventsToVerifyList from '@/components/lists/EventsToVerifyList.vue';
  import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';
  import { EventResolver } from '@/api/resolvers/events/event.resolver.ts';
  import type { EventsUrlParamsInputDto } from '@/api/resolvers/events/dto/input/events-url-params-input.dto.ts';

  interface TabConfig {
    key: string;
    header: string;
    events: EventOutputDto[];
    hasEvents: boolean;
  }

  export default {
    name: "AdminEvents",
    components: {
      EventsToVerifyList,
      ToastPopup,
      Button,
      Dropdown,
      TabView,
      TabPanel,
      AutoComplete,
      ConfirmDialog,
      ProgressSpinner
    },
    data() {
      return {
        selectedType: null as null | EventTypes,
        selectedFormat: null as null | EventFormats,
        selectedCompetence: localStorage.getItem("selectedCompetence")
          ? JSON.parse(localStorage.getItem("selectedCompetence") as string)
          : (null as CompetenceOutputDto | null),
        events: [] as EventOutputDto[],
        competencies: [] as CompetenceOutputDto[],
        experts: [] as UserOutputDto[],
        filteredCompetencies: [] as CompetenceOutputDto[],
        errors: {
          toastPopup: {
            title: "",
            message: "",
          },
        },
        competenceResolver: new CompetenceResolver(),
        userResolver: new UserResolver(),
        eventResolver: new EventResolver(),
        activeTab: 0,
        isSticky: false,
        isLoading: false,
        confirm: useConfirm(),
      };
    },
    computed: {
      rejectedEvents() {
        return this.events
          .filter(event => event.verified === false)
          .sort((a, b) => b.id - a.id);
      },
      acceptedEvents() {
        return this.events
          .filter(event => event.verified === true)
          .sort((a, b) => b.id - a.id);
      },
      uncheckedEvents() {
        return this.events
          .filter(event => event.verified === null)
          .sort((a, b) => b.id - a.id);
      },
      // Определяем доступность табов на основе наличия документов
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

        // Сортируем табы: сначала с документами, потом без документов
        return tabs.sort((a, b) => {
          if (a.hasEvents && !b.hasEvents) return -1;
          if (!a.hasEvents && b.hasEvents) return 1;
          return 0;
        });
      }
    },
    watch: {
      // Автоматически переключаемся на первый доступный таб, если текущий стал недоступным
      tabsConfig: {
        handler(newTabsConfig: TabConfig[]) {
          const availableTabs = newTabsConfig.filter((tab: TabConfig) => tab.hasEvents);
          if (availableTabs.length > 0) {
            // Если текущий активный таб недоступен, переключаемся на первый доступный
            const currentTab = newTabsConfig[this.activeTab];
            if (!currentTab || !currentTab.hasEvents) {
              this.activeTab = 0; // Первый таб в отсортированном списке всегда доступен
            }
          }
        },
        immediate: true
      }
    },
    async mounted() {
      this.isLoading = true;
      await this.loadCompetencies()
      await this.loadExperts()
      await this.loadEvents(null)
      this.isLoading = false
    },
    methods: {
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

        if (this.selectedFormat) {
          filteredEvents = filteredEvents
            .filter(event => event.eventFormat === this.selectedFormat)
        }

        if (this.selectedCompetence) {
          filteredEvents = filteredEvents
            .filter(event => event.directionId === this.selectedCompetence.id)
        }

        return filteredEvents;
      },

      resetFilters() {
        this.selectedType = null;
        this.selectedFormat = null;
        this.selectedCompetence = null;
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

      handleDeleteEvent(event: EventOutputDto) {
        this.confirm.require({
          message: `Вы уверены, что хотите удалить документ №${event.id}?`,
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
                this.errors.toastPopup = {
                  title: "Успешно",
                  message: "Документ удален успешно",
                };
              }
            } catch (error) {
              console.error('Ошибка при удалении документа:', error);
              this.errors.toastPopup = {
                title: "Ошибка",
                message: "Не удалось удалить документ",
              };
            }
          }
        });
      },

      handleVerifyDocument(data: {
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
            message: `Вы уверены, что хотите ${data.action} документ №${data.event.id}?`,
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

                    // Также обновляем статус в компетенциях
                    this.competencies.forEach(competence => {
                      const evIndex = competence.documents.findIndex(event => event.id === data.event.id);
                      if (evIndex !== -1) {
                        competence.documents[evIndex].verified = data.status;
                      }
                    });

                    // Показываем уведомление об успешной верификации
                    this.errors.toastPopup = {
                      title: "Успешно",
                      message: `Документ ${data.actionPast} успешно`,
                    };
                  }
                } else {
                  // Показываем уведомление об ошибке
                  this.errors.toastPopup = {
                    title: "Ошибка",
                    message: "Не удалось обновить статус документа",
                  };
                }
              } catch (error) {
                console.error('Ошибка при верификации документа:', error);
                this.errors.toastPopup = {
                  title: "Ошибка",
                  message: "Не удалось обновить статус документа",
                };
              }
            }
          })
        } else if (data.success) {
          // Локально обновляем статус документа в основном массиве
          const eventIndex = this.events.findIndex(event => event.id === data.event.id);
          if (eventIndex !== -1) {
            this.events[eventIndex].verified = data.status;
          }

          // Также обновляем статус в компетенциях
          this.competencies.forEach(competence => {
            const evIndex = competence.documents.findIndex(event => event.id === data.event.id);
            if (evIndex !== -1) {
              competence.documents[evIndex].verified = data.status;
            }
          });

          // Показываем уведомление об успешной верификации
          const action = data.status ? 'принят' : 'отклонен';
          this.errors.toastPopup = {
            title: "Успешно",
            message: `Документ ${action} успешно`,
          };
        } else {
          // Показываем уведомление об ошибке
          this.errors.toastPopup = {
            title: "Ошибка",
            message: "Не удалось обновить статус документа",
          };
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
    align-items: end;
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
    gap: 0.5rem;
    min-width: 150px;
  }

  .filter-group label {
    color: #2c3e50;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .filter-dropdown {
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
</style>
