<script lang="ts">
  import { useDocumentTemplates } from '@/shared/UseDocumentTemplates.ts';

  export default {
    name: 'DocumentsTemplates',
    methods: {
      DocumentTemplates() {
        return useDocumentTemplates
      }
    },
  };
</script>

<template>
  <div class="upload-section">
    <div class="upload-card">
      <div class="upload-header">
        <h3 class="upload-title">
          <i class="pi pi-file-edit" />
          Шаблоны документов
        </h3>
      </div>
      <div class="download-content">
        <div class="download-list">
          <div
            v-for="template in DocumentTemplates()"
            :key="template.link"
            class="download-info"
          >
            <p class="download-text">
              {{ template.label }}
            </p>
            <a
              class="p-button p-button-primary download-link"
              :href="`/docs/${template.link}`"
              :download="`${template.label}.${template.link.split('.')[1]}`"
            >
              Скачать
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .upload-section {
    height: 40vh;
    margin-bottom: 2rem;
    width: 100%;
  }

  .download-content {
    padding: 1.5rem 0.4rem;
    height: 80%;
    overflow: hidden;
  }

  .download-list {
    height: 100%;
    padding: 0 1.1rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(324px, 1fr));
    gap: 1.5rem;
    overflow: scroll;
  }

  .download-info {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    padding: 1.5rem;
    border-radius: 10px;
    background: #f8f9fa;

    .download-text {
      font-size: 0.9rem;
      width: 55%;
      height: min-content;
      margin: 0;
    }
  }

  .download-link {
    text-decoration: none;
    font-weight: 500
  }

  .upload-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    height: 100%
  }

  .upload-header {
    background: linear-gradient(135deg, #ff9800, #f57c00);
    color: white;
    padding: 1.5rem;
  }

  .upload-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
</style>