import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

// Filtros globales
Vue.filter('formatDate', function(value) {
  if (!value) return ''
  const date = new Date(value)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
})

Vue.filter('formatNumber', function(value) {
  if (!value) return '0'
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')