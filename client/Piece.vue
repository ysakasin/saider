<template>
  <image id="image" xlink:href="https://pbs.twimg.com/profile_images/820665455593459713/Z-_9L16v_400x400.jpg"
    :x="x * 64" :y="y * 64" :width="size * 64" :heigh="size * 64" draggable="true"
    v-on:click.stop=""
    v-on:mousedown="onMouseDown(this.event)"
    v-on:mousemove="onMouseMove(this.event)"
    v-on:mouseup="onMouseUp(this.event)"
    v-on:mouseout="onMouseUp(this.event)"
    />
</template>

<script>
const inRange = (p, min, max) => {
  if (p < min) {
    return min
  } else if (p > max) {
    return max
  } else {
    return p
  }
}

export default {
  props: ["zoom", "cwidth", "cheight", "x", "y", "size"],
  methods: {
    dummy (e) {
      e.stopPropagation()
    },
    onMouseDown (e) {
      this.moving = true
    },
    onMouseMove (e) {
      if (this.moving === true) {
        this.x += e.movementX / this.zoom
        this.y += e.movementY / this.zoom
      }
    },
    onMouseUp (e) {
      if (this.moving === true) {
        this.x = inRange(Math.floor((this.x + 32) / 64) * 64, 0, this.cwidth - 64)
        this.y = inRange(Math.floor((this.y + 32) / 64) * 64, 0, this.cheight - 64)
        this.moving = false
      }
    }
  },
  data () {
    return {
      moving: false
    }
  }
}
</script>
