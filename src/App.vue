<template>
  <div id="app">
    <LeftMenu></LeftMenu>
    <BottomMenu></BottomMenu>
    <MapView></MapView>
  </div>
</template>



<script>

import LeftMenu from './components/LeftMenu.vue'
import BottomMenu from './components/BottomMenu.vue'
import MapView from './components/MapView.vue'


export default {

 components : {
    'LeftMenu' : LeftMenu,
    'BottomMenu' : BottomMenu,
    'MapView' : MapView
  }
}
</script>

<style>

</style>
