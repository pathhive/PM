<template>
  <div>
    <div>bottom menu</div>
    <!--input type="text" v-model="searchMap" placeholder="not used" v-on:keyup.enter="doSearch"-->
    <!--button v-on:click="doSearch">Search</button-->
    <button v-on:click="onCurrentPos">Current Pos</button>
    <button v-on:click="onSimulate">Simulation</button>
    <hr>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchMap: ''
    }
  },

  methods:{
    doSearch() {
      if(this.searchMap != ""){
        var keyword = this.searchMap.trim();
        console.log('search : ' + this.searchMap);
      }
      else {
        this.errorMsg('need keyword');
      }
    },

    onCurrentPos() {
      this.$EventBus.$emit('onCurrentPos', 'data');
    },

    onSimulate() {
      this.$EventBus.$emit('onSimulate', 'data');
    },

    errorMsg(msg) {
      alert(msg);
    }
  }
}
</script>

<style>
  body {
    background-color: #F6F6F8;
  }

  input{
    border-style: groove;
    width:200px;
  }
</style>
