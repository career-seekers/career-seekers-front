<template>
  <div class="participants-certificates-page">
    <div class="page-header">
      <h1 class="page-title">Сертификаты участников</h1>
      <p class="page-subtitle">Сертификаты и дипломы курируемых участников</p>
    </div>

    <!-- Фильтры -->
    <div class="filters-section">
      <div class="search-box">
        <InputText 
          v-model="searchQuery" 
          placeholder="Поиск по имени участника..."
          class="search-input"
        />
        <i class="pi pi-search search-icon"></i>
      </div>
      
      <div class="filter-buttons">
        <Button 
          label="Все" 
          :class="{ 'p-button-primary': activeFilter === 'all' }"
          @click="setFilter('all')"
        />
        <Button 
          label="Полученные" 
          :class="{ 'p-button-primary': activeFilter === 'received' }"
          @click="setFilter('received')"
        />
        <Button 
          label="В процессе" 
          :class="{ 'p-button-primary': activeFilter === 'pending' }"
          @click="setFilter('pending')"
        />
      </div>
    </div>

    <!-- Список участников с сертификатами -->
    <div class="participants-list">
      <div 
        v-for="participant in filteredParticipants" 
        :key="participant.id"
        class="participant-section"
      >
        <div class="participant-header">
          <div class="participant-info">
            <h3 class="participant-name">{{ participant.name }}</h3>
            <p class="participant-details">{{ participant.age }} • {{ participant.competency }}</p>
          </div>
          <div class="participant-stats">
            <div class="stat-item">
              <span class="stat-number">{{ participant.certificates.length }}</span>
              <span class="stat-label">Сертификатов</span>
            </div>
          </div>
        </div>

        <div class="certificates-grid">
          <div 
            v-for="certificate in participant.certificates" 
            :key="certificate.id"
            class="certificate-card"
          >
            <div class="certificate-header">
              <div class="certificate-icon">
                <i :class="certificate.icon"></i>
              </div>
              <div class="certificate-info">
                <h4 class="certificate-title">{{ certificate.title }}</h4>
                <div class="certificate-status">
                  <Tag 
                    :value="certificate.status.text" 
                    :severity="certificate.status.severity"
                  />
                </div>
              </div>
            </div>
            <div class="certificate-content">
              <div class="certificate-details">
                <div class="detail-item">
                  <span class="detail-label">Дата выдачи:</span>
                  <span class="detail-value">{{ certificate.issueDate }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Номер:</span>
                  <span class="detail-value">{{ certificate.number }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Уровень:</span>
                  <span class="detail-value">{{ certificate.level }}</span>
                </div>
              </div>
              <div class="certificate-actions">
                <Button 
                  label="Скачать" 
                  icon="pi pi-download"
                  class="p-button-outlined p-button-sm"
                  @click="downloadCertificate(participant.id, certificate.id)"
                />
                <Button 
                  label="Просмотреть" 
                  icon="pi pi-eye"
                  class="p-button-outlined p-button-sm"
                  @click="viewCertificate(participant.id, certificate.id)"
                />
              </div>
            </div>
          </div>

          <!-- Пустая карточка для добавления сертификата -->
          <div class="certificate-card empty-card">
            <div class="empty-content">
              <div class="empty-icon">
                <i class="pi pi-plus"></i>
              </div>
              <h4 class="empty-title">Добавить сертификат</h4>
              <p class="empty-text">Выдать новый сертификат участнику</p>
              <Button 
                label="Выдать" 
                icon="pi pi-certificate"
                class="p-button-outlined p-button-sm"
                @click="issueCertificate(participant.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

export default {
  name: 'ExpertParticipantsCertificates',
  components: {
    InputText,
    Button,
    Tag
  },
  data() {
    return {
      searchQuery: '',
      activeFilter: 'all',
      participants: [
        {
          id: 1,
          name: 'Иванов Петр Антонович',
          age: '14 лет',
          competency: 'Веб-дизайн и разработка',
          certificates: [
            {
              id: 1,
              title: 'Сертификат участника',
              icon: 'pi pi-certificate',
              status: {
                text: 'Получен',
                severity: 'success'
              },
              issueDate: '15.03.2024',
              number: 'PART-2024-001',
              level: 'Участник'
            },
            {
              id: 2,
              title: 'Диплом за участие',
              icon: 'pi pi-award',
              status: {
                text: 'Получен',
                severity: 'success'
              },
              issueDate: '20.03.2024',
              number: 'DIP-2024-001',
              level: 'Участник'
            }
          ]
        },
        {
          id: 2,
          name: 'Петрова Анна Владимировна',
          age: '15 лет',
          competency: '3D-моделирование',
          certificates: [
            {
              id: 3,
              title: 'Сертификат участника',
              icon: 'pi pi-certificate',
              status: {
                text: 'Получен',
                severity: 'success'
              },
              issueDate: '10.03.2024',
              number: 'PART-2024-002',
              level: 'Участник'
            },
            {
              id: 4,
              title: 'Сертификат 2 этапа',
              icon: 'pi pi-trophy',
              status: {
                text: 'Получен',
                severity: 'success'
              },
              issueDate: '25.03.2024',
              number: 'STAGE2-2024-001',
              level: 'Призер'
            },
            {
              id: 5,
              title: 'Диплом финалиста',
              icon: 'pi pi-medal',
              status: {
                text: 'В процессе',
                severity: 'warning'
              },
              issueDate: '—',
              number: '—',
              level: 'Финалист'
            }
          ]
        },
        {
          id: 3,
          name: 'Сидоров Максим Дмитриевич',
          age: '13 лет',
          competency: 'Программирование на Python',
          certificates: [
            {
              id: 6,
              title: 'Сертификат участника',
              icon: 'pi pi-certificate',
              status: {
                text: 'Получен',
                severity: 'success'
              },
              issueDate: '12.03.2024',
              number: 'PART-2024-003',
              level: 'Участник'
            }
          ]
        }
      ]
    }
  },
  computed: {
    filteredParticipants() {
      let filtered = this.participants

      // Фильтр по статусу сертификатов
      if (this.activeFilter === 'received') {
        filtered = filtered.map(p => ({
          ...p,
          certificates: p.certificates.filter(c => c.status.severity === 'success')
        })).filter(p => p.certificates.length > 0)
      } else if (this.activeFilter === 'pending') {
        filtered = filtered.map(p => ({
          ...p,
          certificates: p.certificates.filter(c => c.status.severity === 'warning')
        })).filter(p => p.certificates.length > 0)
      }

      // Поиск
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.competency.toLowerCase().includes(query)
        )
      }

      return filtered
    }
  },
  methods: {
    setFilter(filter) {
      this.activeFilter = filter
    },
    downloadCertificate(participantId, certificateId) {
      console.log('Скачивание сертификата:', participantId, certificateId)
    },
    viewCertificate(participantId, certificateId) {
      console.log('Просмотр сертификата:', participantId, certificateId)
    },
    issueCertificate(participantId) {
      console.log('Выдача сертификата участнику:', participantId)
    }
  }
}
</script>

<style scoped>
.participants-certificates-page {
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
  font-family: 'BIPS', sans-serif;
}

.page-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1.1rem;
}

/* Фильтры */
.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding-right: 2.5rem;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Список участников */
.participants-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.participant-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.participant-header {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.participant-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.participant-details {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.participant-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.9;
}

/* Сертификаты */
.certificates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.certificate-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  overflow: hidden;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.certificate-card:hover {
  box-shadow: 0 4px 16px rgba(255, 152, 0, 0.2);
  border: 2px solid #ff9800;
}

.certificate-header {
  background: #f8f9fa;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.certificate-icon {
  width: 35px;
  height: 35px;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.certificate-info {
  flex: 1;
}

.certificate-title {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
}

.certificate-status {
  margin: 0;
}

.certificate-content {
  padding: 1rem;
}

.certificate-details {
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #6c757d;
  font-weight: 500;
  font-size: 0.8rem;
  min-width: 80px;
}

.detail-value {
  color: #2c3e50;
  font-weight: 500;
  text-align: right;
  font-size: 0.8rem;
}

.certificate-actions {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f3f4;
}

.certificate-actions .p-button {
  width: 100%;
  white-space: nowrap;
  font-size: 0.8rem;
  padding: 0.4rem 0.6rem;
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
  padding: 1.5rem;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.empty-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.empty-title {
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.empty-text {
  color: #6c757d;
  margin: 0 0 1rem 0;
  font-size: 0.8rem;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .participants-certificates-page {
    padding: 0 1rem;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .search-box {
    max-width: none;
  }
  
  .filter-buttons {
    justify-content: center;
  }
  
  .participant-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .participant-stats {
    align-self: stretch;
    justify-content: center;
  }
  
  .certificates-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .certificate-header {
    padding: 0.5rem;
  }
  
  .certificate-icon {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
  }
  
  .certificate-title {
    font-size: 0.85rem;
  }
  
  .certificate-content {
    padding: 0.75rem;
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
    font-size: 0.75rem;
    padding: 0.35rem 0.5rem;
  }
  
  .empty-content {
    padding: 1rem;
  }
  
  .empty-icon {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }
}

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .participants-certificates-page {
    padding: 0 0.5rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .participants-list {
    gap: 1.5rem;
  }
  
  .participant-header {
    padding: 0.75rem 1rem;
  }
  
  .participant-info h3 {
    font-size: 1rem;
  }
  
  .participant-details {
    font-size: 0.8rem;
  }
  
  .stat-number {
    font-size: 1.25rem;
  }
  
  .stat-label {
    font-size: 0.7rem;
  }
  
  .certificates-grid {
    gap: 0.5rem;
    padding: 0.75rem;
  }
  
  .certificate-header {
    padding: 0.4rem;
  }
  
  .certificate-icon {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }
  
  .certificate-title {
    font-size: 0.8rem;
  }
  
  .certificate-content {
    padding: 0.5rem;
  }
  
  .detail-label {
    font-size: 0.75rem;
    min-width: 70px;
  }
  
  .detail-value {
    font-size: 0.75rem;
  }
  
  .empty-content {
    padding: 0.75rem;
  }
  
  .empty-icon {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
  
  .empty-title {
    font-size: 0.8rem;
  }
  
  .empty-text {
    font-size: 0.7rem;
  }
  
  .certificate-actions .p-button {
    font-size: 0.7rem;
    padding: 0.3rem 0.4rem;
  }
}
</style>
