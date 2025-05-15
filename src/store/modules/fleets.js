import { fleetService } from '@/services/api'

export default {
  namespaced: true,
  state: {
    fleets: [],
    selectedFleet: null,
    fleetVehicles: [],
    loaded: false
  },
  getters: {
    allFleets: state => state.fleets,
    activeFleets: state => state.fleets.filter(f => f.status === 'active'),
    fleetCount: state => state.fleets.length,
    totalVehicles: state => state.fleets.reduce((total, fleet) => total + fleet.vehicleCount, 0)
  },
  mutations: {
    SET_FLEETS(state, fleets) {
      state.fleets = fleets
      state.loaded = true
    },
    SET_SELECTED_FLEET(state, fleet) {
      state.selectedFleet = fleet
    },
    SET_FLEET_VEHICLES(state, vehicles) {
      state.fleetVehicles = vehicles
    },
    ADD_FLEET(state, fleet) {
      state.fleets.push(fleet)
    },
    UPDATE_FLEET(state, updatedFleet) {
      const index = state.fleets.findIndex(f => f.id === updatedFleet.id)
      if (index !== -1) {
        state.fleets.splice(index, 1, updatedFleet)
      }
    },
    DELETE_FLEET(state, id) {
      state.fleets = state.fleets.filter(f => f.id !== id)
    }
  },
  actions: {
    async fetchFleets({ commit, state }) {
      if (!state.loaded) {
        try {
          commit('SET_LOADING', true, { root: true })
          const response = await fleetService.getAll()
          commit('SET_FLEETS', response.data)
          return response.data
        } catch (error) {
          console.error('Error fetching fleets:', error)
          commit('showNotification', {
            message: 'Error al obtener flotas',
            type: 'error'
          }, { root: true })
          throw error
        } finally {
          commit('SET_LOADING', false, { root: true })
        }
      }
      return state.fleets
    },
    async fetchFleet({ commit }, id) {
      try {
        commit('SET_LOADING', true, { root: true })
        const response = await fleetService.getById(id)
        commit('SET_SELECTED_FLEET', response.data)
        return response.data
      } catch (error) {
        console.error(`Error fetching fleet ${id}:`, error)
        commit('showNotification', {
          message: 'Error al obtener detalles de la flota',
          type: 'error'
        }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async fetchFleetVehicles({ commit }, id) {
      try {
        commit('SET_LOADING', true, { root: true })
        const response = await fleetService.getVehicles(id)
        commit('SET_FLEET_VEHICLES', response.data)
        return response.data
      } catch (error) {
        console.error(`Error fetching fleet vehicles for fleet ${id}:`, error)
        commit('showNotification', {
          message: 'Error al obtener vehículos de la flota',
          type: 'error'
        }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async createFleet({ commit }, fleetData) {
      try {
        commit('SET_LOADING', true, { root: true })
        const response = await fleetService.create(fleetData)
        commit('ADD_FLEET', response.data)
        commit('showNotification', {
          message: 'Flota creada correctamente',
          type: 'success'
        }, { root: true })
        return response.data
      } catch (error) {
        console.error('Error creating fleet:', error)
        commit('showNotification', {
          message: 'Error al crear flota',
          type: 'error'
        }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async updateFleet({ commit }, fleetData) {
      try {
        commit('SET_LOADING', true, { root: true })
        const response = await fleetService.update(fleetData.id, fleetData)
        commit('UPDATE_FLEET', response.data)
        commit('showNotification', {
          message: 'Flota actualizada correctamente',
          type: 'success'
        }, { root: true })
        return response.data
      } catch (error) {
        console.error(`Error updating fleet ${fleetData.id}:`, error)
        commit('showNotification', {
          message: 'Error al actualizar flota',
          type: 'error'
        }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async deleteFleet({ commit }, id) {
      try {
        commit('SET_LOADING', true, { root: true })
        await fleetService.delete(id)
        commit('DELETE_FLEET', id)
        commit('showNotification', {
          message: 'Flota eliminada correctamente',
          type: 'success'
        }, { root: true })
        return { success: true }
      } catch (error) {
        console.error(`Error deleting fleet ${id}:`, error)
        commit('showNotification', {
          message: 'Error al eliminar flota',
          type: 'error'
        }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async assignVehiclesToFleet({ commit }, { fleetId, vehicleIds }) {
      try {
        commit('SET_LOADING', true, { root: true })
        const response = await fleetService.assignVehicles(fleetId, vehicleIds)
        
        // Actualizar la flota después de la asignación
        const updatedFleet = await fleetService.getById(fleetId)
        commit('UPDATE_FLEET', updatedFleet.data)
        
        commit('showNotification', {
          message: `${response.data.count} vehículos asignados correctamente`,
          type: 'success'
        }, { root: true })
        
        return response.data
      } catch (error) {
        console.error(`Error assigning vehicles to fleet ${fleetId}:`, error)
        commit('showNotification', {
          message: 'Error al asignar vehículos a la flota',
          type: 'error'
        }, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    }
  }
}