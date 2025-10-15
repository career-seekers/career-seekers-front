<script lang="ts">

  import type { CompetenceOutputDto } from '@/api/resolvers/competence/dto/output/competence-output.dto.ts';
  import { CompetenceResolver } from '@/api/resolvers/competence/competence.resolver.ts';
  import router from '@/router';

  export default {
    name: 'CompetenceParticipants',
    props: {
      competenceId: {
        type: String,
        required: true,
      }
    },
    data() {
      return {
        competenceResolver: new CompetenceResolver(),
        competence: null as CompetenceOutputDto | null,
      }
    },
    computed: {
      competenceIdChecked() {
        const num = parseInt(this.competenceId)
        if (isNaN(num)) router.go(-1)
        return num
      }
    },
    async mounted() {
      const response = await this.competenceResolver.getById(this.competenceIdChecked)
      if (typeof response.message !== "string") {
        this.competence = response.message
      }
    }
  };
</script>

<template>
  <div
    v-if="competence !== null"
    class="mentors-page"
  >
    <div class="page-header">
      <h1 class="page-title">
        Участники компетенции
      </h1>
      <p class="page-subtitle">
        Управление участниками компетенции <b>{{ competence.name }}</b>
      </p>
    </div>
  </div>
</template>

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

  .form-field label {
    color: #2c3e50;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  /* Мобильные стили */
  @media (max-width: 768px) {
    .page-title {
      font-size: 1.5rem;
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
  }

</style>