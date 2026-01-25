<script lang="ts">
import {defineComponent} from 'vue'
import router from "@/router";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";

export default defineComponent({
  name: "StatisticsInfoCard",
  components: { Button, ProgressSpinner },
  props: {
    cardHeader: {
      type: String,
      required: true
    },

    firstDataLabel: {
      type: String,
      required: true
    },

    secondDataLabel: {
      type: String,
      required: true
    },

    actionButtonLabel: {
      type: String,
      required: true
    },

    redirectTo: {
      type: String,
      required: true
    },

    firstDataValue: {
      required: true
    },

    secondDataValue: {
      required: true
    }
  },

  methods: {
    router() {
      return router
    },
  }
})
</script>

<template>
  <div class="info-card">
    <div class="card-header">
      <h3 class="card-title">
        <i class="pi pi-file"/>
        {{ cardHeader }}
      </h3>
    </div>
    <div class="card-content">
      <div class="stats-grid">
        <div
            v-if="firstDataValue != null"
            class="stat-item"
        >
          <div class="stat-number">
            {{ firstDataValue }}
          </div>
          <div class="stat-label">
            {{ firstDataLabel }}
          </div>
        </div>
        <div
            v-else
            class="stat-item"
        >
          <ProgressSpinner
              class="spinner"
              style="display: flex; max-height: 3.5rem"
          />
        </div>
        <div
            v-if="secondDataValue != null"
            class="stat-item"
        >
          <div class="stat-number">
            {{ secondDataValue }}
          </div>
          <div class="stat-label">
            {{ secondDataLabel }}
          </div>
        </div>
        <div
            v-else
            class="stat-item"
        >
          <ProgressSpinner
              class="spinner"
              style="display: flex; max-height: 3.5rem"
          />
        </div>
      </div>

      <div class="card-actions">
        <Button
            :label="actionButtonLabel"
            icon="pi pi-cog"
            class="p-button-outlined"
            @click="router().push(redirectTo)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  overflow: hidden;
  transition: box-shadow 0.3s ease,
  border-color 0.3s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.info-card:hover {
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
  border: 2px solid #ff9800;
}

.card-header {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  button {
    margin: -1rem 0;
  }
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.card-title i {
  margin-right: 0.75rem;
  font-size: 1.1rem;
}

.card-content {
  padding: 1.5rem;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.card-actions {
  text-align: center;
  margin-top: 1rem;
}

/* Быстрые действия */
.form-field label {
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

/* Мобильные стили */
@media (max-width: 768px) {

  .card-content {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }
}

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .form-field label {
    color: #2c3e50;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  /* Мобильные стили */
  @media (max-width: 768px) {
    .info-card {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0;
    }

    .card-header {
      padding: 1rem;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .card-content {
      padding: 1rem;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .stat-number {
      font-size: 1.5rem;
    }
  }

  /* Очень маленькие экраны */
  @media (max-width: 480px) {
    .info-card {
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box;
      margin: 0;
    }

    .card-header {
      padding: 0.75rem;
    }

    .card-title {
      font-size: 1rem;
    }

    .card-content {
      padding: 0.75rem;
    }

    .stats-grid {
      gap: 0.5rem;
    }

    .stat-item {
      padding: 0.75rem;
    }

    .stat-number {
      font-size: 1.25rem;
    }

    .stat-label {
      font-size: 0.8rem;
    }
  }
}
</style>