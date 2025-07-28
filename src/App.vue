<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import TimelineEditor from '@/components/Editor/TimelineEditor.vue';

const videoSrc = ref<HTMLVideoElement | null>(null);

const currentTime = ref(0);
const sliderTime = ref(0);
const videoLength = ref(0);
const playbackRate = ref(1);
const removedParts = ref<[number, number][]>([]);

watch(currentTime, (newTime) => {
  for (const [start, end] of removedParts.value) {
    if (newTime >= start && newTime < end) {
      goTo(end);
      break;
    }
  }
});

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

function updateCurrentTime() {
  if (videoSrc.value) {
    currentTime.value = videoSrc.value.currentTime;
    sliderTime.value = videoSrc.value.currentTime;
  }
}

function updateVideoLength() {
  if (videoSrc.value) {
    videoLength.value = videoSrc.value.duration;
  }
}

function updatePlaybackRate(rate: number) {
  if (videoSrc.value) {
    videoSrc.value.playbackRate = rate;
    playbackRate.value = rate;
  }
}

onMounted(() => {
  videoSrc.value?.addEventListener('timeupdate', updateCurrentTime);
  videoSrc.value?.addEventListener('loadedmetadata', updateVideoLength);
  videoSrc.value?.addEventListener('ratechange', () => {
    playbackRate.value = videoSrc.value?.playbackRate || 1;
  });
});

onUnmounted(() => {
  videoSrc.value?.removeEventListener('timeupdate', updateCurrentTime);
  videoSrc.value?.removeEventListener('loadedmetadata', updateVideoLength);
  videoSrc.value?.removeEventListener('ratechange', () => {
    playbackRate.value = videoSrc.value?.playbackRate || 1;
  });
});
</script>

<template>
  <main>
    <video ref="videoSrc">
      <source src="/video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <div>
      <button @click="playVideo()">Play</button>
      <button @click="pauseVideo()">Pause</button>
      <input
        type="number"
        min="0.25"
        step="0.25"
        v-model="playbackRate"
        @input="updatePlaybackRate(playbackRate)"
        style="width: 100px; margin-right: 1rem"
      />
      <input
        type="range"
        min="0"
        step="0.1"
        :max="videoLength"
        v-model="sliderTime"
        @input="goTo(sliderTime)"
        style="width: 100%"
      />
    </div>
    <TimelineEditor
      :currentTime="currentTime"
      :videoLength="videoLength"
      v-model:removedParts="removedParts"
    />
  </main>
</template>

<style scoped></style>
