<template>
  <g>
    <line v-for="x in xs" :x1="x" :x2="x" y1="0" :y2="height" stroke="black" stroke-width="1"/>
    <line v-for="y in ys" x1="0" :x2="width" :y1="y" :y2="y" stroke="black" stroke-width="1"/>
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
  computed: {
    xs: function () {
      return _.range(0, this.width + 1, this.interval)
    },
    ys: function () {
      return _.range(0, this.height + 1, this.interval)
    }
  }
}
</script>
