// Утилита для управления title страницы
export const titleManager = {
  baseTitle: 'Искатели профессий | Личный кабинет',
  
  // Обновляет title страницы
  setTitle(pageTitle = '') {
    if (pageTitle) {
      document.title = `${pageTitle} | ${this.baseTitle}`
    } else {
      document.title = this.baseTitle
    }
  },
  
  // Получает title для конкретной страницы
  getPageTitle(routeName) {
    const titles = {
      'login': 'Вход в систему',
      'expert-register': 'Регистрация эксперта',
      'parent-register': 'Регистрация родителя',
      'tutor-register': 'Регистрация куратора',
      'email-confirmation': 'Подтверждение email',
      'parent-dashboard': 'Дашборд родителя',
      'parent-competencies': 'Выбор компетенций',
      'parent-my-competencies': 'Мои компетенции',
      'parent-achievements': 'Достижения',
      'expert-dashboard': 'Дашборд эксперта',
      'expert-participants': 'Участники',
      'expert-my-certificates': 'Мои сертификаты',
      'expert-participants-certificates': 'Сертификаты участников',
      'tutor-dashboard': 'Дашборд куратора',
      'tutor-experts': 'Главные эксперты',
      'tutor-documents': 'Документы',
      'tutor-venue-info': 'Информация о площадке'
    }
    
    return titles[routeName] || ''
  }
}
