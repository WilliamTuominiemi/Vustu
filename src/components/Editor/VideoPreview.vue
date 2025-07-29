<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineProps, defineEmits } from 'vue';

defineProps<{
  src: string;
}>();

const emit = defineEmits<{
  (e: 'timeupdate', currentTime: number): void;
  (e: 'loadedmetadata', duration: number): void;
  (e: 'ratechange', playbackRate: number): void;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);

function onTimeUpdate() {
  if (videoRef.value) emit('timeupdate', videoRef.value.currentTime);
}
function onLoadedMetadata() {
  if (videoRef.value) emit('loadedmetadata', videoRef.value.duration);
}
function onRateChange() {
  if (videoRef.value) emit('ratechange', videoRef.value.playbackRate);
}

defineExpose({ videoRef });

onMounted(() => {
  videoRef.value?.addEventListener('timeupdate', onTimeUpdate);
  videoRef.value?.addEventListener('loadedmetadata', onLoadedMetadata);
  videoRef.value?.addEventListener('ratechange', onRateChange);
});
onUnmounted(() => {
  videoRef.value?.removeEventListener('timeupdate', onTimeUpdate);
  videoRef.value?.removeEventListener('loadedmetadata', onLoadedMetadata);
  videoRef.value?.removeEventListener('ratechange', onRateChange);
});
</script>

<template>
  <video ref="videoRef">
    <source :src="src" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
</template>
