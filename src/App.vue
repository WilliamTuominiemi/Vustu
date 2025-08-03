<template>
  <main>
    <VideoPreview
      ref="videoPreviewRef"
      v-model:src="videoSrc"
      @timeupdate="updateCurrentTime"
      @loadedmetadata="updateVideoLength"
      @ratechange="handleRateChange"
    />

    <div class="interface">
      <VideoControls
        :videoLength="videoLength"
        :playbackRate="playbackRate"
        :sliderTime="sliderTime"
        @play="playVideo"
        @pause="pauseVideo"
        @update-playback-rate="updatePlaybackRate"
        @go-to="goTo"
      />

      <TimelineEditor
        :currentTime="currentTime"
        :videoLength="videoLength"
        :exporting="exporting"
        @changeVideo="changeVideo"
        @exportVideo="exportVideo"
        v-model:removedParts="removedParts"
        v-model:parts="parts"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import TimelineEditor from '@/components/editor/TimelineEditor.vue';
import VideoControls from '@/components/editor/VideoControls.vue';
import VideoPreview from '@/components/editor/VideoPreview.vue';
import { renderer as Renderer } from '@/utils/Renderer';

const videoPreviewRef = ref<{ videoRef: HTMLVideoElement | null } | null>(null);

const videoSrc = ref('');

const currentTime = ref(0);
const sliderTime = ref(0);
const videoLength = ref(0);
const playbackRate = ref(1);
const removedParts = ref<[number, number][]>([]);
const parts = ref<[number, number][]>([]);

const exporting = ref(false);

function getVideoEl() {
  return videoPreviewRef.value?.videoRef ?? null;
}

watch(currentTime, (newTime) => {
  const video = getVideoEl();
  if (video && !video.paused) {
    for (const [start, end] of removedParts.value) {
      if (newTime >= start && newTime < end) {
        goTo(end);
        break;
      }
    }
  }
});

function playVideo() {
  getVideoEl()?.play();
}

function pauseVideo() {
  getVideoEl()?.pause();
}

function goTo(seconds: number) {
  const video = getVideoEl();
  if (video) {
    video.currentTime = seconds;
  }
}

function updateCurrentTime(time: number) {
  currentTime.value = time;
  sliderTime.value = time;
}

function updateVideoLength(length: number) {
  videoLength.value = length;
  parts.value = [[0, videoLength.value]];
}

function updatePlaybackRate(rate: number) {
  const video = getVideoEl();
  if (video) {
    video.playbackRate = rate;
    playbackRate.value = rate;
  }
}

function handleRateChange(rate: number) {
  playbackRate.value = rate;
}

function changeVideo() {
  videoSrc.value = '';
  if (videoPreviewRef.value) {
    videoPreviewRef.value.videoRef?.pause();
    videoPreviewRef.value.videoRef = null;
    updateCurrentTime(0);
    updateVideoLength(0);
  }
}

function exportVideo() {
  if (videoSrc.value) {
    exporting.value = true;
    Renderer.exportProject(videoSrc.value, removedParts.value, playbackRate.value)
      .then(() => {
        exporting.value = false;
      })
      .catch((error) => {
        exporting.value = false;
        throw new Error(`Export failed: ${error.message}`);
      });
  }
}
</script>

<style scoped>
.interface {
  border: 1px solid black;
  border-radius: 10px;
  margin: 5px;
  padding: 10px;
}
</style>
