<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'MessageCard',
    props: {
      text: {
        type: String,
        required: true
      }
    }
  });
</script>

<template>
  <div class="return-notice">
    <i class="pi pi-info-circle" />
    <span v-html="text" />
  </div>
</template>

<style scoped>

  .return-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #e3f2fd;
    border: 1px solid #2196f3;
    border-radius: 6px;
    color: #1976d2;
    font-size: 0.9rem;
    margin: 1rem 0;
  }

  .return-notice i {
    color: #2196f3;
    font-size: 1rem;
  }

</style>