<template>
  <div class="board-area" :style="style">
    <svg
      id="board"
      :width="width * zoom"
      :height="height * zoom"
      :style="style(width * zoom, height * zoom)" >
      <g :transform="scale">
        <image :width="width" :height="height" :preserveAspectRatio="keepAspect"
          xlink:href="https://nkmr6194.github.io/Umi/assets/img/sample.png"></image>
        <Grid :interval="gridsize * interval" :width="width" :height="height"></Grid>
        <Piece v-for="(piece, id) in pieces" :x="piece.x" :y="piece.y" :size="piece.size" :key="id" :cwidth="width" :cheight="height" :zoom="zoom"></Piece>
      </g>
    </svg>
  </div>
</template>

<script>
import Grid from "./Grid.vue"
import Piece from "./Piece.vue"

const gridsize = 64

export default {
  methods: {
    zoomin() {
      this.zoom += 0.5
    },
    style (width, height) {
      return `width:${width}px;height:${height}px;`
    }
  },
  computed: {
    width: function() {
      return this.x * gridsize
    },
    height: function() {
      return this.y * gridsize
    },
    scale: function() {
      return `scale(${this.zoom})`
    }
  },
  data() {
    return {
      gridsize: gridsize,
      interval: 1,
      x: 16,
      y: 10,
      zoom: 1.0,
      keepAspect: "none",
      pieces: [],
    }
  },
  components: {
    Grid,
    Piece
  }
}
</script>

<style>
.board-area {
  overflow: scroll;
  background-color: #f5f5f5;
}

svg {
  max-width: initial;
  min-width: initial;
  max-height: initial;
  min-height: initial;
  background-color: #fff;
  margin: 64px;
}
</style>
