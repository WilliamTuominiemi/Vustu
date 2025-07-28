<template>
  <div class="controls">
    <div class="playback-controls">
      <div class="clickable" @click="$emit('play')">▶️</div>
      <div class="clickable" @click="$emit('pause')">⏸️</div>
      <div>
        <input
          id="playback-rate"
          type="number"
          min="0.25"
          max="8"
          step="0.25"
          v-model="localPlaybackRate"
          @input="$emit('update-playback-rate', localPlaybackRate)"
          style="width: 90px; font-size: inherit"
        />x
      </div>
    </div>
    <input
      type="range"
      min="0"
      step="0.1"
      :max="videoLength"
      v-model="localSliderTime"
      @input="$emit('go-to', localSliderTime)"
      style="width: 100%"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  videoLength: number;
  playbackRate: number;
  sliderTime: number;
}>();

defineEmits(['play', 'pause', 'update-playback-rate', 'go-to']);

const localPlaybackRate = ref(props.playbackRate);
const localSliderTime = ref(props.sliderTime);

watch(
  () => props.playbackRate,
  (newValue) => {
    localPlaybackRate.value = newValue;
  },
);

watch(
  () => props.sliderTime,
  (newValue) => {
    localSliderTime.value = newValue;
  },
);
</script>

<style>
.controls {
  display: flex;
  flex-direction: column;
}

.playback-controls {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  font-size: 2rem;
}
</style>
