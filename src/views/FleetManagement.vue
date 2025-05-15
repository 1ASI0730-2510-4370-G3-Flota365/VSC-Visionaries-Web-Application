<template>
  <div>
    <Header title="Gestión de Flota" />

    <!-- Resumen de flotas -->
    <div class="dashboard-grid" style="margin-bottom: 1.875rem;">
      <!-- Resumen general -->
      <div class="stats-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div class="stats-label">Total de Flotas</div>
            <div class="stats-value">{{ fleets.length }}</div>
            <div style="font-size: 0.875rem; color: #666;">
              {{ totalVehicles }} vehículos en total
            </div>
          </div>
          <div class="stats-icon">
            <i class="fas fa-truck-moving"></i>
          </div>
        </div>
      </div>

      <!-- Tarjetas para cada flota -->
      <div class="stats-card" v-for="fleet in fleets" :key="fleet.id">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div class="stats-label">{{ fleet.name }}</div>
            <div class="stats-value">{{ fleet.vehicleCount }}</div>
            <div :style="{ fontSize: '0.875rem', color: fleet.performance >= 90 ? 'var(--color-success)' : 'var(--color-warning)' }">
              <i :class="['fas', fleet.performance >= 90 ? 'fa-check-circle' : 'fa-exclamation-circle']"></i> {{ fleet.performance }}% operativo
            </div>
          </div>
          <div class="stats-icon">
            <i :class="getFleetIcon(fleet.name)"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Gestión de flotas -->
    <div class="card" style="margin-bottom: 1.875rem;">
      <div class="card-header">
        <h2 class="card-title">Gestión de Flotas</h2>
        <button class="btn btn-primary" @click="showNewFleetModal = true">
          <i class="fas fa-plus" style="margin-right: 0.5rem;"></i> Nueva Flota
        </button>
      </div>
      
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Vehículos</th>
            <th>Estado</th>
            <th>Performance</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fleet in fleets" :key="fleet.id">
            <td>{{ fleet.code }}</td>
            <td>{{ fleet.name }}</td>
            <td>{{ fleet.description }}</td>
            <td>{{ fleet.vehicleCount }}</td>
            <td>
              <StatusBadge :status="fleet.status" :text="getStatusText(fleet.status)" />
            </td>
            <td>
              <div style="width: 100%; height: 8px; background-color: #f0f0f0; border-radius: 4px;">
                <div 
                  style="height: 100%; background-color: var(--color-success); border-radius: 4px;"
                  :style="{ width: `${fleet.performance}%`, backgroundColor: getPerformanceColor(fleet.performance) }"
                ></div>
              </div>
              <span style="font-size: 0.75rem; color: #666;">{{ fleet.performance }}%</span>
            </td>
            <td>
              <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.813rem;" @click="viewFleet(fleet)">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.813rem;" @click="editFleet(fleet)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.813rem;" @click="showFleetStats(fleet)">
                <i class="fas fa-chart-line"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detalle de flota seleccionada -->
    <div class="card" v-if="selectedFleet">
      <div class="card-header">
        <h2 class="card-title">{{ selectedFleet.name }} ({{ selectedFleet.code }})</h2>
        <div>
          <button class="btn btn-secondary">
            <i class="fas fa-chart-bar" style="margin-right: 0.5rem;"></i> Reportes
          </button>
          <button class="btn btn-primary" style="margin-left: 0.5rem;" @click="showAssignVehiclesModal = true">
            <i class="fas fa-user-plus" style="margin-right: 0.5rem;"></i> Asignar vehículos
          </button>
        </div>
      </div>
      
      <!-- Pestañas para la información de flota -->
      <div style="margin-top: 1.25rem; border-bottom: 1px solid var(--color-gray-medium);">
        <div style="display: flex; gap: 0.5rem; overflow-x: auto;">
          <button 
            v-for="(tab, index) in fleetTabs" 
            :key="index"
            class="btn" 
            :style="{ 
              padding: '0.75rem 1.25rem',
              borderRadius: '4px 4px 0 0',
              backgroundColor: activeFleetTab === index ? 'var(--color-turquoise)' : 'transparent',
              color: activeFleetTab === index ? 'var(--color-text)' : '',
              marginBottom: '-1px',
              borderBottom: activeFleetTab === index ? '2px solid var(--color-turquoise)' : ''
            }"
            @click="activeFleetTab = index"
          >
            {{ tab }}
          </button>
        </div>
      </div>
      
      <!-- Contenido de la pestaña seleccionada -->
      <div style="padding: 1.25rem 0;">
        <!-- Herramientas de búsqueda y filtrado -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 1.25rem;">
          <div class="form-group" style="width: 300px; margin: 0;">
            <div style="position: relative;">
              <input 
                type="text" 
                class="form-control" 
                placeholder="Buscar vehículo..." 
                style="padding-right: 35px;"
                v-model="fleetVehicleSearch"
              >
              <i class="fas fa-search" style="position: absolute; right: 10px; top: 12px; color: #666;"></i>
            </div>
          </div>
          <div>
            <button class="btn btn-secondary">
              <i class="fas fa-filter" style="margin-right: 0.5rem;"></i> Filtros
            </button>
            <button class="btn btn-secondary" style="margin-left: 0.5rem;">
              <i class="fas fa-download" style="margin-right: 0.5rem;"></i> Exportar
            </button>
          </div>
        </div>
        
        <!-- Tabla de vehículos de la flota -->
        <table class="data-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Modelo</th>
              <th>Conductor asignado</th>
              <th>Estado</th>
              <th>Último servicio</th>
              <th>Próximo servicio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="vehicle in fleetVehicles" :key="vehicle.id">
              <td>{{ vehicle.plate }}</td>
              <td>{{ vehicle.model }} {{ vehicle.year }}</td>
              <td>{{ vehicle.assignedDriver || 'No asignado' }}</td>
              <td>
                <StatusBadge :status="vehicle.status" :text="getStatusText(vehicle.status)" />
              </td>
              <td>{{ formatDate(vehicle.lastService) }}</td>
              <td>{{ formatDate(vehicle.nextService) }}</td>
              <td>
                <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.813rem;">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.813rem; margin: 0 0.25rem;">
                  <i class="fas fa-exchange-alt"></i>
                </button>
                <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.813rem;">
                  <i class="fas fa-times"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Paginación -->
        <Pagination 
          :current-page="fleetVehiclePage"
          :total-items="filteredFleetVehicles.length"
          :per-page="itemsPerPage"
          item-label="vehículos"
          @page-change="fleetVehiclePage = $event"
        />
      </div>
    </div>

    <!-- Modal para asignar vehículos -->
    <Modal 
      :show="showAssignVehiclesModal" 
      title="Asignar vehículos a Flota"
      @close="showAssignVehiclesModal = false"
    >
      <div v-if="selectedFleet">
        <!-- Pestañas para tipos de asignación -->
        <div style="margin-bottom: 1.25rem; border-bottom: 1px solid var(--color-gray-medium);">
          <div style="display: flex; gap: 0.5rem;">
            <button 
              class="btn" 
              style="padding: 0.75rem 1.25rem; border-radius: 4px 4px 0 0; background-color: var(--color-turquoise); color: var(--color-text); margin-bottom: -1px; border-bottom: 2px solid var(--color-turquoise);"
            >
              Vehículos disponibles
            </button>
            <button 
              class="btn btn-secondary" 
              style="padding: 0.75rem 1.25rem; border-radius: 4px 4px 0 0; background-color: transparent; margin-bottom: -1px;"
            >
              Crear nuevo vehículo
            </button>
          </div>
        </div>
        
        <!-- Buscador de vehículos disponibles -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 1.25rem;">
          <div class="form-group" style="flex: 1; margin: 0;">
            <div style="position: relative;">
              <input 
                type="text" 
                class="form-control" 
                placeholder="Buscar vehículo por placa o modelo..." 
                style="padding-right: 35px;"
                v-model="assignVehicleSearch"
              >
              <i class="fas fa-search" style="position: absolute; right: 10px; top: 12px; color: #666;"></i>
            </div>
          </div>
          <button class="btn btn-secondary" style="margin-left: 0.75rem;">
            <i class="fas fa-filter" style="margin-right: 0.5rem;"></i> Filtros
          </button>
        </div>
        
        <!-- Listado de vehículos disponibles -->
        <div style="height: 300px; overflow-y: auto; border: 1px solid var(--color-gray-medium); border-radius: 4px; margin-bottom: 1.25rem;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead style="position: sticky; top: 0; background-color: var(--color-gray-light);">
              <tr>
                <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--color-gray-medium);">
                  <input type="checkbox" id="selectAll" v-model="selectAllVehicles" @change="toggleAllVehicles">
                </th>
                <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--color-gray-medium);">Placa</th>
                <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--color-gray-medium);">Modelo</th>
                <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--color-gray-medium);">Año</th>
                <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--color-gray-medium);">Estado</th>
                <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--color-gray-medium);">Flota actual</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="vehicle in availableVehicles" :key="vehicle.id">
                <td style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #eee;">
                  <input 
                    type="checkbox" 
                    :value="vehicle.id" 
                    v-model="selectedVehiclesToAssign"
                  >
                </td>
                <td style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #eee;">{{ vehicle.plate }}</td>
                <td style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #eee;">{{ vehicle.model }}</td>
                <td style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #eee;">{{ vehicle.year }}</td>
                <td style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #eee;">
                  <StatusBadge :status="vehicle.status" :text="getStatusText(vehicle.status)" />
                </td>
                <td style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #eee;">{{ vehicle.fleet || 'No asignado' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span>{{ availableVehicles.length }} vehículos disponibles, {{ selectedVehiclesToAssign.length }} seleccionados</span>
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-secondary" @click="showAssignVehiclesModal = false">Cancelar</button>
            <button 
              class="btn btn-primary" 
              :disabled="selectedVehiclesToAssign.length === 0"
              @click="assignVehicles"
            >
              Asignar vehículos seleccionados
            </button>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Modal para nueva flota -->
    <Modal 
      :show="showNewFleetModal" 
      :title="editingFleet.id ? 'Editar Flota' : 'Nueva Flota'"
      @close="showNewFleetModal = false"
    >
      <form @submit.prevent="saveFleet">
        <div class="form-group">
          <label for="fleetName" class="form-label">Nombre *</label>
          <input type="text" id="fleetName" class="form-control" v-model="editingFleet.name" required>
        </div>
        
        <div class="form-group">
          <label for="fleetDescription" class="form-label">Descripción</label>
          <textarea id="fleetDescription" class="form-control" rows="3" v-model="editingFleet.description"></textarea>
        </div>
        
        <div class="form-group">
          <label for="fleetStatus" class="form-label">Estado</label>
          <select id="fleetStatus" class="form-control" v-model="editingFleet.status">
            <option value="active">Activa</option>
            <option value="inactive">Inactiva</option>
          </select>
        </div>
      </form>
      <template #footer>
    <button type="button" class="btn btn-secondary" @click="showNewFleetModal = false">Cancelar</button>
    <button type="button" class="btn btn-primary" @click="saveFleet">{{ editingFleet.id ? 'Actualizar' : 'Crear' }} flota</button>
  </template>
    </Modal>
  </div>
</template>

<script>
import { Header, StatusBadge, Modal, Pagination } from '@/components/common'
import fleetsData from '@/data/fleets.json'
import vehiclesData from '@/data/vehicles.json'

export default {
  name: 'FleetManagement',
  components: {
    Header,
    StatusBadge,
    Modal,
    Pagination
  },
  data() {
    return {
      fleets: [...fleetsData],
      vehicles: [...vehiclesData],
      selectedFleet: null,
      activeFleetTab: 0,
      fleetTabs: ['Vehículos', 'Conductores', 'Rutas', 'Mantenimiento', 'Estadísticas'],
      fleetVehicleSearch: '',
      fleetVehiclePage: 1,
      itemsPerPage: 5,
      showAssignVehiclesModal: false,
      assignVehicleSearch: '',
      selectedVehiclesToAssign: [],
      selectAllVehicles: false,
      showNewFleetModal: false,
      editingFleet: {
        name: '',
        description: '',
        status: 'active'
      }
    }
  },
  computed: {
    totalVehicles() {
      return this.fleets.reduce((total, fleet) => total + fleet.vehicleCount, 0)
    },
    fleetVehicles() {
      // En un escenario real, esto se obtendría de la API basado en la flota seleccionada
      if (!this.selectedFleet) return []
      
      // Filtramos vehículos para la flota seleccionada
      return this.vehicles.filter(v => v.fleet === this.selectedFleet.name)
    },
    filteredFleetVehicles() {
      if (!this.fleetVehicleSearch) {
        return this.fleetVehicles
      }
      
      const query = this.fleetVehicleSearch.toLowerCase()
      return this.fleetVehicles.filter(v => 
        v.plate.toLowerCase().includes(query) || 
        v.model.toLowerCase().includes(query) ||
        (v.assignedDriver && v.assignedDriver.toLowerCase().includes(query))
      )
    },
    paginatedFleetVehicles() {
      const start = (this.fleetVehiclePage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredFleetVehicles.slice(start, end)
    },
    availableVehicles() {
      // Vehículos disponibles para asignar (los que no están en la flota seleccionada)
      return this.vehicles.filter(v => {
        if (this.assignVehicleSearch) {
          const query = this.assignVehicleSearch.toLowerCase()
          if (!v.plate.toLowerCase().includes(query) && !v.model.toLowerCase().includes(query)) {
            return false
          }
        }
        
        // Incluir vehículos sin flota o con otra flota
        return !v.fleet || v.fleet !== this.selectedFleet.name
      })
    }
  },
  methods: {
    getStatusText(status) {
      const statusMap = {
        active: 'Activa',
        inactive: 'Inactiva',
        warning: 'En ruta'
      }
      return statusMap[status] || status
    },
    getFleetIcon(fleetName) {
      const iconMap = {
        'Flota Principal': 'fas fa-truck',
        'Flota Secundaria': 'fas fa-car',
        'Flota Externa': 'fas fa-shuttle-van'
      }
      return iconMap[fleetName] || 'fas fa-truck-moving'
    },
    getPerformanceColor(performance) {
      if (performance >= 90) return 'var(--color-success)'
      if (performance >= 70) return 'var(--color-warning)'
      return 'var(--color-error)'
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },
    viewFleet(fleet) {
      this.selectedFleet = fleet
      this.activeFleetTab = 0
      this.fleetVehiclePage = 1
    },
    editFleet(fleet) {
      this.editingFleet = { ...fleet }
      this.showNewFleetModal = true
    },
    showFleetStats(fleet) {
      this.selectedFleet = fleet
      this.activeFleetTab = 4 // Mostrar pestaña de estadísticas
    },
    toggleAllVehicles() {
      if (this.selectAllVehicles) {
        this.selectedVehiclesToAssign = this.availableVehicles.map(v => v.id)
      } else {
        this.selectedVehiclesToAssign = []
      }
    },
    assignVehicles() {
      // Simulación de asignación de vehículos a la flota
      if (this.selectedVehiclesToAssign.length === 0) return
      
      // Actualizar vehículos
      this.selectedVehiclesToAssign.forEach(vehicleId => {
        const vehicle = this.vehicles.find(v => v.id === vehicleId)
        if (vehicle) {
          vehicle.fleet = this.selectedFleet.name
        }
      })
      
      // Actualizar contador de vehículos
      const fleetIndex = this.fleets.findIndex(f => f.id === this.selectedFleet.id)
      if (fleetIndex !== -1) {
        this.fleets[fleetIndex].vehicleCount += this.selectedVehiclesToAssign.length
        this.selectedFleet = { ...this.fleets[fleetIndex] }
      }
      
      // Cerrar modal
      this.showAssignVehiclesModal = false
      this.selectedVehiclesToAssign = []
      this.selectAllVehicles = false
      
      // Mostrar notificación (en una implementación real)
      alert(`Se han asignado ${this.selectedVehiclesToAssign.length} vehículos a la flota ${this.selectedFleet.name}`)
    },
    saveFleet() {
      if (this.editingFleet.id) {
        // Actualizar flota existente
        const index = this.fleets.findIndex(f => f.id === this.editingFleet.id)
        if (index !== -1) {
          this.fleets.splice(index, 1, { ...this.editingFleet })
          
          // Si es la flota seleccionada actualmente, actualizar también esa referencia
          if (this.selectedFleet && this.selectedFleet.id === this.editingFleet.id) {
            this.selectedFleet = { ...this.editingFleet }
          }
        }
      } else {
        // Crear nueva flota
        const newId = Math.max(...this.fleets.map(f => f.id)) + 1
        const newCode = `FL-${String(newId).padStart(3, '0')}`
        const newFleet = {
          ...this.editingFleet,
          id: newId,
          code: newCode,
          vehicleCount: 0,
          performance: 100
        }
        
        this.fleets.push(newFleet)
        this.selectedFleet = newFleet
      }
      
      this.showNewFleetModal = false
      this.editingFleet = {
        name: '',
        description: '',
        status: 'active'
      }
    }
  },
  created() {
    // Seleccionar la primera flota por defecto
    if (this.fleets.length > 0) {
      this.selectedFleet = this.fleets[0]
    }
  }
}
</script>