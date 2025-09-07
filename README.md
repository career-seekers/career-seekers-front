# Искатели профессий | Личный кабинет

Веб-приложение для управления участниками программы "Искатели профессий" с тремя типами пользователей: родители, эксперты и кураторы.

## 🚀 Технологический стек

- **Vue 3** - основной фреймворк
- **Vite** - сборщик и dev-сервер
- **PrimeVue** - UI компоненты
- **Vue Router** - маршрутизация
- **CSS3** - стилизация с анимациями

## 📁 Структура проекта

```
src/
├── assets/                 # Статические ресурсы
│   ├── fonts/             # Шрифты
│   ├── easter-egg/        # Пасхалка (гуси)
│   ├── bg1.png           # Фон для auth страниц
│   ├── bg2.png           # Фон для дашбордов
│   └── logo.png          # Логотип (favicon)
├── components/            # Переиспользуемые компоненты
│   └── GooseConfetti.vue # Пасхалка с конфетти
├── mixins/               # Vue миксины
│   └── easterEgg.js      # Логика пасхалки
├── router/               # Маршрутизация
│   └── index.js          # Конфигурация роутера
├── utils/                # Утилиты
│   └── titleManager.js   # Управление title страниц
├── views/                # Страницы приложения
│   ├── auth/             # Аутентификация
│   │   ├── LoginView.vue
│   │   ├── MentorRegisterView.vue
│   │   ├── ParentRegisterView.vue
│   │   ├── TutorRegisterView.vue
│   │   └── EmailConfirmationView.vue
│   ├── parent/           # Дашборд родителя
│   │   ├── ParentDashboard.vue
│   │   ├── ParentDashboardHome.vue
│   │   ├── ParentCompetenciesSelection.vue
│   │   ├── ParentMyCompetencies.vue
│   │   └── ParentAchievements.vue
│   ├── mentor/           # Дашборд эксперта
│   │   ├── MentorDashboard.vue
│   │   ├── MentorDashboardHome.vue
│   │   ├── MentorParticipants.vue
│   │   ├── MentorMyCertificates.vue
│   │   └── MentorParticipantsCertificates.vue
│   ├── expert/           # Дашборд эксперта
│   │   ├── ExpertDashboard.vue
│   │   ├── ExpertDashboardHome.vue
│   │   ├── ExpertParticipants.vue
│   │   ├── ExpertMyCertificates.vue
│   │   └── ExpertParticipantsCertificates.vue
│   └── tutor/            # Дашборд куратора
│       ├── TutorDashboard.vue
│       ├── TutorDashboardHome.vue
│       ├── TutorExperts.vue
│       ├── TutorDocuments.vue
│       └── TutorVenueInfo.vue
├── App.vue               # Главный компонент
└── main.js              # Точка входа
```

## 🛠 Установка и запуск

### Предварительные требования
- Node.js 16+ 
- npm 8+

### Установка зависимостей
```bash
npm install
```

### Запуск в режиме разработки
```bash
npm run dev
```

### Сборка для продакшена
```bash
npm run build
```

## 🎯 Типы пользователей и маршруты

### 👨‍👩‍👧‍👦 Родители (`/parent`)
- **Главная** - `/parent/dashboard` - обзор компетенций и достижений
- **Выбор компетенций** - `/parent/competencies` - выбор новых компетенций
- **Мои компетенции** - `/parent/my-competencies` - управление текущими компетенциями
- **Достижения** - `/parent/achievements` - просмотр достижений и сертификатов

### 👨‍🏫 Эксперты (`/mentor`)
- **Главная** - `/mentor/dashboard` - статистика участников и быстрые действия
- **Участники** - `/mentor/participants` - управление участниками
- **Мои сертификаты** - `/mentor/my-certificates` - сертификаты эксперта
- **Сертификаты участников** - `/mentor/participants-certificates` - выдача сертификатов

### 🏢 Кураторы (`/tutor`)
- **Главная** - `/tutor/dashboard` - обзор площадки и экспертов
- **Главные эксперты** - `/tutor/experts` - управление главными экспертами
- **Документы** - `/tutor/documents` - загрузка и управление документами
- **Информация о площадке** - `/tutor/venue-info` - редактирование данных площадки

## 🎨 UI Компоненты (PrimeVue)

### Документация PrimeVue
- **Официальная документация**: https://primevue.org/
- **Компоненты**: https://primevue.org/components/
- **Темизация**: https://primevue.org/theming/
- **Иконки**: https://primevue.org/icons/

### Используемые компоненты
```javascript
// Кнопки
import Button from 'primevue/button'

// Формы
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import FileUpload from 'primevue/fileupload'

// Модальные окна
import Dialog from 'primevue/dialog'

// Уведомления
import Toast from 'primevue/toast'

// Директивы
import Tooltip from 'primevue/tooltip'
```

### Настройка PrimeVue
```javascript
// main.js
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'

app.use(PrimeVue, {
  locale: { ru: ruLocale },
  ripple: true,
  inputStyle: 'outlined',
  zIndex: {
    modal: 1100,
    overlay: 1000,
    menu: 1000,
    tooltip: 1100
  }
})

app.directive('tooltip', Tooltip)
```

## 🎨 Стилизация

### CSS архитектура
- **Scoped стили** - каждый компонент имеет свои стили
- **Адаптивный дизайн** - поддержка мобильных устройств
- **CSS Grid/Flexbox** - современная верстка
- **CSS анимации** - плавные переходы и эффекты

### Брейкпоинты
```css
/* Мобильные устройства */
@media (max-width: 768px) { ... }

/* Очень маленькие экраны */
@media (max-width: 480px) { ... }
```

### Цветовая схема
- **Основной цвет**: #ff9800 (оранжевый)
- **Темный оттенок**: #f57c00
- **Текст**: #2c3e50 (темно-серый)
- **Вторичный текст**: #6c757d (серый)
- **Фон**: #ffffff (белый)

## 🎉 Пасхалка

Для Лизы Гривенковой!

**Как активировать**: Напечатайте "gose!" в любом поле ввода

**Что происходит**:
- 🦆 Появляется сообщение "Гусь!"
- ✨ Летят 30 анимированных гусей разных размеров
- 🎵 Воспроизводится мелодия
- 💫 Эффекты свечения и анимации

**Файлы пасхалки**:
- `src/components/GooseConfetti.vue` - компонент конфетти
- `src/mixins/easterEgg.js` - логика отслеживания ввода

## 🔧 Утилиты

### Управление title страниц
```javascript
// src/utils/titleManager.js
import { titleManager } from '@/utils/titleManager.js'

// Установить title
titleManager.setTitle('Название страницы')

// Получить title для страницы
const pageTitle = titleManager.getPageTitle('mentor-dashboard')
```

## 📱 Адаптивность

### Мобильная версия
- **Сайдбар** превращается в выдвижное меню
- **Кнопки** увеличиваются для удобства нажатия
- **Текст** адаптируется под размер экрана
- **Сетки** перестраиваются в одну колонку