<script lang="ts">

  import type { PropType } from 'vue';
  import type { AgeCategories } from '@/api/resolvers/ageCategory/ageCategories.ts';
  import { FormatManager } from '@/utils/FormatManager.ts';
  import { QueueStatuses } from '@/api/resolvers/childCompetencies/types.ts';
  import Paginator from 'primevue/paginator';
  import Button from 'primevue/button';
  import { ChildCompetenciesResolver } from '@/api/resolvers/childCompetencies/child-competencies.resolver.ts';
  import type {
    ChildCompetenciesOutputDto
  } from "@/api/resolvers/childCompetencies/dto/output/child-competencies-output.dto.ts";
  
  export interface Participant {
    id: number,
    lastName: string,
    firstName: string,
    patronymic: string,
    queueStatus: QueueStatuses,
    childDocuments: {
      ageCategory: AgeCategories,
      studyingPlace: string,
      trainingGround: string,
    } | null,
    mentor: {
      lastName: string,
      firstName: string,
      patronymic: string,
      mobileNumber: string,
      email: string,
    } | null,
    user: {
      lastName: string,
      firstName: string,
      patronymic: string,
      mobileNumber: string,
      email: string,
    } | null
  }

  export default {
    name: 'CompetenceParticipantsList',
    components: {
      Button,
      Paginator
    },
    props: {
      participants: {
        type: Array as PropType<Participant[]>,
        required: true,
      },
      childrenRecords: {
        type: Array as PropType<ChildCompetenciesOutputDto[]>,
        required: true,
      }
    },
    emits: ['refresh-participants'],
    data: function() {
      return {
        childCompetenceResolver: new ChildCompetenciesResolver(),
        currentPage: 0,
        itemsPerPage: 8,
      };
    },
    computed: {
      FormatManager() {
        return FormatManager
      },
      paginatedParticipants() {
        const start = this.currentPage * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.participants.slice(start, end);
      },
      totalRecords() {
        return this.participants.length;
      }
    },
    methods: {
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
      async unassignParticipant(participant: Participant) {
        const record = this.childrenRecords.find(record => record.childId === participant.id)
        if (confirm(`Вы уверены, что хотите снять с компетенции ребенка ${participant.firstName}`)) {
          const response = await this.childCompetenceResolver.deleteById(record?.id!!)
          if (response.status === 200) {
            this.$emit("refresh-participants", participant);
          }
        }
      }
    }
  };
</script>

<template>
  <div class="experts-grid">
    <div
      v-for="participant in paginatedParticipants"
      :key="participant.id"
      class="expert-card"
    >
      <div class="expert-header">
        <div class="expert-avatar">
          <i class="pi pi-user" />
        </div>
        <div class="expert-info">
          <h3 class="expert-name">
            {{
              participant.lastName + " " +
                participant.firstName + " "
            }}
            {{
              participant.patronymic !== "null" ? participant.patronymic : ""
            }}
          </h3>
        </div>
        <div class="expert-actions">
          <Button
            v-tooltip.left="'Снять с компетенции'"
            icon="pi pi-ban"
            severity="danger"
            @click="unassignParticipant(participant)"
          />
        </div>
      </div>

      <div
        v-if="participant.childDocuments !== null"
        class="expert-content"
      >
        <div class="expert-details">
          <div class="detail-item">
            <span class="detail-label">Образовательное учреждение:</span>
            <span class="detail-value">{{ participant.childDocuments.studyingPlace }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Площадка подготовки:</span>
            <span class="detail-value">{{ participant.childDocuments.trainingGround }}</span>
          </div>
        </div>
        <h3
          v-if="participant.mentor !== null || participant.user !== null"
          class="expert-name"
        >
          {{ participant.mentor !== null ? 'Наставник' : 'Родитель' }}
        </h3>
        <div
          v-if="participant.mentor !== null || participant.user !== null"
          class="expert-details"
        >
          <div class="detail-item">
            <span class="detail-label">ФИО:</span>
            <span class="detail-value">
              {{ participant.mentor !== null ? participant.mentor.lastName : participant.user?.lastName }}
              {{ participant.mentor !== null ? participant.mentor.firstName : participant.user?.firstName }}
              {{ participant.mentor !== null ? participant.mentor.patronymic : participant.user?.patronymic }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Телефон:</span>
            <span class="detail-value">
              {{
                participant.mentor !== null
                  ? FormatManager.formatMobileNumberFromDTO(participant.mentor.mobileNumber)
                  : FormatManager.formatMobileNumberFromDTO(participant.user?.mobileNumber ?? "")
              }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Адрес электронной почты:</span>
            <span class="detail-value">
              {{
                participant.mentor !== null
                  ? participant.mentor.email
                  : participant.user?.email
              }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="participants.length > 0"
    class="pagination-container"
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
</template>

<style scoped>

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

  .expert-info {
    flex: 1;
  }

  .expert-name {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-weight: 600;
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

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
    margin-bottom: 2rem;
    padding: 1rem;
    transition: opacity 0.3s ease;
  }

  @media screen and (max-width: 768px) {
    .experts-grid {
      grid-template-columns: 1fr;
    }
  }

</style>