<template>
  <div class="board-area">
    <div>
      <div class="zoom in has-ripple" v-on:click="zoomin">
        <md-ink-ripple></md-ink-ripple>
        <i class="material-icons">zoom_in</i>
      </div>
      <div class="zoom out has-ripple" v-on:click="zoomout">
        <md-ink-ripple></md-ink-ripple>
        <i class="material-icons">zoom_out</i>
      </div>
    </div>
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
const diff = 0.2

export default {
  methods: {
    zoomin () {
      this.zoom += diff
    },
    zoomout () {
      if (this.zoom - diff > 0) {
        this.zoom -= diff
      }
    },
    style (width, height) {
      return `width:${width}px;height:${height}px;`
    }
  },
  computed: {
    width () {
      return this.x * gridsize
    },
    height () {
      return this.y * gridsize
    },
    scale () {
      return `scale(${this.zoom})`
    }
  },
  data () {
    return {
      gridsize: gridsize,
      interval: 1,
      x: 16,
      y: 10,
      zoom: 1.0,
      keepAspect: "none",
      pieces: []
    }
  },
  components: {
    Grid,
    Piece
  }
}
</script>

<style lang="scss">
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

.zoom {
  flex: none;
  position: fixed;
  height: 60px;
  width: 60px;
  background: #00bcd4;
  border-radius: 30px;
  cursor: pointer;

  &.in {
    bottom: 6px;
    left: 6px;
  }

  &.out {
    bottom: 6px;
    left: 72px;
  }

  .md-ink-ripple {
    border-radius: 30px;
  }

  i {
    user-select: none;
    display: block;
    width: 36px;
    height: 36px;
    font-size: 36px;
    margin: 12px;
    color: white;
  }
}
</style>
