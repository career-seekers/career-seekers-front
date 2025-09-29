<template>
  <ConfirmDialog 
    ref="confirmDialog"
    @accept="onAccept"
    @reject="onReject"
  />
</template>

<script lang="ts">
import ConfirmDialog from 'primevue/confirmdialog';

export default {
  name: "ConfirmationModal",
  components: {
    ConfirmDialog,
  },
  data() {
    return {
      currentAcceptCallback: null as (() => void | Promise<void>) | null,
      currentRejectCallback: null as (() => void) | null,
    };
  },
  methods: {
    /**
     * Показывает модальное окно подтверждения
     * @param message - сообщение для отображения
     * @param header - заголовок модального окна
     * @param icon - иконка для отображения
     * @param acceptLabel - текст кнопки подтверждения
     * @param rejectLabel - текст кнопки отмены
     * @param onAccept - функция обратного вызова при подтверждении
     * @param onReject - функция обратного вызова при отмене (опционально)
     */
    showConfirmation(
      message: string,
      header: string = 'Подтверждение',
      icon: string = 'pi pi-exclamation-triangle',
      acceptLabel: string = 'Подтвердить',
      rejectLabel: string = 'Отмена',
      onAccept: () => void | Promise<void>,
      onReject?: () => void
    ) {
      this.currentAcceptCallback = onAccept;
      this.currentRejectCallback = onReject || null;
      
      (this.$refs.confirmDialog as any).require({
        message,
        header,
        icon,
        acceptLabel,
        rejectLabel
      });
    },

    /**
     * Показывает модальное окно подтверждения удаления документа
     * @param document - объект документа для удаления
     * @param documentTypeLabel - название типа документа
     * @param onConfirm - функция обратного вызова при подтверждении удаления
     */
    showDeleteConfirmation(
      _document: any, 
      documentTypeLabel: string, 
      onConfirm: () => Promise<void>
    ) {
      this.showConfirmation(
        `Вы уверены, что хотите удалить документ "${documentTypeLabel}"?`,
        'Подтверждение удаления',
        'pi pi-exclamation-triangle',
        'Удалить',
        'Отмена',
        onConfirm
      );
    },

    onAccept() {
      if (this.currentAcceptCallback) {
        this.currentAcceptCallback();
      }
      this.currentAcceptCallback = null;
      this.currentRejectCallback = null;
    },

    onReject() {
      if (this.currentRejectCallback) {
        this.currentRejectCallback();
      }
      this.currentAcceptCallback = null;
      this.currentRejectCallback = null;
    }
  }
};
</script>
