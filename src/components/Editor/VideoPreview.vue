<template>
  <div class="videoWrapper">
    <video v-if="localSrc" ref="videoRef" :key="localSrc">
      <source :src="localSrc" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <div v-else class="videoUpload">
      <label for="video-upload" class="videoInput clickable">
        Choose a video file
        <input
          type="file"
          id="video-upload"
          name="video-upload"
          accept="video/mp4,video/webm,video/ogg,image/gif"
          @change="onFileChange"
          style="display: none"
        />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineProps, defineEmits, watch } from 'vue';

const props = defineProps<{
  src: string;
}>();

const emit = defineEmits<{
  (e: 'timeupdate', currentTime: number): void;
  (e: 'loadedmetadata', duration: number): void;
  (e: 'ratechange', playbackRate: number): void;
  (e: 'update:src', src: string): void;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const localSrc = ref(props.src);

watch(
  () => props.src,
  (newSrc) => {
    localSrc.value = newSrc;
  },
);

watch(videoRef, (newVideo, oldVideo) => {
  if (oldVideo) {
    oldVideo.removeEventListener('timeupdate', onTimeUpdate);
    oldVideo.removeEventListener('loadedmetadata', onLoadedMetadata);
    oldVideo.removeEventListener('ratechange', onRateChange);
  }
  if (newVideo) {
    newVideo.addEventListener('timeupdate', onTimeUpdate);
    newVideo.addEventListener('loadedmetadata', onLoadedMetadata);
    newVideo.addEventListener('ratechange', onRateChange);
  }
});

function onTimeUpdate() {
  if (videoRef.value) emit('timeupdate', videoRef.value.currentTime);
}
function onLoadedMetadata() {
  if (videoRef.value) emit('loadedmetadata', videoRef.value.duration);
}
function onRateChange() {
  if (videoRef.value) emit('ratechange', videoRef.value.playbackRate);
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const url = URL.createObjectURL(file);
    localSrc.value = url;
    emit('update:src', url);
  }
}

defineExpose({ videoRef });

onMounted(() => {});
onUnmounted(() => {
  if (videoRef.value) {
    videoRef.value.removeEventListener('timeupdate', onTimeUpdate);
    videoRef.value.removeEventListener('loadedmetadata', onLoadedMetadata);
    videoRef.value.removeEventListener('ratechange', onRateChange);
  }
});
</script>

<style scoped>
.videoWrapper {
  border: 1px solid black;
  margin: 5px;
  border-radius: 10px;
  aspect-ratio: 14 / 8;
  width: 60vw;
  max-width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.videoUpload {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.videoInput {
  cursor: pointer;
  display: inline-block;
  padding: 6px 12px;
  background: #ede8d0;
  border: 1px solid #ccc;
}
</style>
