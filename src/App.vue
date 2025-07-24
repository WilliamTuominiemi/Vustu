<script setup lang="ts">
import { ref } from 'vue';
const videoSrc = ref<HTMLVideoElement | null>(null);

function playVideo() {
  videoSrc.value?.play();
}

function pauseVideo() {
  videoSrc.value?.pause();
}

function goTo(seconds: number) {
  if (videoSrc.value) {
    videoSrc.value.currentTime = seconds;
  }
}
</script>

<template>
  <main>
    <video ref="videoSrc" controls width="600">
      <source src="/video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <div style="margin-top: 1rem">
      <button @click="playVideo()">Play</button>
      <button @click="pauseVideo()">Pause</button>
      <button @click="goTo(2)">Go to 2s</button>
    </div>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
