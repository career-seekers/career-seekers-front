<template>
  <div class="certificates-page">
    <div class="page-header">
      <h1 class="page-title">
        Мои сертификаты
      </h1>
      <p class="page-subtitle">
        Сертификаты и дипломы наставника
      </p>
    </div>

    <div class="certificates-grid">
      <!-- Сертификат наставника -->
      <div class="certificate-card">
        <div class="certificate-header">
          <div class="certificate-icon">
            <i class="pi pi-certificate" />
          </div>
          <div class="certificate-info">
            <h3 class="certificate-title">
              Сертификат наставника
            </h3>
            <div class="certificate-status">
              <Tag
                value="Получен"
                severity="success"
              />
            </div>
          </div>
        </div>
        <div class="certificate-content">
          <div class="certificate-details">
            <div class="detail-item">
              <span class="detail-label">Дата выдачи:</span>
              <span class="detail-value">15.03.2024</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Номер сертификата:</span>
              <span class="detail-value">MENT-2024-001</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Специализация:</span>
              <span class="detail-value">Веб-разработка и дизайн</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Статус:</span>
              <span class="detail-value">Действителен</span>
            </div>
          </div>
          <div class="certificate-actions">
            <Button
              label="Скачать PDF"
              icon="pi pi-download"
              class="p-button-outlined"
              @click="downloadCertificate('mentor')"
            />
            <Button
              label="Просмотреть"
              icon="pi pi-eye"
              class="p-button-outlined"
              @click="viewCertificate('mentor')"
            />
          </div>
        </div>
      </div>

      <!-- Диплом эксперта -->
      <div class="certificate-card">
        <div class="certificate-header">
          <div class="certificate-icon">
            <i class="pi pi-award" />
          </div>
          <div class="certificate-info">
            <h3 class="certificate-title">
              Диплом эксперта
            </h3>
            <div class="certificate-status">
              <Tag
                value="Получен"
                severity="success"
              />
            </div>
          </div>
        </div>
        <div class="certificate-content">
          <div class="certificate-details">
            <div class="detail-item">
              <span class="detail-label">Дата выдачи:</span>
              <span class="detail-value">20.02.2024</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Номер диплома:</span>
              <span class="detail-value">EXP-2024-015</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Уровень:</span>
              <span class="detail-value">Старший эксперт</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Статус:</span>
              <span class="detail-value">Действителен</span>
            </div>
          </div>
          <div class="certificate-actions">
            <Button
              label="Скачать PDF"
              icon="pi pi-download"
              class="p-button-outlined"
              @click="downloadCertificate('mentor')"
            />
            <Button
              label="Просмотреть"
              icon="pi pi-eye"
              class="p-button-outlined"
              @click="viewCertificate('mentor')"
            />
          </div>
        </div>
      </div>

      <!-- Сертификат повышения квалификации -->
      <div class="certificate-card">
        <div class="certificate-header">
          <div class="certificate-icon">
            <i class="pi pi-graduation-cap" />
          </div>
          <div class="certificate-info">
            <h3 class="certificate-title">
              Сертификат повышения квалификации
            </h3>
            <div class="certificate-status">
              <Tag
                value="В процессе"
                severity="warning"
              />
            </div>
          </div>
        </div>
        <div class="certificate-content">
          <div class="certificate-details">
            <div class="detail-item">
              <span class="detail-label">Курс:</span>
              <span class="detail-value">Современные технологии веб-разработки</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Прогресс:</span>
              <span class="detail-value">75% завершено</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Дата начала:</span>
              <span class="detail-value">01.04.2024</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Ожидаемая дата завершения:</span>
              <span class="detail-value">15.05.2024</span>
            </div>
          </div>
          <div class="certificate-actions">
            <Button
              label="Продолжить курс"
              icon="pi pi-play"
              class="p-button-primary"
              @click="continueCourse"
            />
            <Button
              label="Подробнее"
              icon="pi pi-info-circle"
              class="p-button-outlined"
              @click="viewCourseDetails"
            />
          </div>
        </div>
      </div>

      <!-- Пустая карточка для добавления -->
      <div class="certificate-card empty-card">
        <div class="empty-content">
          <div class="empty-icon">
            <i class="pi pi-plus" />
          </div>
          <h3 class="empty-title">
            Добавить сертификат
          </h3>
          <p class="empty-text">
            Загрузите новый сертификат или диплом
          </p>
          <Button
            label="Загрузить"
            icon="pi pi-upload"
            class="p-button-outlined"
            @click="uploadCertificate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Button from "primevue/button";
import Tag from "primevue/tag";

export default {
  name: "MentorMyCertificates",
  components: {
    Button,
    Tag,
  },
  methods: {
    downloadCertificate(type) {
      console.log("Скачивание сертификата:", type);
    },
    viewCertificate(type) {
      console.log("Просмотр сертификата:", type);
    },
    continueCourse() {
      console.log("Продолжение курса");
    },
    viewCourseDetails() {
      console.log("Подробности курса");
    },
    uploadCertificate() {
      console.log("Загрузка сертификата");
    },
  },
};
</script>

<style scoped>
.certificates-page {
  max-width: 1200px;
  margin: 0 auto;
  animation: slideInRight 0.4s ease-out;
}

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

.certificates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.certificate-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  overflow: hidden;
  transition:
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}

.certificate-card:hover {
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
  border: 2px solid #ff9800;
}

.certificate-header {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.certificate-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.certificate-info {
  flex: 1;
}

.certificate-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.certificate-status {
  margin: 0;
}

.certificate-content {
  padding: 1.5rem;
}

.certificate-details {
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
  min-width: 120px;
}

.detail-value {
  color: #2c3e50;
  font-weight: 500;
  text-align: right;
}

.certificate-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f3f4;
}

.certificate-actions .p-button {
  width: 100%;
  white-space: nowrap;
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
}

/* Пустая карточка */
.empty-card {
  border: 2px dashed #e9ecef;
  background: #f8f9fa;
}

.empty-card:hover {
  border-color: #ff9800;
  background: #fff3e0;
}

.empty-content {
  padding: 2rem;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.empty-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.empty-title {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.empty-text {
  color: #6c757d;
  margin: 0 0 1.5rem 0;
  font-size: 0.9rem;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .certificates-page {
    padding: 0 1rem;
  }

  .certificates-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .certificate-header {
    padding: 0.75rem;
  }

  .certificate-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .certificate-title {
    font-size: 1rem;
  }

  .certificate-content {
    padding: 1rem;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .detail-value {
    text-align: left;
  }

  .certificate-actions .p-button {
    font-size: 0.85rem;
    padding: 0.4rem 0.6rem;
  }

  .empty-content {
    padding: 1.5rem;
  }

  .empty-icon {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
}

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .certificates-page {
    padding: 0 0.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .certificates-grid {
    gap: 0.75rem;
  }

  .certificate-header {
    padding: 0.5rem;
  }

  .certificate-icon {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }

  .certificate-title {
    font-size: 0.9rem;
  }

  .certificate-content {
    padding: 0.75rem;
  }

  .detail-label {
    font-size: 0.85rem;
    min-width: 100px;
  }

  .detail-value {
    font-size: 0.9rem;
  }

  .empty-content {
    padding: 1rem;
  }

  .empty-icon {
    width: 45px;
    height: 45px;
    font-size: 1rem;
  }

  .empty-title {
    font-size: 1rem;
  }

  .empty-text {
    font-size: 0.8rem;
  }

  .certificate-actions .p-button {
    font-size: 0.8rem;
    padding: 0.35rem 0.5rem;
  }
}
</style>
