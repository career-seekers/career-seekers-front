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

</style>