<template>
  <div class="timeline-editor">
    <template v-for="(cut, index) in cuts.concat([videoLength])" :key="index">
      <div
        v-if="videoLength != 0"
        class="timeline-video"
        :class="{
          selected: selectedPart === cut,
          deleted: removedParts.some((part) => part[1] == cut),
        }"
        :style="{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          left: (((index === 0 ? 0 : cuts[index - 1]) + 0.01) / videoLength) * 100 + '%',
          width: ((cut - (index === 0 ? 0 : cuts[index - 1]) - 0.02) / videoLength) * 100 + '%',
        }"
        @click="selectPart(cut)"
      ></div>
      <div>
        <div
          v-if="videoLength != 0 && index < cuts.length"
          class="cut-indicator"
          :class="{ hovered: hoveredCut === cut }"
          @mouseover="hoveredCut = cut"
          @mouseleave="clearHoveredCut()"
          :style="{
            position: 'absolute',
            left: (cut / videoLength) * 100 + '%',
            transform: 'translateX(-50%)',
            width: '10px',
            height: '100%',
            zIndex: 10,
          }"
          title="Remove cut"
          @click="removeCut(cut)"
        ></div>
      </div>
    </template>
    <div
      class="progress-indicator"
      :style="{ left: (currentTime / videoLength) * 100 + '%' }"
    ></div>
  </div>
  <div class="buttons">
    <div class="editing-buttons">
      <button @click="addCut()" title="Create cut">✂️</button>
      <button @click="removePart()" title="Remove part">🗑️</button>
      <button @click="returnRemovedPart()" title="Return removed part">↩️</button>
    </div>
    <div class="management-buttons">
      <button @click="ejectVideo" title="Remove video from timeline">⏏️</button>
      <button @click="exportVideo" title="Export project" :class="{ loading: exporting }">
        💾
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  currentTime: {
    type: Number,
    required: true,
  },
  videoLength: {
    type: Number,
    required: true,
  },
  removedParts: {
    type: Array as () => [number, number][],
    default: () => [],
  },
  exporting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:removedParts', 'changeVideo', 'exportVideo']);

const cuts = ref<number[]>([]);
const selectedPart = ref<number | null>(null);
const hoveredCut = ref<number | null>(null);

function addCut() {
  if (cuts.value.includes(props.currentTime)) {
    return;
  }
  cuts.value.push(props.currentTime);
  cuts.value.sort((a, b) => a - b);
}

function selectPart(cut: number) {
  if (selectedPart.value === cut) {
    clearSelectedPart();
    return;
  }
  selectedPart.value = cut;
}

function removeCut(cut: number) {
  cuts.value = cuts.value.filter((c) => c !== cut);
}

function clearSelectedPart() {
  selectedPart.value = null;
}

function clearHoveredCut() {
  hoveredCut.value = null;
}

function removePart() {
  if (selectedPart.value == null) return;
  const endPart = selectedPart.value || props.videoLength;
  const startPart =
    endPart === props.videoLength
      ? cuts.value[cuts.value.length - 1]
      : cuts.value.find((cut) => cut < endPart) || 0;
  const updatedRemovedParts = [...props.removedParts, [startPart, endPart]];
  emit('update:removedParts', updatedRemovedParts);
  clearSelectedPart();
}

function returnRemovedPart() {
  if (selectedPart.value == null) return;
  const endPart = selectedPart.value || props.videoLength;
  const startPart =
    endPart === props.videoLength
      ? cuts.value[cuts.value.length - 1]
      : cuts.value.find((cut) => cut < endPart) || 0;
  const partIndex = props.removedParts.findIndex(
    (part) => part[0] === startPart && part[1] === endPart,
  );
  if (partIndex !== -1) {
    const updatedRemovedParts = [...props.removedParts];
    updatedRemovedParts.splice(partIndex, 1);
    emit('update:removedParts', updatedRemovedParts);
  }
  clearSelectedPart();
}

function ejectVideo() {
  emit('changeVideo');
  clearSelectedPart();
  cuts.value = [];
}

function exportVideo() {
  emit('exportVideo');
}
</script>

<style scoped>
.timeline-editor {
  position: relative;
  border: 1px solid #ccc;
  padding: 2px;
  height: 40px;
  margin-top: 5px;
  margin-bottom: 5px;
  background-color: #ede8d0;
}

.progress-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #be5103;
  transition: left 0.1s linear;
  border-radius: 2px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  z-index: 20;
}

.timeline-video {
  height: 30px;
  background-color: #9dc183;
  border-radius: 4px;
}

.selected {
  background-color: #285a35;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.deleted {
  background-color: #d9534f;
  opacity: 0.2;
}

.selected.deleted {
  opacity: 0.7 !important;
}

.cut-indicator {
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 5px;
}

.hovered {
  background-color: #ff746c;
}

.buttons {
  display: flex;
  justify-content: space-between;
}

.editing-buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.management-buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
}
</style>
