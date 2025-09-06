<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-container">
          <img src="@/assets/logo.png" alt="Career Seekers Logo" class="logo" />
        </div>
        <h1 class="login-title">Вход в систему</h1>
        <div class="divider"></div>
      </div>
      
      <div class="login-content">
        <form @submit.prevent="handleLogin" class="login-form">
        <div class="field">
          <label for="email" class="field-label">Email</label>
          <InputText
            id="email"
            v-model="loginForm.email"
            type="email"
            placeholder="Введите ваш email"
            class="w-full"
            :class="{ 'p-invalid': errors.email }"
          />
          <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
        </div>

        <div class="field">
          <label for="password" class="field-label">Пароль</label>
          <Password
            id="password"
            v-model="loginForm.password"
            placeholder="Введите пароль"
            class="w-full"
            :class="{ 'p-invalid': errors.password }"
            :feedback="false"
            toggleMask
          />
          <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
        </div>

        <Button
          type="submit"
          label="Войти"
          class="w-full login-button"
          :loading="isLoading"
        />

        <div class="register-section">
          <div class="register-toggle" @click="toggleRegisterOptions">
            <span class="register-text">Зарегистрироваться</span>
            <i class="pi" :class="showRegisterOptions ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
          </div>
          
          <div v-if="showRegisterOptions" class="register-options">
            <router-link to="/register/expert" class="register-option" @click="closeRegisterOptions">
              <div class="option-icon">👨‍🏫</div>
              <div class="option-text">
                <div class="option-title">Наставник</div>
                <div class="option-desc">Для специалистов</div>
              </div>
            </router-link>
            <router-link to="/register/parent" class="register-option" @click="closeRegisterOptions">
              <div class="option-icon">👨‍👩‍👧‍👦</div>
              <div class="option-text">
                <div class="option-title">Родитель</div>
                <div class="option-desc">Для родителей с детьми</div>
              </div>
            </router-link>
            <router-link to="/register/curator" class="register-option" @click="closeRegisterOptions">
              <div class="option-icon">👩‍💼</div>
              <div class="option-text">
                <div class="option-title">Куратор</div>
                <div class="option-desc">Для кураторов</div>
              </div>
            </router-link>
          </div>
        </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import {AuthResolver} from "@/api/resolvers/auth/auth.resolver";
import {v4 as generateUuidV4} from 'uuid'

export default {
  name: 'LoginView',
  components: {
    InputText,
    Password,
    Button
  },
  data() {
    return {
      isLoading: false,
      showRegisterOptions: false,
      loginForm: {
        email: '',
        password: ''
      },
      errors: {
        email: '',
        password: ''
      }
    }
  },
  methods: {
    validateForm() {
      this.errors.email = ''
      this.errors.password = ''

      if (!this.loginForm.email) {
        this.errors.email = 'Email обязателен'
        return false
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.loginForm.email)) {
        this.errors.email = 'Введите корректный email'
        return false
      }

      if (!this.loginForm.password) {
        this.errors.password = 'Пароль обязателен'
        return false
      }

      if (this.loginForm.password.length < 6) {
        this.errors.password = 'Пароль должен содержать минимум 6 символов'
        return false
      }

      return true
    },

    async handleLogin() {
      if (!this.validateForm()) return

      this.isLoading = true
      
      try {
        const authResolver = new AuthResolver()
        const response = await authResolver.login({
          email: this.loginForm.email,
          password: this.loginForm.password,
          uuid: generateUuidV4()
        })

        if (typeof response.message === "string") {
        } else {

        }
        
        // Имитация запроса
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // После успешной авторизации перенаправляем пользователя
        // this.$router.push('/dashboard')
        
      } catch (error) {
        console.error('Ошибка авторизации:', error)
      } finally {
        this.isLoading = false
      }
    },

    toggleRegisterOptions() {
      this.showRegisterOptions = !this.showRegisterOptions
    },

    closeRegisterOptions() {
      this.showRegisterOptions = false
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.8s ease-out 0.2s both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  padding: 2rem 2rem 0 2rem;
  flex-shrink: 0;
  background: white;
  border-radius: 12px 12px 0 0;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e0e0e0 20%, #e0e0e0 80%, transparent 100%);
  margin: 1.5rem 0 0 0;
}

.login-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 2rem 2rem 2rem;
  scrollbar-width: thin;
  scrollbar-color: #ff9800 #f1f1f1;
}

.logo-container {
  margin-bottom: 1.5rem;
}

.logo {
  max-width: 120px;
  height: auto;
  object-fit: contain;
}

.login-title {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 600;
  font-family: 'BIPS', sans-serif;
}

.login-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-top: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: fadeInUp 0.6s ease-out both;
}

.field:nth-child(1) {
  animation-delay: 0.4s;
}

.field:nth-child(2) {
  animation-delay: 0.5s;
}

.field:nth-child(3) {
  animation-delay: 0.6s;
}

.field:nth-child(4) {
  animation-delay: 0.7s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.field-label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.login-button {
  margin-top: 0.5rem;
  height: 3rem;
  font-size: 1rem;
  font-weight: 500;
}

.register-section {
  margin-top: 1.5rem;
}

.register-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  margin-bottom: 1rem;
}

.register-toggle:hover {
  border-color: #ff9800;
  background: #fff8f0;
}

.register-text {
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
}

.register-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  background: white;
}

.register-option:hover {
  border-color: #ff9800;
  background: #fff8f0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.15);
}

.option-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
}

.option-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.option-desc {
  color: #6c757d;
  font-size: 0.8rem;
}

/* Кастомный скроллбар */
.login-content::-webkit-scrollbar {
  width: 8px;
}

.login-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
  margin: 8px 0;
}

.login-content::-webkit-scrollbar-thumb {
  background: #ff9800;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.login-content::-webkit-scrollbar-thumb:hover {
  background: #f57c00;
}

.link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password-input) {
  width: 100%;
}

/* Кнопки на всю ширину на десктопе */
.p-button {
  width: 100%;
  justify-content: center;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-card {
    margin: 0;
    border-radius: 12px;
  }
  
  .login-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }
  
  .login-content {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
  }
  
  .login-title {
    font-size: 1.5rem;
  }
  
  .field {
    margin-bottom: 1.25rem;
  }
  
  .field-label {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }
  
  /* Кнопки на всю ширину */
  .p-button {
    width: 100%;
    justify-content: center;
    padding: 0.875rem 1rem;
    font-size: 1rem;
  }
  
  /* Поля ввода */
  .p-inputtext,
  .p-password-input {
    padding: 0.875rem;
    font-size: 1rem;
  }
  
  /* Регистрационные опции */
  .register-options {
    margin-top: 1rem;
  }
  
  .register-option {
    width: 100%;
    margin-bottom: 0.75rem;
  }
  
  .register-option .p-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
