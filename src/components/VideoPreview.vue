<template>
  <div ref="videoWrapper" class="videoWrapper">
    <video v-if="localSrc" ref="videoRef" :key="localSrc" data-testid="video" :style="videoStyle">
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
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';

const props = defineProps<{
  src: string;
  aspect: number;
}>();

const emit = defineEmits<{
  (e: 'timeupdate', currentTime: number): void;
  (e: 'loadedmetadata', duration: number, fileName: string): void;
  (e: 'ratechange', playbackRate: number): void;
  (e: 'aspectchange', aspectRatio: number): void;
  (e: 'update:src', src: string): void;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const videoWrapper = ref<HTMLDivElement | null>(null);
const localSrc = ref(props.src);
const localAspectRatio = ref(props.aspect);
const fileName = ref('');

watch(
  () => props.src,
  (newSrc) => {
    localSrc.value = newSrc;
  },
);
watch(
  () => props.aspect,
  (aspect) => {
    localAspectRatio.value = aspect;
  },
);

watch(videoRef, (newVideo, oldVideo) => {
  if (oldVideo) {
    oldVideo.removeEventListener('timeupdate', onTimeUpdate);
    oldVideo.removeEventListener('loadedmetadata', onLoadedMetadata);
    oldVideo.removeEventListener('ratechange', onRateChange);
    oldVideo.removeEventListener('aspectchange', onDimensionChange);
  }
  if (newVideo) {
    newVideo.addEventListener('timeupdate', onTimeUpdate);
    newVideo.addEventListener('loadedmetadata', onLoadedMetadata);
    newVideo.addEventListener('ratechange', onRateChange);
    newVideo.addEventListener('aspectchange', onDimensionChange);
  }
});

function onTimeUpdate() {
  if (videoRef.value) emit('timeupdate', videoRef.value.currentTime);
}
function onLoadedMetadata() {
  if (videoRef.value) emit('loadedmetadata', videoRef.value.duration, fileName.value);
  onDimensionChange();
}
function onRateChange() {
  if (videoRef.value) emit('ratechange', videoRef.value.playbackRate);
}
function onDimensionChange() {
  if (videoRef.value) {
    const aspectRatio =
      Math.round((videoRef.value.videoWidth / videoRef.value.videoHeight) * 100) / 100;
    emit('aspectchange', aspectRatio);
  }
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const url = URL.createObjectURL(file);
    localSrc.value = url;
    fileName.value = file.name.replace(/\.[^/.]+$/, '');
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
    videoRef.value.removeEventListener('aspectchange', onDimensionChange);
  }
});

const videoStyle = computed(() => {
  if (!videoWrapper.value || !localAspectRatio.value) {
    return {
      width: '100%',
      height: '100%',
      objectFit: 'fill' as const,
    };
  }

  const containerWidth = videoWrapper.value.clientWidth;
  const containerHeight = videoWrapper.value.clientHeight;

  let width = containerWidth;
  let height = width / localAspectRatio.value;

  if (height > containerHeight) {
    height = containerHeight;
    width = height * localAspectRatio.value;
  }

  return {
    width: `${width}px`,
    height: `${height}px`,
    objectFit: 'fill' as const,
  };
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
  background-color: #94988c;
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
