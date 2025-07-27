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
};
</script>

<template>
  <div>timeline</div>
  <div class="timeline-editor">
    <div
      class="progress-indicator"
      :style="{ left: (currentTime / videoLength) * 100 + '%' }"
    ></div>
    <div class="timeline-video"></div>
  </div>
</template>

<style scoped>
.timeline-editor {
  position: relative;
  border: 1px solid #ccc;
  padding: 3px;
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
  width: 100%;
  height: 100%;
  background-color: #9dc183;
  border-radius: 4px;
}
</style>
