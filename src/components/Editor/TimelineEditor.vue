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
  </div>
</template>

<style scoped>
.timeline-editor {
  position: relative;
  border: 1px solid #ccc;
  padding: 10px;
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
}
</style>
