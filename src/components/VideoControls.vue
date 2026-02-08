<template>
  <div class="controls">
    <div class="playback-controls">
      <div class="playback-buttons">
        <button class="clickable" @click="$emit('play')" title="Play" data-testid="play-button">
          ▶️
        </button>
        <button class="clickable" @click="$emit('pause')" title="Pause" data-testid="pause-button">
          ⏸️
        </button>
        <div style="height: 100%">
          <input
            id="playback-rate"
            data-testid="playback-rate"
            title="Playback rate"
            type="number"
            min="0.25"
            max="8"
            step="0.25"
            v-model="localPlaybackRate"
            @input="$emit('update-playback-rate', localPlaybackRate)"
            style="width: 90px; font-size: inherit"
          />⏲️
        </div>
        <div style="height: 100%">
          <input
            title="Aspect ratio"
            type="number"
            min="0.1"
            max="3.0"
            step="0.01"
            v-model="localAspectRatio"
            @input="updateAspectRatio"
            style="width: 90px; font-size: inherit"
          />📺
        </div>
      </div>
      <div
        v-if="props.videoLength != 0 && localPlaybackRate > 0"
        class="time-display"
        data-testid="time-display"
      >
        <span
          >{{ roundToTwoDecimalPlaces(localSliderTime / localPlaybackRate) }} /
          {{ roundToTwoDecimalPlaces(props.videoLength / localPlaybackRate) }}</span
        >
      </div>
    </div>
    <input
      data-testid="time-slider"
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
import { ref, watch, toRefs } from 'vue';

const props = defineProps<{
  videoLength: number;
  playbackRate: number;
  sliderTime: number;
  aspect: number;
}>();

const emit = defineEmits(['play', 'pause', 'update-playback-rate', 'go-to', 'update-aspect-ratio']);

const { videoLength, playbackRate, sliderTime, aspect } = toRefs(props);

const localPlaybackRate = ref(playbackRate.value);
const localSliderTime = ref(sliderTime.value);

const localAspectRatio = ref(aspect.value);

watch(playbackRate, (newValue) => {
  localPlaybackRate.value = newValue;
});

watch(sliderTime, (newValue) => {
  localSliderTime.value = newValue;
});

watch(aspect, (newValue) => {
  localAspectRatio.value = newValue;
});

function updateAspectRatio() {
  emit('update-aspect-ratio', localAspectRatio.value);
}

function roundToTwoDecimalPlaces(value: number): number {
  return Math.round(value * 10) / 10;
}
</script>

<style>
.controls {
  display: flex;
  flex-direction: column;
}

.playback-controls {
  display: flex;
  justify-content: space-between;
  font-size: 2rem;
}

.playback-buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.time-display {
  display: flex;
  align-items: center;
  font-size: 2rem;
}
</style>
