import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";
import ConfirmationService from "primevue/confirmationservice";
import "primevue/resources/themes/lara-light-amber/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "@/assets/fonts/fonts.css";
import { createPinia } from 'pinia';

const pinia = createPinia()
const app = createApp(App);

// Русская локаль для PrimeVue
const ruLocale = {
  firstDayOfWeek: 1,
  dayNames: [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ],
  dayNamesShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  monthNames: [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ],
  monthNamesShort: [
    "Янв",
    "Фев",
    "Мар",
    "Апр",
    "Май",
    "Июн",
    "Июл",
    "Авг",
    "Сен",
    "Окт",
    "Ноя",
    "Дек",
  ],
  today: "Сегодня",
  clear: "Очистить",
  weekHeader: "Нед",
  dateFormat: "dd.mm.yy",
  weak: "Слабый",
  medium: "Средний",
  strong: "Надежный",
  passwordPrompt: "Введите пароль",
};

app.use(pinia)
app.use(router);
app.use(ConfirmationService);
app.use(PrimeVue, {
  locale: {
    ru: ruLocale,
  },
  ripple: true,
  inputStyle: "outlined",
  zIndex: {
    modal: 1100,
    overlay: 1000,
    menu: 1000,
    tooltip: 1100,
  },
});

// Регистрируем глобальную директиву tooltip
app.directive("tooltip", Tooltip);

// Устанавливаем глобальную локаль
app.config.globalProperties.$primevue = {
  config: {
    locale: ruLocale,
    ripple: true,
    inputStyle: "outlined",
    zIndex: {
      modal: 1100,
      overlay: 1000,
      menu: 1000,
      tooltip: 1100,
    },
  },
};

app.mount("#app");
