<script lang="ts">
export default {
  name: 'TimelineEditor',
  props: {
    currentTime: {
      type: Number,
      required: true,
    },
    videoLength: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      cuts: [2.3, 4.1] as number[],
    };
  },
};
</script>

<template>
  <div>timeline</div>
  <div class="timeline-editor">
    <template v-for="(cut, index) in cuts.concat([videoLength])" :key="index">
      <div
        class="timeline-video"
        :style="{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          left: (((index === 0 ? 0 : cuts[index - 1]) + 0.01) / videoLength) * 100 + '%',
          width: ((cut - (index === 0 ? 0 : cuts[index - 1]) - 0.02) / videoLength) * 100 + '%',
        }"
      ></div>
    </template>
    <div
      class="progress-indicator"
      :style="{ left: (currentTime / videoLength) * 100 + '%' }"
    ></div>
  </div>
</template>

<style scoped>
.timeline-editor {
  position: relative;
  border: 1px solid #ccc;
  padding: 2px;
  height: 40px;
  margin-top: 20px;
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
</style>
