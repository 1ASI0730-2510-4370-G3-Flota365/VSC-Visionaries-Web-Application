import Vue from 'vue'
import Vuex from 'vuex'
import vehiclesModule from './modules/vehicles'
import driversModule from './modules/drivers'
import fleetsModule from './modules/fleets'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {
      name: 'Juan Supervisor',
      role: 'Administrador'
    },
    loading: false,
    notifications: []
  },
  mutations: {
    SET_LOADING(state, value) {
      state.loading = value
    },
    ADD_NOTIFICATION(state, notification) {
      state.notifications.push(notification)
    },
    REMOVE_NOTIFICATION(state, index) {
      state.notifications.splice(index, 1)
    }
  },
  actions: {
    showNotification({ commit }, { message, type = 'info', duration = 5000 }) {
      const notification = { message, type, id: Date.now() }
      commit('ADD_NOTIFICATION', notification)
      
      if (duration > 0) {
        setTimeout(() => {
          const index = this.state.notifications.findIndex(n => n.id === notification.id)
          if (index !== -1) {
            commit('REMOVE_NOTIFICATION', index)
          }
        }, duration)
      }
    }
  },
  modules: {
    vehicles: vehiclesModule,
    drivers: driversModule,
    fleets: fleetsModule
  }
})