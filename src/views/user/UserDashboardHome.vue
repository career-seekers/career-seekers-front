<template>
  <div
    v-if="user !== null"
    class="dashboard-home"
  >
    <div class="page-header">
      <h1 class="page-title">
        Добро пожаловать, {{ user.firstName }}!
      </h1>
      <p class="page-subtitle">
        Управляйте участием вашего ребенка в чемпионате
      </p>
    </div>

    <div class="dashboard-grid">
      <!-- Персональные данные -->
      <div class="info-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-user" />
            Персональные данные
          </h3>
          <Button
            v-tooltip="'Редактировать'"
            icon="pi pi-pencil"
            style="background: white;"
            class="p-button-text p-button-sm"
            @click="$emit('openSettings', true)"
          />
        </div>
        <div class="card-content">
          <div class="data-section">
            <h4 class="section-title">
              Родитель
            </h4>
            <div class="data-item">
              <span class="data-label">ФИО:</span>
              <span class="data-value">
                {{ `${user.lastName} ${user.firstName} ${user.patronymic}` }}
              </span>
            </div>
            <div class="data-item">
              <span class="data-label">Телефон:</span>
              <span class="data-value">{{ FormatManager.formatMobileNumberFromDTO(user.mobileNumber) }}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Email:</span>
              <span class="data-value">{{ user.email }}</span>
            </div>
            <!-- <div class="data-item">
              <span class="data-label">Статус:</span>
              <span class="data-value">{{ user.verified ? 'Подтверждён' : 'Не подтверждён' }}</span>
            </div> -->
          </div>
        </div>
      </div>

      <!-- Данные о детях -->
      <div class="info-card">
        <div class="card-header">
          <div class="card-header-content">
            <h3 class="card-title">
              <i class="pi pi-users" />
              Мои дети
            </h3>
            <Button
              label="Добавить ребёнка"
              icon="pi pi-plus"
              class="p-button-sm header-button"
              @click="fillNewChild"
            />
          </div>
        </div>
        <div class="card-content">
          <div class="participants-preview">
            <p class="preview-text">
              Всего детей: {{ user.children.length }}
            </p>
          </div>
          <div
            v-if="user.children && user.children.length > 0"
            class="competencies-section competencies-scrollable"
          >
            <div 
              v-for="child in user.children" 
              :key="child.id"
              class="child-competencies"
            >
              <h4 class="child-name">
                {{ `${child.lastName} ${child.firstName} ${child.patronymic}` }}
              </h4>
              <div
                v-if="getCompetenciesByChildId(child.id).length > 0"
                class="competencies-list"
              >
                <div 
                  v-for="competence in getCompetenciesByChildId(child.id)"
                  :key="competence.id"
                  class="competence-item"
                  @click="openChildDetailsDialog(child, competence)"
                >
                  <div class="competence-icon">
                    <i class="pi pi-star" />
                  </div>
                  <div class="competence-info">
                    <div class="competence-name">
                      {{ competence.direction.name }}
                    </div>
                    <div class="competence-description">
                      {{ competence.direction.description }}
                    </div>
                    <div class="competence-expert">
                      <i class="pi pi-user" />
                      Главный эксперт: {{ expertNames.get(competence.direction.expertId) || `ID ${competence.direction.expertId}` }}
                    </div>
                    <div class="competence-mentor">
                      <i class="pi pi-users" />
                      Наставник: {{ getMentorName(child) }}
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-else
                class="no-competencies clickable"
                @click="openChildInfoDialog(child)"
              >
                <div class="no-competencies-main">
                  <i class="pi pi-info-circle" />
                  <span>Ребенок пока не зарегистрирован ни на одну компетенцию</span>
                  <i class="pi pi-arrow-right click-icon" />
                </div>
                
                <!-- Простая строчка с наставником под основным текстом -->
                <div class="mentor-simple">
                  <i class="pi pi-users" />
                  Наставник: {{ getMentorName(child) }}
                </div>
              </div>
            </div>
          </div>
          <div
            v-else
            class="empty-state"
          >
            <i class="pi pi-users empty-icon" />
            <p class="empty-text">
              У вас пока нет детей
            </p>
            <p class="empty-subtitle">
              Добавьте ребенка для участия в чемпионате
            </p>
          </div>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="showAddChildDialog"
      :header="
        isEditing ? 'Редактировать ребёнка' : 'Добавить ребёнка'
      "
      :modal="true"
      :style="{ width: '600px', maxWidth: '90vw' }"
    >
      <form
        class="child-form"
        @submit.prevent="addChild"
      >
        <AddChildForm
          :child-id="selectedChild?.id"
          :is-editing="isEditing"
          :model-child-form="childForm"
          :model-child-form-errors="errors"
          @update:model-child-form="(form) => childForm = form"
          @update:model-child-form-errors="(formErrors) => errors = formErrors"
          @update:birth-file="(val) => addBirthFile = val"
          @update:snils-file="(val) => addSnilsFile = val"
          @update:school-file="(val) => addSchoolFile = val"
          @update:platform-file="(val) => addPlatformFile = val"
          @update:consent-file="(val) => addConsentFile = val"
          @update:home-education="(val) => isHomeEducated = val"
          @update:home-preparation="(val) => isHomePrepared = val"
        />
        <Button
          :label="isEditing ? 'Обновить данные о ребенке' : 'Добавить нового ребёнка'"
          icon="pi pi-plus"
          style="width: 100%"
          class="p-button-primary"
          type="submit"
          :loading="isLoading"
        />
      </form>
    </Dialog>

    <!-- Диалог подробной информации о ребенке -->
    <Dialog
      v-model:visible="showChildDetailsDialog"
      header="Подробная информация о ребенке"
      :modal="true"
      :style="{ width: '800px', maxWidth: '90vw' }"
    >
      <div
        v-if="selectedChildDetails"
        class="child-details"
      >
        <!-- Информация о ребенке -->
        <div class="details-section">
          <div class="section-header">
            <h4 class="section-title">
              <i class="pi pi-user" />
              Персональные данные
            </h4>
            <Button
              v-tooltip="'Редактировать данные ребенка'"
              icon="pi pi-pencil"
              class="p-button-outlined p-button-sm edit-button"
              @click="editChild(selectedChildDetails.child)"
            />
            <Button
              v-tooltip="'Удалить'"
              icon="pi pi-trash"
              style="background: white; margin-left: 0.5rem;"
              class="p-button-outlined p-button-sm"
              @click="deleteChild(selectedChildDetails.child.id)"
            />
          </div>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">ФИО:</span>
              <span class="detail-value">
                {{ `${selectedChildDetails.child.lastName} ${selectedChildDetails.child.firstName} ${selectedChildDetails.child.patronymic}` }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Возрастная группа:</span>
              <span class="detail-value">
                {{ FormatManager.getAgeGroupByAge(
                  FormatManager.calculateAge(selectedChildDetails.child.dateOfBirth),
                  selectedChildDetails.child.childDocuments!.learningClass
                )?.label }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Школа:</span>
              <span class="detail-value">
                {{ selectedChildDetails.child.childDocuments?.studyingPlace || 'Не указана' }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">СНИЛС:</span>
              <span class="info-value">
                {{ selectedChildDetails.child.childDocuments?.snilsNumber ? FormatManager.formatSnilsFromDTO(selectedChildDetails.child.childDocuments?.snilsNumber) : 'Не указана' }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Класс:</span>
              <span class="detail-value">
                {{ selectedChildDetails.child.childDocuments?.learningClass || 'Не указан' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Информация о компетенции -->
        <div class="details-section">
          <h4 class="section-title">
            <i class="pi pi-star" />
            Компетенция
          </h4>
          <div class="competence-details">
            <div class="competence-name">
              {{ selectedChildDetails.competence.direction.name }}
            </div>
            <div class="competence-description">
              {{ selectedChildDetails.competence.direction.description }}
            </div>
            <div class="competence-expert">
              <i class="pi pi-user" />
              Главный эксперт: {{ expertNames.get(selectedChildDetails.competence.direction.expertId) || `ID ${selectedChildDetails.competence.direction.expertId}` }}
            </div>
          </div>
        </div>

        <!-- Информация о документах -->
        <div class="info-section">
          <h4 class="section-title">
            <i class="pi pi-file" />
            Документы
          </h4>
          <div
            v-if="selectedDocs"
            class="info-grid docs-grid"
          >
            <div class="info-item">
              <div class="doc-info">
                <span class="info-label">Скан свидетельства о рождении:</span>
                <span class="info-value">
                  {{ `Статус: ${selectedDocs.birthFile.verified ? 'Одобрен' : 'на проверке'}` }}
                </span>
              </div>
              <div class="doc-actions">
                <Button
                  label="Просмотреть"
                  icon="pi pi-eye"
                  class="p-button-outlined p-button-sm"
                  @click="viewDocument(selectedDocs.birthFile)"
                />
                <Button
                  label="Скачать"
                  icon="pi pi-download"
                  class="p-button-outlined p-button-sm"
                  @click="downloadDocument(selectedDocs.birthFile)"
                />
              </div>
            </div>
            <div class="info-item">
              <div class="doc-info">
                <span class="info-label">СНИЛС:</span>
                <span class="info-value">
                  {{ `Статус: ${selectedDocs.snilsFile.verified ? 'Одобрен' : 'на проверке'}` }}
                </span>
              </div>
              <div class="doc-actions">
                <Button
                  label="Просмотреть"
                  icon="pi pi-eye"
                  class="p-button-outlined p-button-sm"
                  @click="viewDocument(selectedDocs.snilsFile)"
                />
                <Button
                  label="Скачать"
                  icon="pi pi-download"
                  class="p-button-outlined p-button-sm"
                  @click="downloadDocument(selectedDocs.snilsFile)"
                />
              </div>
            </div>
            <div class="info-item">
              <div class="doc-info">
                <span class="info-label">Скан справки из ОУ:</span>
                <span class="info-value">
                  {{ `Статус: ${selectedDocs.schoolFile.verified ? 'Одобрен' : 'на проверке'}` }}
                </span>
              </div>
              <div class="doc-actions">
                <Button
                  label="Просмотреть"
                  icon="pi pi-eye"
                  class="p-button-outlined p-button-sm"
                  @click="viewDocument(selectedDocs.schoolFile)"
                />
                <Button
                  label="Скачать"
                  icon="pi pi-download"
                  class="p-button-outlined p-button-sm"
                  @click="downloadDocument(selectedDocs.schoolFile)"
                />
              </div>
            </div>
            <div class="info-item">
              <div class="doc-info">
                <span class="info-label">Скан справки из площадки подготовки:</span>
                <span class="info-value">
                  {{ `Статус: ${selectedDocs.platformFile.verified ? 'Одобрен' : 'на проверке'}` }}
                </span>
              </div>
              <div class="doc-actions">
                <Button
                  label="Просмотреть"
                  icon="pi pi-eye"
                  class="p-button-outlined p-button-sm"
                  @click="viewDocument(selectedDocs.platformFile)"
                />
                <Button
                  label="Скачать"
                  icon="pi pi-download"
                  class="p-button-outlined p-button-sm"
                  @click="downloadDocument(selectedDocs.platformFile)"
                />
              </div>
            </div>
            <div class="info-item">
              <div class="doc-info">
                <span class="info-label">Скан согласия на ОПД:</span>
                <span class="info-value">
                  {{ `Статус: ${selectedDocs.consentFile.verified ? 'Одобрен' : 'на проверке'}` }}
                </span>
              </div>
              <div class="doc-actions">
                <Button
                  label="Просмотреть"
                  icon="pi pi-eye"
                  class="p-button-outlined p-button-sm"
                  @click="viewDocument(selectedDocs.consentFile)"
                />
                <Button
                  label="Скачать"
                  icon="pi pi-download"
                  class="p-button-outlined p-button-sm"
                  @click="downloadDocument(selectedDocs.consentFile)"
                />
              </div>
            </div>
          </div>
          <div
            v-else
          >
            <p class="no-mentor-text">
              <i class="pi pi-info-circle" />
              Нет загруженных документов
            </p>
          </div>
        </div>
      </div>

      <!-- Информация о наставнике -->
      <div class="details-section">
        <h4 class="section-title">
          <i class="pi pi-users" />
          Наставник
        </h4>
        <div
          v-if="selectedChildDetails?.child?.mentor"
          class="mentor-info"
        >
          <div class="mentor-details">
            <div class="detail-item">
              <span class="detail-label">ФИО:</span>
              <span class="detail-value">
                {{ `${selectedChildDetails.child.mentor.lastName} ${selectedChildDetails.child.mentor.firstName} ${selectedChildDetails.child.mentor.patronymic}` }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ selectedChildDetails.child.mentor.email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Телефон:</span>
              <span class="detail-value">{{ FormatManager.formatMobileNumberFromDTO(selectedChildDetails.child.mentor.mobileNumber) }}</span>
            </div>
          </div>
          <div class="mentor-actions">
            <Button
              label="Изменить наставника"
              icon="pi pi-pencil"
              class="p-button-outlined p-button-sm"
              @click="openMentorSelectionDialog(selectedChildDetails.child)"
            />
          </div>
        </div>
        <div
          v-else
          class="no-mentor"
        >
          <p class="no-mentor-text">
            <i class="pi pi-info-circle" />
            Наставник не выбран
          </p>
          <Button
            label="Выбрать наставника"
            icon="pi pi-plus"
            class="p-button-primary p-button-sm"
            @click="openMentorSelectionDialog(selectedChildDetails?.child || null)"
          />
        </div>
      </div>
    </Dialog>

    <!-- Диалог информации о ребенке без компетенций -->
    <Dialog
      v-model:visible="showChildInfoDialog"
      header="Информация о ребенке"
      :modal="true"
      :style="{ width: '700px', maxWidth: '90vw' }"
    >
      <div
        v-if="selectedChildInfo"
        class="child-info"
      >
        <!-- Информация о ребенке -->
        <div class="info-section">
          <div class="section-header">
            <h4 class="section-title">
              <i class="pi pi-user" />
              Персональные данные
            </h4>
            <Button
              v-tooltip="'Редактировать данные ребенка'"
              icon="pi pi-pencil"
              class="p-button-outlined p-button-sm edit-button"
              @click="editChild(selectedChildInfo)"
            />
            <Button
              v-tooltip="'Удалить'"
              icon="pi pi-trash"
              style="background: white; margin-left: 0.5rem;"
              class="p-button-outlined p-button-sm"
              @click="deleteChild(selectedChildInfo.id)"
            />
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">ФИО:</span>
              <span class="info-value">
                {{ `${selectedChildInfo.lastName} ${selectedChildInfo.firstName} ${selectedChildInfo.patronymic}` }}
              </span>
            </div>
            <div class="info-item">
              <span class="detail-label">Возрастная группа:</span>
              <span class="detail-value">
                {{ FormatManager.getAgeGroupByAge(
                  FormatManager.calculateAge(selectedChildInfo.dateOfBirth),
                  selectedChildInfo.childDocuments!.learningClass
                )?.label }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Школа:</span>
              <span class="info-value">
                {{ selectedChildInfo.childDocuments?.studyingPlace || 'Не указана' }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">СНИЛС:</span>
              <span class="info-value">
                {{ selectedChildInfo.childDocuments?.snilsNumber ? FormatManager.formatSnilsFromDTO(selectedChildInfo.childDocuments?.snilsNumber) : 'Не указана' }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Класс:</span>
              <span class="info-value">
                {{ selectedChildInfo.childDocuments?.learningClass || 'Не указан' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Информация о документах -->
        <div class="info-section">
          <h4 class="section-title">
            <i class="pi pi-file" />
            Документы
          </h4>
          <div
            v-if="selectedDocs"
            class="info-grid docs-grid"
          >
            <div class="info-item">
              <div class="doc-info">
                <span class="info-label">Скан свидетельства о рождении:</span>
                <span class="info-value">
                  {{ `Статус: ${selectedDocs.birthFile.verified ? 'Одобрен' : 'на проверке'}` }}
                </span>
              </div>
              <div class="doc-actions">
                <Button
                  label="Просмотреть"
                  icon="pi pi-eye"
                  class="p-button-outlined p-button-sm"
                  @click="viewDocument(selectedDocs.birthFile)"
                />
                <Button
                  label="Скачать"
                  icon="pi pi-download"
                  class="p-button-outlined p-button-sm"
                  @click="downloadDocument(selectedDocs.birthFile)"
                />
              </div>
            </div>
            <div class="info-item">
              <div class="doc-info">
                <span class="info-label">СНИЛС:</span>
                <span class="info-value">
                  {{ `Статус: ${selectedDocs.snilsFile.verified ? 'Одобрен' : 'на проверке'}` }}
                </span>
              </div>
              <div class="doc-actions">
                <Button
                  label="Просмотреть"
                  icon="pi pi-eye"
                  class="p-button-outlined p-button-sm"
                  @click="viewDocument(selectedDocs.snilsFile)"
                />
                <Button
                  label="Скачать"
                  icon="pi pi-download"
                  class="p-button-outlined p-button-sm"
                  @click="downloadDocument(selectedDocs.snilsFile)"
                />
              </div>
            </div>
            <div class="info-item">
              <div class="doc-info">
                <span class="info-label">Скан справки из ОУ:</span>
                <span class="info-value">
                  {{ `Статус: ${selectedDocs.schoolFile.verified ? 'Одобрен' : 'на проверке'}` }}
                </span>
              </div>
              <div class="doc-actions">
                <Button
                  label="Просмотреть"
                  icon="pi pi-eye"
                  class="p-button-outlined p-button-sm"
                  @click="viewDocument(selectedDocs.schoolFile)"
                />
                <Button
                  label="Скачать"
                  icon="pi pi-download"
                  class="p-button-outlined p-button-sm"
                  @click="downloadDocument(selectedDocs.schoolFile)"
                />
              </div>
            </div>
            <div class="info-item">
              <div class="doc-info">
                <span class="info-label">Скан справки из площадки подготовки:</span>
                <span class="info-value">
                  {{ `Статус: ${selectedDocs.platformFile.verified ? 'Одобрен' : 'на проверке'}` }}
                </span>
              </div>
              <div class="doc-actions">
                <Button
                  label="Просмотреть"
                  icon="pi pi-eye"
                  class="p-button-outlined p-button-sm"
                  @click="viewDocument(selectedDocs.platformFile)"
                />
                <Button
                  label="Скачать"
                  icon="pi pi-download"
                  class="p-button-outlined p-button-sm"
                  @click="downloadDocument(selectedDocs.platformFile)"
                />
              </div>
            </div>
            <div class="info-item">
              <div class="doc-info">
                <span class="info-label">Скан согласия на ОПД:</span>
                <span class="info-value">
                  {{ `Статус: ${selectedDocs.consentFile.verified ? 'Одобрен' : 'на проверке'}` }}
                </span>
              </div>
              <div class="doc-actions">
                <Button
                  label="Просмотреть"
                  icon="pi pi-eye"
                  class="p-button-outlined p-button-sm"
                  @click="viewDocument(selectedDocs.consentFile)"
                />
                <Button
                  label="Скачать"
                  icon="pi pi-download"
                  class="p-button-outlined p-button-sm"
                  @click="downloadDocument(selectedDocs.consentFile)"
                />
              </div>
            </div>
          </div>
          <div
            v-else
          >
            <p class="no-mentor-text">
              <i class="pi pi-info-circle" />
              Нет загруженных документов
            </p>
          </div>
        </div>
      </div>


      <!-- Информация о наставнике -->
      <div class="info-section">
        <h4 class="section-title">
          <i class="pi pi-users" />
          Наставник
        </h4>
        <div
          v-if="selectedChildInfo && selectedChildInfo.mentor"
          class="mentor-info"
        >
          <div class="mentor-details">
            <div class="info-item">
              <span class="info-label">ФИО:</span>
              <span class="info-value">
                {{ `${selectedChildInfo.mentor.lastName} ${selectedChildInfo.mentor.firstName} ${selectedChildInfo.mentor.patronymic}` }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ selectedChildInfo.mentor.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Телефон:</span>
              <span class="info-value">{{ FormatManager.formatMobileNumberFromDTO(selectedChildInfo.mentor.mobileNumber) }}</span>
            </div>
          </div>
          <div class="mentor-actions">
            <Button
              label="Изменить наставника"
              icon="pi pi-pencil"
              class="p-button-outlined p-button-sm"
              @click="openMentorSelectionDialog(selectedChildInfo)"
            />
          </div>
        </div>
        <div
          v-else
          class="no-mentor"
        >
          <p class="no-mentor-text">
            <i class="pi pi-info-circle" />
            Наставник не выбран
          </p>
          <Button
            label="Выбрать наставника"
            icon="pi pi-plus"
            class="p-button-primary p-button-sm"
            @click="openMentorSelectionDialog(selectedChildInfo || null)"
          />
        </div>
      </div>
    </Dialog>

    <!-- Диалог выбора наставника -->
    <Dialog
      v-model:visible="showMentorSelectionDialog"
      header="Выбор наставника"
      :modal="true"
      :style="{ width: '700px', maxWidth: '95vw' }"
    >
      <div class="mentor-selection">
        <p class="selection-description">
          Выберите наставника для {{ getSelectedChildName() }}
        </p>
        <div class="mentor-list">
          <!-- Опция "Я и являюсь наставником" -->
          <div
            class="mentor-item"
            :class="{ 'selected': selectedMentorId === user.id }"
            @click="selectMentor(user.id)"
          >
            <div class="mentor-info">
              <div class="mentor-info-content">
                <div class="mentor-name">
                  <i class="pi pi-user" />
                  Я и являюсь наставником
                </div>
                <div class="mentor-details">
                  <span class="mentor-email">{{ user?.email }}</span>
                  <span class="mentor-phone">{{ user?.mobileNumber ? FormatManager.formatMobileNumberFromDTO(user.mobileNumber) : '' }}</span>
                </div>
              </div>
            </div>
            <div class="mentor-actions">
              <i
                v-if="selectedMentorId === user.id"
                class="pi pi-check selected-icon"
              />
            </div>
          </div>
          
          <!-- Список доступных наставников -->
          <div 
            v-for="mentor in availableMentors" 
            :key="mentor.id"
            class="mentor-item"
            :class="{ 'selected': selectedMentorId === mentor.id }"
            @click="selectMentor(mentor.id)"
          >
            <div class="mentor-info">
              <div class="mentor-info-content">
                <div class="mentor-name">
                  {{ `${mentor.lastName} ${mentor.firstName} ${mentor.patronymic}` }}
                </div>
                <div class="mentor-details">
                  <span class="mentor-email">{{ mentor.email }}</span>
                  <span class="mentor-phone">{{ FormatManager.formatMobileNumberFromDTO(mentor.mobileNumber) }}</span>
                </div>
              </div>
            </div>
            <div class="mentor-actions">
              <Button
                v-if="getSavedMentorIds.includes(mentor.id)"
                v-tooltip.top="'Удалить из списка'"
                icon="pi pi-trash"
                class="p-button-danger p-button-sm p-button-text"
                @click.stop="removeMentorFromList(mentor.id)"
              />
              <i
                v-if="selectedMentorId === mentor.id"
                class="pi pi-check selected-icon"
              />
            </div>
          </div>
        </div>
        <div class="mentor-selection-actions">
          <Button
            label="Отмена"
            class="p-button-secondary"
            @click="closeMentorSelectionDialog"
          />
          <Button
            label="Сохранить"
            class="p-button-primary"
            :disabled="!selectedMentorId"
            @click="saveMentorSelection"
          />
        </div>
      </div>
    </Dialog>

    <!-- Диалог подтверждения удаления наставника -->
    <Dialog
      v-model:visible="showDeleteMentorDialog"
      header="Подтверждение удаления"
      :modal="true"
      :style="{ width: '400px', maxWidth: '90vw' }"
    >
      <div class="delete-confirmation">
        <div class="confirmation-content">
          <h4>Удалить наставника?</h4>
          <p>Вы уверены, что хотите удалить наставника "{{ selectedMentorToDelete?.name }}" из списка доступных наставников?</p>
          <p class="warning-text">
            Это действие нельзя отменить.
          </p>
        </div>
        <div class="confirmation-actions">
          <Button
            label="Отмена"
            class="p-button-secondary"
            @click="cancelDeleteMentor"
          />
          <Button
            label="Удалить"
            class="p-button-danger"
            @click="confirmDeleteMentor"
          />
        </div>
      </div>
    </Dialog>

    <ToastPopup :content="toastPopup" />
  </div>
</template>

<script lang="ts">
import Button from "primevue/button";
import { useUserStore } from '@/stores/userStore.ts';
import Dialog from 'primevue/dialog';
import AddChildForm, { type ChildFormErrors, type ChildFormFields } from '@/components/AddChildForm.vue';
import { ChildDocumentsResolver } from '@/api/resolvers/childDocuments/child-documents.resolver.ts';
import { ChildResolver } from '@/api/resolvers/child/child.resolver.ts';
import type { ChildOutputDto } from '@/api/resolvers/child/dto/output/child-output.dto.ts';
import { FileResolver } from '@/api/resolvers/files/file.resolver.ts';
import { FormatManager } from '@/utils/FormatManager.ts';
import ToastPopup from '@/components/ToastPopup.vue';
import { ChildCompetenciesResolver } from '@/api/resolvers/childCompetencies/child-competencies.resolver.ts';
import { UserResolver } from '@/api/resolvers/user/user.resolver.ts';
import type { UserOutputDto } from '@/api/resolvers/user/dto/output/user-output.dto.ts';
import { MentorLinksResolver } from '@/api/resolvers/mentorLinks/mentor-links.resolver.ts';
import type { ChildCompetenciesOutputDto } from '@/api/resolvers/childCompetencies/dto/output/child-competencies-output.dto.ts';
import { ChildPackResolver } from '@/api/resolvers/childPack/child-pack.resolver.ts';
import type { DocsOutputFileUploadDto } from '@/api/resolvers/files/dto/output/docs-output-file-upload.dto.ts';
import apiConf from '@/api/api.conf.ts';

export default {
  name: "UserDashboardHome",
  components: {
    ToastPopup,
    AddChildForm,
    Button,
    Dialog,
  },
  emits: ['openSettings'],
  data: function() {
    return {
      fileResolver: new FileResolver(),
      childResolver: new ChildResolver(),
      childDocumentsResolver: new ChildDocumentsResolver(),
      childCompetenciesResolver: new ChildCompetenciesResolver(),
      childPackResolver: new ChildPackResolver(),
      userResolver: new UserResolver(),
      mentorLinksResolver: new MentorLinksResolver(),
      userStore: useUserStore(),

      showAddChildDialog: false,
      showUserSettingsDialog: false,
      isHomeEducated: false,
      isHomePrepared: false,

      isEditing: false,
      selectedChild: null as ChildOutputDto | null,
      selectedMentorId: null as null | number,
      selectedDocs: null as null | {
        birthFile: DocsOutputFileUploadDto,
        snilsFile: DocsOutputFileUploadDto,
        schoolFile: DocsOutputFileUploadDto,
        platformFile: DocsOutputFileUploadDto,
        consentFile: DocsOutputFileUploadDto,
      },

      // Новые свойства для компетенций и модальных окон
      showChildDetailsDialog: false,
      showChildInfoDialog: false,
      showMentorSelectionDialog: false,
      showDeleteMentorDialog: false,
      selectedChildDetails: null as { child: ChildOutputDto, competence: ChildCompetenciesOutputDto } | null,
      selectedChildInfo: null as ChildOutputDto | null,
      selectedMentorToDelete: null as { id: number, name: string } | null,
      availableMentors: [] as {
        id: number;
        lastName: string;
        firstName: string;
        patronymic: string;
        email: string;
        mobileNumber: string;
      }[],
      childCompetencies: [] as {
        child: ChildOutputDto,
        competencies: ChildCompetenciesOutputDto[]
      }[],
      children: [] as ChildOutputDto[],
      expertsCache: new Map<number, UserOutputDto>(),
      expertNames: new Map<number, string>(),

      isLoading: false,
      addBirthFile: false,
      addSnilsFile: false,
      addConsentFile: false,
      addSchoolFile: false,
      addPlatformFile: false,

      toastPopup: {
        title: '',
        message: '',
      },


      childForm: {
        lastName: '',
        firstName: '',
        patronymic: '',
        birthDate: '',
        snilsNumber: '',
        schoolName: '',
        platform: '',
        grade: null as number | null,
        childConsentFile: null as null | File,
        snilsScan: null as null | File,
        birthCertificate: null as null | File,
        schoolCertificate: null as null | File,
        platformCertificate: null as null | File,
      } as ChildFormFields,

      errors: {
        lastName: '',
        firstName: '',
        birthDate: '',
        snilsNumber: '',
        schoolName: '',
        platform: '',
        grade: '',
        snilsScan: '',
        schoolCertificate: '',
        birthCertificate: '',
        platformCertificate: '',
      } as ChildFormErrors,
    };
  },
  computed: {
    FormatManager() {
      return FormatManager
    },
    user() {
      return this.userStore.user
    },
    getSavedMentorIds() {
      return this.availableMentors.map(mentor => mentor.id);
    },
  },
  watch: {
    showAddChildDialog() {
      this.errors = {
        birthCertificate: '',
        birthDate: '',
        childConsentFile: '',
        lastName: '',
        firstName: '',
        grade: '',
        platform: '',
        platformCertificate: '',
        schoolCertificate: '',
        schoolName: '',
        snilsNumber: '',
        snilsScan: ''
      }
    }
  },
  async mounted() {
    // Проверяем, есть ли сохраненный наставник после перехода по ссылке
    // Загружаем компетенции для всех детей
    await this.loadCompetencies()
    
    // Загружаем доступных наставников
    await this.loadAvailableMentors();
  },
  
  async activated() {
    // Обновляем список наставников при активации компонента
    // Это поможет обновить список после возврата с подтверждения ссылки
    await this.loadAvailableMentors();
  },
  methods: {
    async loadCompetencies() {
      const response = await this.childResolver.getByUserId(this.user!.id)
      if (typeof response.message !== "string" && response.status === 200) {
        this.children = response.message;
        for (const child of this.children) {
          await this.loadCompetenciesByChild(child)
        }
      }
    },
    validateForm() {
      let isValid = true
      // Валидация данных ребенка
      if (!this.childForm.lastName.trim()) {
        this.errors.lastName = "Фамилия ребенка обязательна";
        isValid = false;
      }

      if (!this.childForm.firstName.trim()) {
        this.errors.firstName = "Имя ребенка обязательно";
        isValid = false;
      }

      if (!this.childForm.birthDate) {
        this.errors.birthDate = "Дата рождения обязательна";
        isValid = false;
      } else if (!/^\d{2}\.\d{2}\.\d{4}$/.test(this.childForm.birthDate)) {
        this.errors.birthDate = "Введите дату в формате дд.мм.гггг";
        isValid = false;
      }

      if (!this.childForm.birthCertificate &&  (!this.isEditing || this.addBirthFile)) {
        this.errors.birthCertificate =
          "Необходимо загрузить скан свидетельства о рождении";
        isValid = false;
      }

      if (!this.childForm.snilsNumber && (!this.isEditing || this.addSnilsFile)) {
        this.errors.snilsNumber = "Номер СНИЛС обязателен";
        isValid = false;
      }

      if (!this.childForm.snilsScan && (!this.isEditing || this.addSnilsFile)) {
        this.errors.snilsScan = "Необходимо загрузить скан СНИЛС";
        isValid = false;
      }

      if (!this.childForm.schoolName && (!this.isEditing || this.addSchoolFile) && !this.isHomeEducated) {
        this.errors.schoolName = "Название учреждения обязательно";
        isValid = false;
      }

      if (this.childForm.grade === null && (!this.isEditing || this.addSchoolFile)  && !this.isHomeEducated) {
        this.errors.grade = "Класс обучения обязателен";
        isValid = false;
      }

      if (!this.childForm.platform && (!this.isEditing || this.addPlatformFile) && !this.isHomePrepared) {
        this.errors.platform = "Выберите площадку подготовки";
        isValid = false;
      }

      if (!this.childForm.schoolCertificate && (!this.isEditing || this.addSchoolFile)  && !this.isHomeEducated) {
        this.errors.schoolCertificate = "Необходимо загрузить справку из ОУ";
        isValid = false;
      }

      if (!this.childForm.platformCertificate && (!this.isEditing || this.addPlatformFile)  && !this.isHomePrepared) {
        this.errors.platformCertificate =
          "Необходимо загрузить справку из площадки подготовки";
        isValid = false;
      }

      if (!this.childForm.childConsentFile && (!this.isEditing || this.addConsentFile)) {
        this.errors.childConsentFile =
          "Необходимо загрузить согласие на обработку персональных данных";
        isValid = false;
      }
      
      return isValid
    },
    clearChildForm() {
      this.childForm = {
        birthCertificate: null,
        birthDate: '',
        childConsentFile: null,
        lastName: '',
        firstName: '',
        patronymic: null,
        grade: null,
        platform: '',
        platformCertificate: null,
        schoolCertificate: null,
        schoolName: '',
        snilsNumber: '',
        snilsScan: null

      }
    },
    fillNewChild() {
      this.selectedChild = null
      this.clearChildForm()
      this.isEditing = false
      this.showAddChildDialog = true;
    },
    editChild(child: ChildOutputDto) {
      this.clearChildForm()
      this.isEditing = child.childDocuments !== null
      this.showAddChildDialog = true
      this.childForm.lastName = child.lastName
      this.childForm.firstName = child.firstName
      this.childForm.patronymic = child.patronymic
      this.childForm.birthDate = FormatManager.formatBirthDateFromDTO(child.dateOfBirth)
      this.selectedChild = child
    },
    async addChild() {
      if (this.user === null || !this.validateForm()) return
      this.isLoading = true;
      if (this.isEditing && this.selectedChild !== null) {
        await this.childResolver.update({
          id: this.selectedChild.id,
          lastName: this.childForm.lastName,
          firstName: this.childForm.firstName,
          patronymic: this.childForm.patronymic,
          dateOfBirth: FormatManager.formatBirthDateToDTO(this.childForm.birthDate),
          mentorId: null
        })
        await this.addChildDocs()
        await this.userStore.fillChildren()
        
        // Обновляем данные в модалках, если они открыты
        if (this.showChildDetailsDialog && this.selectedChildDetails) {
          // Обновляем данные в модалке подробной информации
          const updatedChild = this.userStore.user?.children.find(child => child.id === this.selectedChildDetails?.child.id)
          if (updatedChild && this.selectedChildDetails) {
            this.selectedChildDetails.child = updatedChild
          }
        }
        if (this.showChildInfoDialog && this.selectedChildInfo) {
          // Обновляем данные в модалке краткой информации
          const updatedChild = this.userStore.user?.children.find(child => child.id === this.selectedChildInfo?.id)
          if (updatedChild && this.selectedChildInfo) {
            this.selectedChildInfo = updatedChild
          }
        }
        
        // Показываем тост об успехе
        this.toastPopup = {
          title: 'Успешно',
          message: 'Данные ребенка успешно обновлены'
        }
        
        // Закрываем модалку
        this.showAddChildDialog = false
      } else {
        const response = await this.childPackResolver.create({
          userId: this.user.id,
          lastName: this.childForm.lastName,
          firstName: this.childForm.firstName,
          patronymic: this.childForm.patronymic,
          dateOfBirth: FormatManager.formatBirthDateToDTO(this.childForm.birthDate),
          mentorId: null,
          additionalStudyingCertificateFile: this.isHomePrepared
            ? await this.getHomeFile("home_preparation.txt")
            : this.childForm.platformCertificate!,
          birthCertificateFile: this.childForm.birthCertificate!,
          consentToChildPdpFile: this.childForm.childConsentFile!,
          learningClass: this.isHomeEducated
            ? 0
            : this.childForm.grade!,
          parentRole: this.user.children.length > 0 && this.user.children[0].childDocuments !== null
            ? this.user.children[0].childDocuments?.parentRole
            : "Не указано",
          snilsFile: this.childForm.snilsScan!,
          snilsNumber: FormatManager.formatSnilsToDTO(this.childForm.snilsNumber),
          studyingCertificateFile: this.isHomeEducated
            ? await this.getHomeFile("home_education.txt")
            : this.childForm.schoolCertificate!,
          studyingPlace: this.isHomeEducated
            ? "Домашнее обучение"
            : this.childForm.schoolName,
          trainingGround: this.isHomePrepared
            ? "Домашнее обучение"
            : this.childForm.platform
        })
        if (typeof response.message !== "string") await this.userStore.fillChildren()
        else this.toastPopup = {
          title: response.status.toString(),
          message: response.message
        }
      }
      this.isLoading = false
      
      // Закрываем модалку только если это не было редактирование (для редактирования модалка уже закрыта выше)
      if (!this.isEditing) {
        this.showAddChildDialog = false
      }
    },
    async addChildDocs() {
      if (this.addBirthFile || this.addSnilsFile
        || this.addSchoolFile || this.addPlatformFile
        || this.addConsentFile) {
        const response = await this.childDocumentsResolver.update({
          id: this.selectedChild!.childDocuments!.id,
          additionalStudyingCertificateFile: this.isHomePrepared
            ? await this.getHomeFile("home_preparation.txt")
            : this.childForm.platformCertificate,
          birthCertificateFile: this.childForm.birthCertificate,
          consentToChildPdpFile: this.childForm.childConsentFile,
          learningClass: this.isHomeEducated
            ? 0
            : this.childForm.grade ?? this.selectedChild!.childDocuments!.learningClass,
          parentRole: this.selectedChild!.childDocuments!.parentRole,
          snilsFile: this.childForm.snilsScan,
          snilsNumber: this.childForm.snilsNumber
            ? FormatManager.formatSnilsToDTO(this.childForm.snilsNumber)
            : this.selectedChild!.childDocuments!.snilsNumber,
          studyingCertificateFile: this.isHomeEducated
            ? await this.getHomeFile("home_education.txt")
            : this.childForm.schoolCertificate,
          studyingPlace: this.isHomeEducated
            ? "Домашнее обучение"
            : this.childForm.schoolName ?? this.selectedChild!.childDocuments!.studyingPlace,
          trainingGround: this.isHomePrepared
            ? "Дамашнее обучение"
            : this.childForm.platform ?? this.selectedChild!.childDocuments!.trainingGround,
        })
        if (typeof response.message !== "string") await this.userStore.fillChildren()
      }
    },
    async deleteChild(id: number) {
      if (confirm(
        `Вы уверены что хотите удалить ребенка '${this.children.find(child => child.id === id)?.firstName}'?`
      )) {
        const response = await this.childResolver.deleteById(id)
        if (response.status === 200) {
          await this.userStore.fillChildren()
          this.hideAllDialogs()
        }
      }
    },
    async getHomeFile(filename: string) {
      const response = await fetch(`/docs/${filename}`)
      const blob = await response.blob()
      return new File([], filename, { type: blob.type })
    },
    // Методы для работы с компетенциями
    getCompetenciesByChildId(childId: number) {
      const competencies = this.childCompetencies.find(row => row.child.id === childId)?.competencies
      return competencies ? competencies : []
    },
    getMentorName(child: ChildOutputDto) {
      if (child.mentor) {
        return `${child.mentor.lastName} ${child.mentor.firstName} ${child.mentor.patronymic}`;
      }
      return 'Наставник не назначен';
    },
    getSelectedChildName() {
      // Проверяем, откуда открыт диалог - из диалога подробной информации или из диалога информации о ребенке
      if (this.selectedChildDetails?.child) {
        return `${this.selectedChildDetails.child.lastName} ${this.selectedChildDetails.child.firstName} ${this.selectedChildDetails.child.patronymic}`;
      } else if (this.selectedChildInfo) {
        return `${this.selectedChildInfo.lastName} ${this.selectedChildInfo.firstName} ${this.selectedChildInfo.patronymic}`;
      } else if (this.selectedChild) {
        return `${this.selectedChild.lastName} ${this.selectedChild.firstName} ${this.selectedChild.patronymic}`;
      }
      return 'ребенка';
    },
    async loadCompetenciesByChild(child: ChildOutputDto) {
      try {
        const response = await this.childCompetenciesResolver.getByChildId(child.id)
        
        if (typeof response.message === "string" || response.status !== 200) {
          console.error(`Ошибка при загрузке компетенций для ребенка ${child.id}:`, {
            status: response.status,
            message: response.message
          });
          return;
        }
        
        console.log(`Успешно загружены компетенции для ребенка ${child.id}:`, response.message);
        this.childCompetencies.push({
          child: child,
          competencies: response.message
        });

        // Загружаем данные экспертов для каждой компетенции
        for (const competence of response.message) {
          const expertId = competence.direction.expertId;
          if (expertId && !this.expertNames.has(expertId)) {
            await this.loadExpertData(expertId);
          }
        }
      } catch (error) {
        console.error(`Критическая ошибка при загрузке компетенций для ребенка ${child.id}:`, error);
      }
    },

    async loadExpertData(expertId: number) {
      try {
        // Проверяем, не загружен ли уже эксперт
        if (this.expertNames.has(expertId)) {
          return;
        }

        const response = await this.userResolver.getById(expertId);
        
        if (response.status === 200 && typeof response.message !== 'string') {
          const expert = response.message;
          const expertName = `${expert.lastName} ${expert.firstName} ${expert.patronymic}`;
          
          // Сохраняем данные эксперта
          this.expertsCache.set(expertId, expert);
          this.expertNames.set(expertId, expertName);
          
          console.log(`Загружен эксперт ${expertId}: ${expertName}`);
        } else {
          console.warn(`Не удалось загрузить данные эксперта ${expertId}`);
          // Устанавливаем fallback имя
          this.expertNames.set(expertId, `Эксперт #${expertId}`);
        }
      } catch (error) {
        console.error(`Ошибка при загрузке данных эксперта ${expertId}:`, error);
        // Устанавливаем fallback имя
        this.expertNames.set(expertId, `Эксперт #${expertId}`);
      }
    },

    // Методы для модальных окон
    async openChildDetailsDialog(child: ChildOutputDto, competence: ChildCompetenciesOutputDto) {
      // Скрываем все другие модалки
      this.hideAllDialogs();
      
      // Убеждаемся, что данные эксперта загружены
      const expertId = competence.direction.expertId;
      if (expertId && !this.expertNames.has(expertId)) {
        await this.loadExpertData(expertId);
      }
      if (child.childDocuments !== null) {
        this.selectedDocs = {
          birthFile: (await this.fileResolver.getById(child.childDocuments.birthCertificateId)) as DocsOutputFileUploadDto,
          snilsFile: (await this.fileResolver.getById(child.childDocuments.snilsId)) as DocsOutputFileUploadDto,
          schoolFile: (await this.fileResolver.getById(child.childDocuments.studyingCertificateId)) as DocsOutputFileUploadDto,
          platformFile: (await this.fileResolver.getById(child.childDocuments.additionalStudyingCertificateId)) as DocsOutputFileUploadDto,
          consentFile: (await this.fileResolver.getById(child.childDocuments.consentToChildPdpId)) as DocsOutputFileUploadDto,
        }
      }
      
      this.selectedChildDetails = { child, competence };
      this.showChildDetailsDialog = true;
    },
    async openChildInfoDialog(child: ChildOutputDto) {
      // Скрываем все другие модалки
      this.hideAllDialogs();
      if (child.childDocuments !== null) {
        this.selectedDocs = {
          birthFile: (await this.fileResolver.getById(child.childDocuments.birthCertificateId)) as DocsOutputFileUploadDto,
          snilsFile: (await this.fileResolver.getById(child.childDocuments.snilsId)) as DocsOutputFileUploadDto,
          schoolFile: (await this.fileResolver.getById(child.childDocuments.studyingCertificateId)) as DocsOutputFileUploadDto,
          platformFile: (await this.fileResolver.getById(child.childDocuments.additionalStudyingCertificateId)) as DocsOutputFileUploadDto,
          consentFile: (await this.fileResolver.getById(child.childDocuments.consentToChildPdpId)) as DocsOutputFileUploadDto,
        }
      }
      
      this.selectedChildInfo = child;
      this.showChildInfoDialog = true;
    },
    async openMentorSelectionDialog(child: ChildOutputDto | null) {
      if (!child) return;
      
      // Скрываем все другие модалки
      this.hideAllDialogs();
      
      // Загружаем наставников с сервера
      await this.loadAvailableMentors();
      this.selectedChild = child
      // Устанавливаем выбранного наставника, если он есть, иначе null
      this.selectedMentorId = child.mentor ? child.mentor.id : null
      this.showMentorSelectionDialog = true;
    },

    hideAllDialogs() {
      this.showChildDetailsDialog = false;
      this.showChildInfoDialog = false;
      this.showMentorSelectionDialog = false;
      this.showDeleteMentorDialog = false;
      this.showAddChildDialog = false;
    },

    async loadAvailableMentors() {
      // Проверяем localStorage на наличие ID наставника
      const strMentorIds = localStorage.getItem('mentorIds');
      const mentorIds = strMentorIds ? JSON.parse(strMentorIds) as number[] : [];
      console.log('Loading available mentor from localStorage ID:', mentorIds);

      // Полностью очищаем и пересоздаем список опций наставников
      this.availableMentors = [];

      console.log('Initial mentorOptions:', this.availableMentors);

      if (mentorIds.length > 0) {
        for (const mentorId of mentorIds) {
          try {
            console.log('Loading mentor data from API for ID:', mentorId);

            // Загружаем данные наставника из API
            const response = await this.userResolver.getById(mentorId);
            console.log('API Response for mentor:', response);

            if (response.status === 200 && typeof response.message !== 'string') {
              const mentor = response.message;
              const mentorName = `${mentor.lastName} ${mentor.firstName} ${mentor.patronymic}`;


              // Добавляем внешнего наставника в список опций (проверяем на дублирование)
              const existingMentor = this.availableMentors.find(option => option.id === mentorId);
              if (!existingMentor) {
                this.availableMentors.push(mentor);
                console.log('Added mentor to options:', mentorName);
              } else {
                console.log('Mentor already exists in options:', existingMentor);
              }
            } else {
              console.log('API failed, using fallback');
            }
          } catch (error) {
            console.error('Error loading mentor from API:', error);
          }
        }
      } else {
        console.log('No mentor ID found in localStorage');
      }
    },
    removeMentorFromList(mentorId: number) {
      // Находим наставника для отображения в диалоге подтверждения
      const mentor = this.availableMentors.find(m => m.id === mentorId);
      if (mentor) {
        this.selectedMentorToDelete = {
          id: mentorId,
          name: `${mentor.lastName} ${mentor.firstName} ${mentor.patronymic}`
        };
        this.showDeleteMentorDialog = true;
      }
    },
    cancelDeleteMentor() {
      this.showDeleteMentorDialog = false;
      this.selectedMentorToDelete = null;
    },
    async confirmDeleteMentor() {
      if (!this.selectedMentorToDelete) return;
      
      try {
        // Удаляем связь родитель-наставник с сервера
        this.availableMentors = this.availableMentors.filter(mentor => mentor.id !== this.selectedMentorToDelete!.id);
        localStorage.setItem("mentorIds", JSON.stringify(this.availableMentors.map(mentor => mentor.id)));
        
        this.toastPopup = {
          title: 'Успех',
          message: `Наставник "${this.selectedMentorToDelete.name}" удален из списка`
        };
        
        this.showDeleteMentorDialog = false;
        this.selectedMentorToDelete = null;
      } catch (error) {
        console.error('Ошибка при удалении наставника:', error);
        this.toastPopup = {
          title: 'Ошибка',
          message: 'Не удалось удалить наставника'
        };
      }
    },
    selectMentor(mentorId: number) {
      this.selectedMentorId = mentorId;
    },
    closeMentorSelectionDialog() {
      this.showMentorSelectionDialog = false;
      this.selectedMentorId = null;
      this.selectedChild = null;
    },
    async saveMentorSelection() {
      if (!this.selectedMentorId || !this.selectedChild?.id) return;
      try {
        let mentorId = null;
        
        // Определяем ID наставника
        if (this.selectedMentorId === this.user?.id) {
          // Если родитель выбирает себя, используем его ID
          mentorId = this.user?.id || null;
        } else {
          // Если выбран другой наставник
          mentorId = this.selectedMentorId as number;
        }

        // Обновляем наставника для ребенка
        console.log(this.availableMentors.find(mentor => mentor.id === mentorId) !== undefined
          || mentorId === this.user?.id)
        await this.childResolver.update({
          id: this.selectedChild.id,
          mentorId: (this.availableMentors.find(mentor => mentor.id === mentorId) !== undefined
            || mentorId === this.user?.id)
            ? mentorId
            : this.user!.id,
          dateOfBirth: this.selectedChild.dateOfBirth,
          firstName: this.selectedChild.firstName,
          lastName: this.selectedChild.lastName,
          patronymic: this.selectedChild.patronymic
        });

        // Обновляем данные пользователя
        await this.userStore.fillChildren();
        
        // Обновляем локальные данные для немедленного отображения
        if (this.selectedChildInfo) {
          // Обновляем данные в selectedChildInfo
          const updatedChild = this.userStore.user?.children.find(c => c.id === this.selectedChildInfo!.id);
          if (updatedChild) {
            this.selectedChildInfo = updatedChild;
          }
        }
        
        if (this.selectedChildDetails) {
          // Обновляем данные в selectedChildDetails
          const updatedChild = this.userStore.user?.children.find(c => c.id === this.selectedChildDetails!.child.id);
          if (updatedChild) {
            this.selectedChildDetails.child = updatedChild;
          }
        }
        
        // Сохраняем связь родитель-наставник на сервере
        if (this.userStore.user && mentorId !== null) {
          await this.mentorLinksResolver.create({
            userId: mentorId
          });
        }
        
        this.toastPopup = {
          title: 'Успех',
          message: 'Наставник успешно назначен'
        };
        
        this.closeMentorSelectionDialog();
        this.showChildDetailsDialog = false;
        this.showChildInfoDialog = false;
      } catch (error) {
        console.error('Ошибка при сохранении наставника:', error);
        this.toastPopup = {
          title: 'Ошибка',
          message: 'Не удалось сохранить наставника'
        };
      }
    },
    
    // Методы для работы с документами
    viewDocument(doc: DocsOutputFileUploadDto) {
      if (!doc || !doc.id) {
        this.toastPopup = {
          title: 'Ошибка',
          message: 'Документ недоступен для просмотра'
        };
        return;
      }
      
      // Используем тот же подход, что и в админке
      window.open(`${apiConf.endpoint}/file-service/v1/files/view/${doc.id}`, '_blank');
    },
    
    downloadDocument(doc: DocsOutputFileUploadDto) {
      if (!doc || !doc.id) {
        this.toastPopup = {
          title: 'Ошибка',
          message: 'Документ недоступен для скачивания'
        };
        return;
      }
      
      // Используем тот же подход, что и в админке
      window.location.href = `${apiConf.endpoint}/file-service/v1/files/download/${doc.id}`;
    }
  }
};
</script>

<style scoped>
.dashboard-home {
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
  font-family: "BIPS", sans-serif;
}

.page-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1.1rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  overflow: hidden;
  transition:
    box-shadow 0.3s ease,
    border-color 0.3s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.info-card:hover {
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
  border: 2px solid #ff9800;
}

.card-header {
  display: flex;
  justify-content: space-between;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 1.5rem;
}

.card-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  flex: 1;
}

.card-title i {
  margin-right: 0.75rem;
  font-size: 1.1rem;
}

.docs-grid {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.docs-grid .info-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #ff9800;
  transition: all 0.3s ease;
}

.docs-grid .info-item:hover {
  background: #e3f2fd;
  border-left-color: #2196f3;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
}

.docs-grid .info-label {
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.docs-grid .info-value {
  color: #6c757d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.docs-grid .info-value::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff9800;
  flex-shrink: 0;
}

.docs-grid .info-item:hover .info-value::before {
  background: #2196f3;
}

.docs-grid .doc-info {
  flex: 1;
  margin-bottom: 1rem;
}

.docs-grid .doc-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.docs-grid .doc-actions .p-button {
  flex: 1;
  min-width: 120px;
}

.header-button {
  background: white !important;
  color: #ff9800 !important;
  border: 2px solid white !important;
  font-weight: 600 !important;
  flex-shrink: 0;
  margin-left: auto;
}

.header-button:hover {
  background: #f8f9fa !important;
  color: #f57c00 !important;
  border-color: #f8f9fa !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding: 1.5rem;
}

.data-section {
  margin-bottom: 1.5rem;
}

.data-section:last-child {
  margin-bottom: 0;
}

.section-title {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #ff9800;
  padding-bottom: 0.5rem;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.data-item:last-child {
  border-bottom: none;
}

.data-label {
  color: #6c757d;
  font-weight: 500;
  min-width: 120px;
}

.data-value {
  color: #2c3e50;
  font-weight: 500;
  text-align: right;
}

.competencies-preview {
  text-align: center;
}

.preview-text {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .dashboard-home {
    padding: 0 1rem;
    max-width: 100%;
    width: 100%;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    width: 100%;
    max-width: 100%;
    padding: 0;
    margin: 0;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .info-card {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0;
  }

  .card-header {
    padding: 1rem;
  }

  .card-content {
    padding: 1rem;
  }

  .data-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .data-value {
    text-align: left;
  }
}

/* Очень маленькие экраны */
@media (max-width: 480px) {
  .dashboard-home {
    padding: 0 0.5rem;
    max-width: 100%;
    width: 100%;
  }

  .dashboard-grid {
    gap: 0.75rem;
    width: 100%;
    max-width: 100%;
    padding: 0;
    margin: 0;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
  }

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

  .data-item {
    padding: 0.5rem 0;
  }

  .data-label {
    font-size: 0.85rem;
  }

  .data-value {
    font-size: 0.9rem;
  }
}

/* Стили для участников */
.participants-preview {
  text-align: center;
}

.preview-text {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.mentor-available-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #e8f5e8;
  border: 1px solid #28a745;
  border-radius: 6px;
  color: #155724;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.mentor-available-notice i {
  color: #28a745;
}

/* Стили для компетенций */
.competencies-section {
  margin-top: 1rem;
}

.competencies-scrollable {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

/* Кастомный скроллбар для WebKit браузеров */
.competencies-scrollable::-webkit-scrollbar {
  width: 6px;
}

.competencies-scrollable::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.competencies-scrollable::-webkit-scrollbar-thumb {
  background: #ff9800;
  border-radius: 3px;
}

.competencies-scrollable::-webkit-scrollbar-thumb:hover {
  background: #f57c00;
}

.child-competencies {
  margin-bottom: 2rem;
}

.child-competencies:last-child {
  margin-bottom: 0;
}

.child-name {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #ff9800;
  padding-bottom: 0.5rem;
}

.competencies-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Стили для диалога подтверждения удаления */
.delete-confirmation {
  text-align: center;
  padding: 1rem;
}

.confirmation-content h4 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.confirmation-content p {
  color: #6c757d;
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.warning-text {
  color: #e74c3c !important;
  font-weight: 500;
  font-size: 0.9rem;
}

.confirmation-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.competence-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #ff9800;
  cursor: pointer;
  transition: all 0.3s ease;
}

.competence-item:hover {
  background: #e3f2fd;
  border-left-color: #2196f3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
}

.competence-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.competence-item:hover .competence-icon {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  transform: scale(1.1);
}

.competence-info {
  flex: 1;
}

.competence-name {
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  transition: color 0.3s ease;
}

.competence-item:hover .competence-name {
  color: #2196f3;
}

.competence-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.competence-item:hover .competence-description {
  color: #1976d2;
}

.competence-expert {
  color: #ff9800;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;
}

.competence-mentor {
  color: #28a745;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;
  margin-top: 0.25rem;
}

.competence-item:hover .competence-expert {
  color: #1976d2;
}

.competence-item:hover .competence-mentor {
  color: #1976d2;
}

  /* Мобильные стили для touch устройств */
  @media (max-width: 768px) {
    .competence-item:active {
      background: #e3f2fd;
      border-left-color: #2196f3;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
    }
    
    .competence-item:active .competence-icon {
      background: linear-gradient(135deg, #2196f3, #1976d2);
      transform: scale(1.05);
    }
    
    .competence-item:active .competence-name {
      color: #2196f3;
    }
    
    .competence-item:active .competence-description {
      color: #1976d2;
    }
    
    .competence-item:active .competence-expert {
      color: #1976d2;
    }
    
    .competence-item:active .competence-mentor {
      color: #1976d2;
    }
  }

.no-competencies {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #6c757d;
}

.no-competencies.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
  border-left-color: #ff9800;
  background: #fff3cd;
}

.no-competencies.clickable:hover {
  background: #e3f2fd;
  border-left-color: #2196f3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
}

.click-icon {
  margin-left: auto;
  color: #ff9800;
  transition: color 0.3s ease;
}

.no-competencies.clickable:hover .click-icon {
  color: #2196f3;
}

.no-competencies.clickable {
  display: flex;
  flex-direction: column;
  gap: 0;
  align-items: flex-start;
}

.no-competencies-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Простая строчка с наставником внутри блока */
.mentor-simple {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #28a745;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e0e0e0;
  justify-content: flex-start;
}

.mentor-simple i {
  color: #28a745;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #6c757d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #dee2e6;
}

.empty-text {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.empty-subtitle {
  font-size: 0.9rem;
  margin: 0;
}

/* Стили для модальных окон */

.child-info {
  max-height: 60vh;
  overflow-y: auto;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 500;
}

.info-value {
  color: #2c3e50;
  font-weight: 500;
}

.details-section {
  margin-bottom: 2rem;
}

.details-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  color: #2c3e50;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #ff9800;
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.edit-button {
  margin-left: 1rem;
  flex-shrink: 0;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 500;
}

.detail-value {
  color: #2c3e50;
  font-weight: 500;
}

.competence-details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #ff9800;
}

.competence-details .competence-name {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.competence-details .competence-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.competence-details .competence-expert {
  color: #ff9800;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-section .mentor-info,
.details-section .mentor-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #28a745;
}

.info-section .mentor-details,
.details-section .mentor-details {
  margin-bottom: 1rem;
}

.info-section .mentor-actions,
.details-section .mentor-actions {
  display: flex;
  justify-content: flex-end;
}

.no-mentor {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #6c757d;
}

.no-mentor-text {
  color: #6c757d;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Стили для выбора наставника */
.mentor-selection {

  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  background-color: #f8f9fa;
}

.selection-description {
  color: #6c757d;
  margin: 0 0 1.5rem 0;
  font-size: 0.9rem;
}

.mentor-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.mentor-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  margin-bottom: 0.75rem;
}

.mentor-item:hover {
  background: #e9ecef;
  border-color: #ff9800;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.15);
}

.mentor-item.selected {
  background: #fff3cd;
  border-color: #ff9800;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
}

.mentor-item.selected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #28a745;
  border-radius: 12px 0 0 12px;
}

.parent-mentor-option {
  background: #e8f5e8;
  border-color: #28a745;
}

.parent-mentor-option:hover {
  background: #d4edda;
  border-color: #28a745;
}

.parent-mentor-option.selected {
  background: #c3e6cb;
  border-color: #28a745;
}

.parent-mentor-option .mentor-name {
  color: #155724;
  font-weight: 600;
}

.parent-mentor-option .mentor-name i {
  margin-right: 0.5rem;
  color: #28a745;
}

.mentor-selection .mentor-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mentor-info-content {
  flex: 1;
}

.mentor-name {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mentor-name i {
  color: #ff9800;
  font-size: 1rem;
}

.mentor-selection .mentor-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mentor-email,
.mentor-phone {
  color: #6c757d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mentor-selection .mentor-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selected-icon {
  color: #28a745;
  font-size: 1.2rem;
}

.mentor-selection-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
  flex-wrap: wrap;
}

.mentor-selection-actions .p-button {
  min-width: 120px;
  white-space: nowrap;
}

/* Мобильные стили для новых компонентов */
@media (max-width: 768px) {
  .competencies-scrollable {
    max-height: 300px;
  }
  
  .card-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .competence-item {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .competence-icon {
    align-self: flex-start;
  }
  
  .mentor-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .mentor-selection .mentor-info {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .mentor-selection .mentor-actions {
    align-self: flex-end;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .docs-grid .info-item {
    padding: 0.75rem;
  }
  
  .docs-grid .info-label {
    font-size: 0.85rem;
  }
  
  .docs-grid .info-value {
    font-size: 0.85rem;
  }
  
  .docs-grid .doc-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .docs-grid .doc-actions .p-button {
    min-width: auto;
    width: 100%;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .edit-button {
    margin-left: 0;
    align-self: flex-end;
  }
  
  .mentor-selection-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .mentor-selection-actions .p-button {
    width: 100%;
    min-width: auto;
  }
}

/* Для очень маленьких экранов */
@media (max-width: 480px) {
  .competencies-scrollable {
    max-height: 250px;
  }
}
</style>
