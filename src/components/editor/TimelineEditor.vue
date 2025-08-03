<template>
  <div class="timeline-editor">
    <template v-for="(part, index) in parts" :key="index">
      <div
        v-if="videoLength != 0"
        class="timeline-video"
        data-testid="video-part"
        :class="{
          selected: selectedPart === part,
          deleted: removedParts.find((deleted) => deleted[0] === part[0] && deleted[1] === part[1]),
        }"
        :style="{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          left: (part[0] / videoLength) * 100 + '%',
          right: 100 - (part[1] / videoLength) * 100 + '%',
          marginRight: '1px',
          marginLeft: '5px',
        }"
        @click="selectPart(part)"
      ></div>
      <div>
        <div
          v-if="videoLength != 0 && part[0] != 0"
          class="cut-indicator"
          data-testid="cut"
          :class="{ hovered: hoveredCut === part[0] }"
          @mouseover="hoveredCut = part[0]"
          @mouseleave="clearHoveredCut()"
          :style="{
            position: 'absolute',
            left: (part[0] / videoLength) * 100 + '%',
            transform: 'translateX(-50%)',
            width: '10px',
            height: '100%',
            zIndex: 10,
          }"
          title="Remove cut"
          @click="removeCut(part[0])"
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
      <button @click="addCut" title="Create cut" data-testid="cut-button">✂️</button>
      <button @click="removePart()" title="Remove part" data-testid="remove-button">🗑️</button>
      <button @click="returnRemovedPart()" title="Return removed part" data-testid="return-button">
        ↩️
      </button>
    </div>
    <div class="management-buttons">
      <button @click="ejectVideo" title="Remove video from timeline" data-testid="eject-button">
        ⏏️
      </button>
      <button
        @click="exportVideo"
        title="Export project"
        data-testid="export-button"
        :class="{ loading: exporting }"
      >
        💾
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  currentTime: {
    type: Number,
    required: true,
  },
  videoLength: {
    type: Number,
    required: true,
  },
  parts: {
    type: Array as () => [number, number][],
    default: () => [],
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

const emit = defineEmits(['update:removedParts', 'changeVideo', 'exportVideo', 'update:parts']);

const cuts = ref<number[]>([]);
const selectedPart = ref<[number, number] | [null, null]>([null, null]);
const hoveredCut = ref<number | null>(null);

function addCut() {
  if (
    cuts.value.includes(props.currentTime) ||
    props.removedParts.some(
      (removedPart) => props.currentTime > removedPart[0] && props.currentTime < removedPart[1],
    )
  ) {
    return;
  }
  cuts.value.push(props.currentTime);
  cuts.value.sort((a, b) => a - b);

  recalculateParts();
}

function recalculateParts() {
  const computedCuts = [0, ...cuts.value, props.videoLength];

  const updatedParts = [];
  for (let i = 0; i < computedCuts.length - 1; i++) {
    updatedParts.push([computedCuts[i], computedCuts[i + 1]]);
  }

  emit('update:parts', updatedParts);
}

function selectPart(part: [number, number]) {
  if (selectedPart.value === part) {
    clearSelectedPart();
    return;
  }
  selectedPart.value = part;
}

function removeCut(cut: number) {
  if (props.removedParts.some((removedPart) => cut == removedPart[0] || cut == removedPart[1])) {
    return;
  }

  cuts.value = cuts.value.filter((c) => c !== cut);

  recalculateParts();
}

function clearSelectedPart() {
  selectedPart.value = [null, null];
}

function clearHoveredCut() {
  hoveredCut.value = null;
}

function removePart() {
  if (selectedPart.value == null) return;
  const updatedRemovedParts = [...props.removedParts, selectedPart.value];
  emit('update:removedParts', updatedRemovedParts);
  clearSelectedPart();
}

function returnRemovedPart() {
  if (selectedPart.value[0] === null || selectedPart.value[1] === null) return;

  const updatedRemovedParts = [...props.removedParts];
  const index = updatedRemovedParts.indexOf(selectedPart.value as [number, number]);
  updatedRemovedParts.splice(index, 1);

  emit('update:removedParts', updatedRemovedParts);

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
  opacity: 0.7;
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
