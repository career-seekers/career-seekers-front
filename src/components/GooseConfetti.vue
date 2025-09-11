<template>
  <div v-if="showConfetti" class="confetti-container">
    <div
      v-for="(goose, index) in geese"
      :key="index"
      class="goose-confetti"
      :style="goose.style"
    >
      <img
        src="@/assets/easter-egg/goose.png"
        alt="Goose"
        class="goose-image"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "GooseConfetti",
  data() {
    return {
      showConfetti: false,
      geese: [],
    };
  },
  methods: {
    triggerConfetti() {
      // console.log('Goose confetti triggered!')
      this.showConfetti = true;
      this.createGeese();

      // Скрыть конфетти через 4 секунды
      setTimeout(() => {
        this.showConfetti = false;
        this.geese = [];
      }, 4000);
    },
    createGeese() {
      const gooseCount = 30;
      this.geese = [];

      for (let i = 0; i < gooseCount; i++) {
        const goose = {
          style: {
            left: Math.random() * 100 + "%",
            animationDelay: Math.random() * 2 + "s",
            animationDuration: Math.random() * 2 + 2 + "s",
            transform: `rotate(${Math.random() * 360}deg)`,
            zIndex: Math.floor(Math.random() * 10) + 1,
          },
        };
        this.geese.push(goose);
      }
    },
  },
};
</script>

<style scoped>
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.goose-confetti {
  position: absolute;
  top: -100px;
  animation: fall linear forwards;
}

.goose-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 0 25px rgba(255, 215, 0, 0.8));
  animation: wiggle 0.5s ease-in-out infinite alternate;
}

@keyframes fall {
  0% {
    top: -100px;
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: translateY(50vh) rotate(180deg);
  }
  100% {
    top: 100vh;
    opacity: 0;
    transform: translateY(100vh) rotate(360deg);
  }
}

@keyframes wiggle {
  0% {
    transform: rotate(-5deg);
  }
  100% {
    transform: rotate(5deg);
  }
}

/* Дополнительные эффекты */
.goose-confetti:nth-child(odd) .goose-image {
  animation: wiggle 0.3s ease-in-out infinite alternate;
}

.goose-confetti:nth-child(even) .goose-image {
  animation: wiggle 0.7s ease-in-out infinite alternate;
}

/* Разные размеры гусей */
.goose-confetti:nth-child(3n) .goose-image {
  width: 90px;
  height: 90px;
}

.goose-confetti:nth-child(5n) .goose-image {
  width: 150px;
  height: 150px;
}

/* Разные цвета фильтров */
.goose-confetti:nth-child(2n) .goose-image {
  filter: drop-shadow(0 0 10px rgba(255, 0, 255, 0.8)) hue-rotate(120deg);
}

.goose-confetti:nth-child(3n) .goose-image {
  filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.8)) hue-rotate(240deg);
}

.goose-confetti:nth-child(4n) .goose-image {
  filter: drop-shadow(0 0 10px rgba(255, 165, 0, 0.8)) hue-rotate(60deg);
}
</style>
