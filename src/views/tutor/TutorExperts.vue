<template>
  <div class="experts-page">
    <div class="page-header">
      <h1 class="page-title">Главные эксперты</h1>
      <p class="page-subtitle">Управление главными экспертами и их компетенциями</p>
    </div>

    <!-- Кнопка добавления эксперта -->
    <div class="page-actions">
      <Button 
        label="Добавить главного эксперта" 
        icon="pi pi-user-plus"
        class="p-button-primary"
        @click="showAddExpertDialog = true"
      />
    </div>

    <!-- Список экспертов -->
    <div class="experts-grid">
      <div v-for="expert in experts" :key="expert.id" class="expert-card">
        <div class="expert-header">
          <div class="expert-avatar">
            <i class="pi pi-user"></i>
          </div>
          <div class="expert-info">
            <h3 class="expert-name">{{ expert.fullName }}</h3>
            <p class="expert-position">{{ expert.position }}</p>
          </div>
          <div class="expert-actions">
            <Button 
              icon="pi pi-pencil" 
              class="p-button-text p-button-sm"
              @click="editExpert(expert)"
              v-tooltip="'Редактировать'"
            />
            <Button 
              icon="pi pi-trash" 
              class="p-button-text p-button-sm p-button-danger"
              @click="deleteExpert(expert)"
              v-tooltip="'Удалить'"
            />
          </div>
        </div>
        
        <div class="expert-content">
          <div class="expert-details">
            <div class="detail-item">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ expert.email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Телефон:</span>
              <span class="detail-value">{{ expert.phone }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Опыт работы:</span>
              <span class="detail-value">{{ expert.experience }}</span>
            </div>
          </div>
          
          <div class="competencies-section">
            <h4 class="competencies-title">Компетенции:</h4>
            <div class="competencies-list">
              <span 
                v-for="competency in expert.competencies" 
                :key="competency.id"
                class="competency-tag"
              >
                {{ competency.name }}
              </span>
            </div>
          </div>
          
          <div class="expert-status">
            <span class="status-badge" :class="expert.statusClass">
              {{ expert.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог добавления/редактирования эксперта -->
    <Dialog 
      v-model:visible="showAddExpertDialog" 
      :header="isEditing ? 'Редактировать эксперта' : 'Добавить главного эксперта'"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div class="expert-form">
        <div class="form-row">
          <div class="form-field">
            <label for="fullName">ФИО *</label>
            <InputText 
              id="fullName"
              v-model="expertForm.fullName" 
              placeholder="Введите ФИО эксперта"
              :class="{ 'p-invalid': !expertForm.fullName }"
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-field">
            <label for="email">Email *</label>
            <InputText 
              id="email"
              v-model="expertForm.email" 
              placeholder="Введите email"
              :class="{ 'p-invalid': !expertForm.email }"
            />
          </div>
          <div class="form-field">
            <label for="phone">Телефон *</label>
            <InputText 
              id="phone"
              v-model="expertForm.phone" 
              placeholder="Введите телефон"
              :class="{ 'p-invalid': !expertForm.phone }"
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-field">
            <label for="position">Должность *</label>
            <InputText 
              id="position"
              v-model="expertForm.position" 
              placeholder="Введите должность"
              :class="{ 'p-invalid': !expertForm.position }"
            />
          </div>
          <div class="form-field">
            <label for="experience">Опыт работы *</label>
            <InputText 
              id="experience"
              v-model="expertForm.experience" 
              placeholder="Например: 5 лет"
              :class="{ 'p-invalid': !expertForm.experience }"
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-field full-width">
            <label for="competencies">Компетенции *</label>
            <MultiSelect 
              id="competencies"
              v-model="expertForm.competencies" 
              :options="availableCompetencies"
              optionLabel="name"
              optionValue="id"
              placeholder="Выберите компетенции"
              :class="{ 'p-invalid': !expertForm.competencies || expertForm.competencies.length === 0 }"
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-field full-width">
            <label for="description">Дополнительная информация</label>
            <Textarea 
              id="description"
              v-model="expertForm.description" 
              placeholder="Введите дополнительную информацию об эксперте"
              rows="3"
            />
          </div>
        </div>
      </div>
      
      <template #footer>
        <Button 
          label="Отмена" 
          icon="pi pi-times" 
          class="p-button-text"
          @click="cancelEdit"
        />
        <Button 
          :label="isEditing ? 'Сохранить' : 'Добавить'" 
          icon="pi pi-check" 
          class="p-button-primary"
          @click="saveExpert"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import Textarea from 'primevue/textarea'

export default {
  name: 'TutorExperts',
  components: {
    Button,
    Dialog,
    InputText,
    MultiSelect,
    Textarea
  },
  data() {
    return {
      showAddExpertDialog: false,
      isEditing: false,
      editingExpertId: null,
      expertForm: {
        fullName: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        competencies: [],
        description: ''
      },
      availableCompetencies: [
        { id: 1, name: 'Веб-разработка' },
        { id: 2, name: 'Мобильная разработка' },
        { id: 3, name: 'Дизайн интерфейсов' },
        { id: 4, name: 'Анализ данных' },
        { id: 5, name: 'Кибербезопасность' },
        { id: 6, name: 'Искусственный интеллект' },
        { id: 7, name: 'Робототехника' },
        { id: 8, name: '3D-моделирование' }
      ],
      experts: [
        {
          id: 1,
          fullName: 'Смирнов Алексей Владимирович',
          email: 'a.smirnov@mentor.ru',
          phone: '+7 (999) 987-65-43',
          position: 'Ведущий разработчик',
          experience: '8 лет',
          competencies: [
            { id: 1, name: 'Веб-разработка' },
            { id: 3, name: 'Дизайн интерфейсов' }
          ],
          status: 'Активный',
          statusClass: 'status-active',
          description: 'Опытный разработчик с экспертизой в современных веб-технологиях'
        },
        {
          id: 2,
          fullName: 'Козлова Елена Петровна',
          email: 'e.kozlova@mentor.ru',
          phone: '+7 (999) 876-54-32',
          position: 'UX/UI дизайнер',
          experience: '6 лет',
          competencies: [
            { id: 3, name: 'Дизайн интерфейсов' },
            { id: 7, name: '3D-моделирование' }
          ],
          status: 'На проверке',
          statusClass: 'status-pending',
          description: 'Креативный дизайнер с опытом работы в крупных IT-компаниях'
        },
        {
          id: 3,
          fullName: 'Петров Игорь Сергеевич',
          email: 'i.petrov@mentor.ru',
          phone: '+7 (999) 765-43-21',
          position: 'Data Scientist',
          experience: '5 лет',
          competencies: [
            { id: 4, name: 'Анализ данных' },
            { id: 6, name: 'Искусственный интеллект' }
          ],
          status: 'Активный',
          statusClass: 'status-active',
          description: 'Специалист по машинному обучению и анализу больших данных'
        }
      ]
    }
  },
  methods: {
    editExpert(expert) {
      this.isEditing = true
      this.editingExpertId = expert.id
      this.expertForm = {
        fullName: expert.fullName,
        email: expert.email,
        phone: expert.phone,
        position: expert.position,
        experience: expert.experience,
        competencies: expert.competencies.map(c => c.id),
        description: expert.description
      }
      this.showAddExpertDialog = true
    },
    deleteExpert(expert) {
      if (confirm(`Вы уверены, что хотите удалить эксперта ${expert.fullName}?`)) {
        const index = this.experts.findIndex(e => e.id === expert.id)
        if (index > -1) {
          this.experts.splice(index, 1)
        }
      }
    },
    saveExpert() {
      if (!this.validateForm()) {
        return
      }
      
      const selectedCompetencies = this.availableCompetencies.filter(c => 
        this.expertForm.competencies.includes(c.id)
      )
      
      if (this.isEditing) {
        const expert = this.experts.find(e => e.id === this.editingExpertId)
        if (expert) {
          Object.assign(expert, {
            fullName: this.expertForm.fullName,
            email: this.expertForm.email,
            phone: this.expertForm.phone,
            position: this.expertForm.position,
            experience: this.expertForm.experience,
            competencies: selectedCompetencies,
            description: this.expertForm.description
          })
        }
      } else {
        const newExpert = {
          id: Date.now(),
          fullName: this.expertForm.fullName,
          email: this.expertForm.email,
          phone: this.expertForm.phone,
          position: this.expertForm.position,
          experience: this.expertForm.experience,
          competencies: selectedCompetencies,
          status: 'На проверке',
          statusClass: 'status-pending',
          description: this.expertForm.description
        }
        this.experts.push(newExpert)
      }
      
      this.cancelEdit()
    },
    cancelEdit() {
      this.isEditing = false
      this.editingExpertId = null
      this.expertForm = {
        fullName: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        competencies: [],
        description: ''
      }
      this.showAddExpertDialog = false
    },
    validateForm() {
      return this.expertForm.fullName && 
             this.expertForm.email && 
             this.expertForm.phone && 
             this.expertForm.position && 
             this.expertForm.experience && 
             this.expertForm.competencies.length > 0
    }
  }
}
</script>

<style scoped>
.experts-page {
  max-width: 1200px;
  margin: 0 auto;
  animation: slideInRight 0.4s ease-out;
  width: 100%;
  box-sizing: border-box;
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

.page-actions {
  margin-bottom: 2rem;
  text-align: right;
}

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
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
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

.expert-position {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.expert-actions {
  display: flex;
  gap: 0.5rem;
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

.competencies-section {
  margin-bottom: 1.5rem;
}

.competencies-title {
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  border-bottom: 2px solid #ff9800;
  padding-bottom: 0.25rem;
}

.competencies-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.competency-tag {
  background: #f8f9fa;
  color: #2c3e50;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #e9ecef;
}

.expert-status {
  text-align: center;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-active {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid #28a745;
}

.status-pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.status-inactive {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
  border: 1px solid #6c757d;
}

/* Форма */
.expert-form {
  padding: 1rem 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .experts-page {
    padding: 0 1rem;
    max-width: 100%;
    width: 100%;
  }
  
  .experts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .expert-header {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
  }
  
  .expert-avatar {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
  
  .expert-content {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .detail-value {
    text-align: left;
  }
}

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .experts-page {
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
  
  .expert-header {
    padding: 0.75rem;
  }
  
  .expert-avatar {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .expert-name {
    font-size: 1rem;
  }
  
  .expert-position {
    font-size: 0.8rem;
  }
  
  .expert-content {
    padding: 0.75rem;
  }
  
  .competency-tag {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
  }
}
</style>
