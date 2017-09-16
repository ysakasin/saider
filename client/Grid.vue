<template>
  <g>
     <GridLines :interval="interval" :width="width" :height="height" />
     <GridLabels :interval="interval" :width="width" :height="height" />
  </g>
</template>

<script>
import GridLines from "./GridLines.vue"
import GridLabels from "./GridLabels.vue"

export default {
  props: {
    interval: Number,
    width: Number,
    height: Number
  },
  components: {
    GridLines,
    GridLabels
  }
}
</script>
