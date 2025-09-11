export default {
  data() {
    return {
      easterEggBuffer: "",
      easterEggTrigger: "gose!",
      easterEggTimeout: null,
    };
  },
  mounted() {
    this.setupEasterEggListener();
  },
  beforeUnmount() {
    this.removeEasterEggListener();
  },
  methods: {
    setupEasterEggListener() {
      document.addEventListener("keydown", this.handleEasterEggInput);
    },
    removeEasterEggListener() {
      document.removeEventListener("keydown", this.handleEasterEggInput);
    },
    handleEasterEggInput(event) {
      // Игнорируем служебные клавиши
      if (
        event.key === "Shift" ||
        event.key === "Control" ||
        event.key === "Alt" ||
        event.key === "Meta"
      ) {
        return;
      }

      // Добавляем отладочную информацию (можно убрать в продакшене)
      // console.log('Key pressed:', event.key, 'Buffer:', this.easterEggBuffer)

      // Очищаем буфер через 2 секунды без активности
      if (this.easterEggTimeout) {
        clearTimeout(this.easterEggTimeout);
      }

      this.easterEggTimeout = setTimeout(() => {
        this.easterEggBuffer = "";
      }, 2000);

      // Добавляем символ в буфер (приводим к нижнему регистру)
      const key = event.key.toLowerCase();
      this.easterEggBuffer += key;

      // Проверяем, содержит ли буфер триггер
      if (this.easterEggBuffer.includes(this.easterEggTrigger)) {
        // console.log('Easter egg triggered!')
        this.triggerEasterEgg();
        this.easterEggBuffer = ""; // Сбрасываем буфер
      }

      // Ограничиваем размер буфера
      if (this.easterEggBuffer.length > 20) {
        this.easterEggBuffer = this.easterEggBuffer.slice(-10);
      }
    },
    triggerEasterEgg() {
      // Эмитим событие для компонента конфетти через window
      window.dispatchEvent(new CustomEvent("trigger-goose-confetti"));

      // Дополнительные эффекты
      this.showEasterEggMessage();
      this.playEasterEggSound();
    },
    showEasterEggMessage() {
      // Создаем временное уведомление
      const message = document.createElement("div");
      message.innerHTML = "🦆 Гусь! 🦆";
      message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
        color: white;
        padding: 20px 40px;
        border-radius: 20px;
        font-size: 2rem;
        font-weight: bold;
        z-index: 10000;
        animation: easterEggBounce 2s ease-out forwards;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      `;

      // Добавляем CSS анимацию
      const style = document.createElement("style");
      style.textContent = `
        @keyframes easterEggBounce {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          40% { transform: translate(-50%, -50%) scale(0.9); }
          60% { transform: translate(-50%, -50%) scale(1.1); }
          80% { transform: translate(-50%, -50%) scale(0.95); }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
      `;
      document.head.appendChild(style);

      document.body.appendChild(message);

      // Удаляем сообщение через 2 секунды
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 2000);
    },
    playEasterEggSound() {
      // Создаем звуковой эффект с помощью Web Audio API
      try {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();

        // Создаем мелодию "GOSE!"
        const notes = [523.25, 659.25, 783.99, 659.25]; // C5, E5, G5, E5
        const duration = 0.2;

        notes.forEach((frequency, index) => {
          setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(
              frequency,
              audioContext.currentTime,
            );
            oscillator.type = "sine";

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
              0.01,
              audioContext.currentTime + duration,
            );

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
          }, index * 100);
        });
      } catch (error) {
        console.log("Audio not supported:", error);
      }
    },
  },
};
