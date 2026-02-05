<template>
  <div class="videoWrapper">
    <video
      v-if="localSrc"
      ref="videoRef"
      :key="localSrc"
      data-testid="video"
      :style="{
        width: localDimension?.width + 'px',
        height: localDimension?.height + 'px',
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'fill',
      }"
    >
      <source :src="localSrc" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <div v-else class="videoUpload">
      <img src="/logo.png" alt="logo" width="75" height="75" />
      <label for="video-upload" class="videoInput clickable">
        Choose a video file
        <input
          type="file"
          id="video-upload"
          data-testid="video-upload"
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
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { Dimension } from '../utils/types';

const props = defineProps<{
  src: string;
  dimension: Dimension | undefined;
}>();

const emit = defineEmits<{
  (e: 'timeupdate', currentTime: number): void;
  (e: 'loadedmetadata', duration: number): void;
  (e: 'ratechange', playbackRate: number): void;
  (e: 'dimensionchange', dimension: Dimension): void;
  (e: 'update:src', src: string): void;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const localSrc = ref(props.src);
const localDimension = ref(props.dimension);

watch(
  () => props.src,
  (newSrc) => {
    localSrc.value = newSrc;
  },
);
watch(
  () => props.dimension,
  (dimension) => {
    localDimension.value = dimension;
  },
);

watch(videoRef, (newVideo, oldVideo) => {
  if (oldVideo) {
    oldVideo.removeEventListener('timeupdate', onTimeUpdate);
    oldVideo.removeEventListener('loadedmetadata', onLoadedMetadata);
    oldVideo.removeEventListener('ratechange', onRateChange);
    oldVideo.removeEventListener('dimensionchange', onDimensionChange);
  }
  if (newVideo) {
    newVideo.addEventListener('timeupdate', onTimeUpdate);
    newVideo.addEventListener('loadedmetadata', onLoadedMetadata);
    newVideo.addEventListener('ratechange', onRateChange);
    newVideo.addEventListener('dimensionchange', onDimensionChange);
  }
});

function onTimeUpdate() {
  if (videoRef.value) emit('timeupdate', videoRef.value.currentTime);
}
function onLoadedMetadata() {
  if (videoRef.value) emit('loadedmetadata', videoRef.value.duration);
  onDimensionChange();
}
function onRateChange() {
  if (videoRef.value) emit('ratechange', videoRef.value.playbackRate);
}
function onDimensionChange() {
  if (videoRef.value) {
    const dimension: Dimension = {
      width: videoRef.value.videoWidth,
      height: videoRef.value.videoHeight,
    };
    emit('dimensionchange', dimension);
  }
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
    videoRef.value.removeEventListener('dimensionchange', onDimensionChange);
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
