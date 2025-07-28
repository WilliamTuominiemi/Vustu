<script lang="ts">
export default {
  name: 'TimelineEditor',
  emits: ['update:removedParts'],
  props: {
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
  },
  data() {
    return {
      cuts: [] as number[],
      selectedPart: null as number | null,
    };
  },
  methods: {
    addCut() {
      if (this.cuts.includes(this.currentTime)) {
        return;
      }
      this.cuts.push(this.currentTime);
      this.cuts.sort((a, b) => a - b);
    },
    selectPart(cut: number) {
      if (this.selectedPart == cut) {
        this.clearSelectedPart();
        return;
      }
      this.selectedPart = cut;
    },
    clearSelectedPart() {
      this.selectedPart = null;
    },
    removePart() {
      const endPart = this.selectedPart || this.videoLength;
      const startPart = this.cuts.find((cut) => cut < endPart) || 0;
      const updatedRemovedParts = [...this.removedParts, [startPart, endPart]];
      this.$emit('update:removedParts', updatedRemovedParts);
      this.clearSelectedPart();
    },
  },
};
</script>

<template>
  <div class="timeline-editor">
    <template v-for="(cut, index) in cuts.concat([videoLength])" :key="index">
      <div
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
    </template>
    <div
      class="progress-indicator"
      :style="{ left: (currentTime / videoLength) * 100 + '%' }"
    ></div>
  </div>
  <button @click="addCut()">Add Cut</button>
  <button @click="clearSelectedPart()">Clear Selection</button>
  <button @click="removePart()">Delete</button>
</template>

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
</style>
