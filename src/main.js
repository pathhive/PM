// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App.vue'


var eventBus = new Vue();

Vue.prototype.$EventBus = new Vue();

new Vue({
  el: '#app',
  render: h => h(App)
})

