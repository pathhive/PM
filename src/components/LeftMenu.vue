<template>
  <div>
    <div>left menu</div>
    <button v-on:click="onUserInfo">User Info</button>
    <button v-on:click="onPreferences">Preferences</button>
    <button v-on:click="onNewPath">+</button>
    <button v-on:click="onTest">Test</button>
    <button v-on:click="onPHVtoENG">PHV > ENG</button>
    <button v-on:click="onENGtoPHV">ENG > PHV</button>
    <hr>
  </div>
</template>

<script>
export default {

  methods : {
    onUserInfo(){
      alert('user info button clicked');
    },

    onPreferences(){
      alert('Preferences button clicked');
    },

    onNewPath(){
      //alert('new path button clicked');
      this.$EventBus.$emit('onAddNewPath', 'data');
    },

    onTest(){
      this.$EventBus.$emit('onTest', 'data');
    },

    onPHVtoENG(){
      alert('PHV to ENG button clicked');
    },

    onENGtoPHV(){
      alert('ENG to PHV button clicked');
    }
  }
}
</script>

<style>


button{
  border-style: groove;
}


</style>
