<template>
  <g>
    <g v-for="y in ylabels" >
      <text class="grid-label" v-for="x in xlabels" :x="x + interval / 2" :y="y + interval / 2 + 4" text-anchor="middle" >
        {{ label(x, interval) }}-{{ label(y, interval) }}
      </text>
    </g>
  </g>
</template>

<script>
import _ from "lodash"

export default {
  props: {
    interval: Number,
    width: Number,
    height: Number
  },
  methods: {
    label (n, step) {
      return n / step + 1
    }
  },
  computed: {
    xlabels () {
      return _.range(0, this.width, this.interval)
    },
    ylabels () {
      return _.range(0, this.height, this.interval)
    }
  }
}
</script>

<style>
.grid-label {
  cursor: default;
  user-select: none;
}
</style>
