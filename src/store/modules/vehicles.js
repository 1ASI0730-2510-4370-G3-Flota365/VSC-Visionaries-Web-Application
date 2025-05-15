import vehiclesData from '@/data/vehicles.json'

export default {
  namespaced: true,
  state: {
    vehicles: [],
    loaded: false
  },
  getters: {
    allVehicles: state => state.vehicles,
    activeVehicles: state => state.vehicles.filter(v => v.status === 'active'),
    inactiveVehicles: state => state.vehicles.filter(v => v.status === 'inactive'),
    vehicleCount: state => state.vehicles.length
  },
  mutations: {
    SET_VEHICLES(state, vehicles) {
      state.vehicles = vehicles
      state.loaded = true
    },
    ADD_VEHICLE(state, vehicle) {
      state.vehicles.push(vehicle)
    },
    UPDATE_VEHICLE(state, updatedVehicle) {
      const index = state.vehicles.findIndex(v => v.id === updatedVehicle.id)
      if (index !== -1) {
        state.vehicles.splice(index, 1, updatedVehicle)
      }
    },
    DELETE_VEHICLE(state, id) {
      state.vehicles = state.vehicles.filter(v => v.id !== id)
    }
  },
  actions: {
    fetchVehicles({ commit, state }) {
      if (!state.loaded) {
        // Simular llamada a API
        commit('SET_LOADING', true, { root: true })
        setTimeout(() => {
          commit('SET_VEHICLES', vehiclesData)
          commit('SET_LOADING', false, { root: true })
        }, 500)
      }
    },
    addVehicle({ commit }, vehicle) {
      // Simular llamada a API
      commit('SET_LOADING', true, { root: true })
      
      return new Promise((resolve) => {
        setTimeout(() => {
          const newId = Math.max(...vehiclesData.map(v => v.id)) + 1
          const newVehicle = { ...vehicle, id: newId }
          
          commit('ADD_VEHICLE', newVehicle)
          commit('SET_LOADING', false, { root: true })
          resolve(newVehicle)
        }, 500)
      })
    },
    updateVehicle({ commit }, vehicle) {
      // Simular llamada a API
      commit('SET_LOADING', true, { root: true })
      
      return new Promise((resolve) => {
        setTimeout(() => {
          commit('UPDATE_VEHICLE', vehicle)
          commit('SET_LOADING', false, { root: true })
          resolve(vehicle)
        }, 500)
      })
    },
    deleteVehicle({ commit }, id) {
      // Simular llamada a API
      commit('SET_LOADING', true, { root: true })
      
      return new Promise((resolve) => {
        setTimeout(() => {
          commit('DELETE_VEHICLE', id)
          commit('SET_LOADING', false, { root: true })
          resolve(true)
        }, 500)
      })
    }
  }
}