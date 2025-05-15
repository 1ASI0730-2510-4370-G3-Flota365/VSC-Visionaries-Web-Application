<template>
  <div>
    <Header title="Gestión de Vehículos" />

    <!-- Acciones principales -->
    <div style="display: flex; justify-content: space-between; margin-bottom: 1.875rem;">
      <div>
        <button class="btn btn-primary" @click="showVehicleModal = true">
          <i class="fas fa-plus" style="margin-right: 0.5rem;"></i> Nuevo Vehículo
        </button>
        <button class="btn btn-secondary" style="margin-left: 0.5rem;" @click="showFilters = !showFilters">
          <i class="fas fa-filter" style="margin-right: 0.5rem;"></i> Filtros
        </button>
      </div>
      <div class="form-group" style="width: 300px; margin: 0;">
        <div style="position: relative;">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Buscar vehículo..." 
            style="padding-right: 35px;"
            v-model="searchQuery"
          >
          <i class="fas fa-search" style="position: absolute; right: 10px; top: 12px; color: #666;"></i>
        </div>
      </div>
    </div>

    <!-- Filtros (colapsable) -->
    <div class="card" v-if="showFilters" style="margin-bottom: 1.875rem; padding: 1rem;">
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
        <div class="form-group" style="margin: 0;">
          <label for="statusFilter" class="form-label">Estado</label>
          <select id="statusFilter" class="form-control" v-model="filters.status">
            <option value="">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Mantenimiento</option>
            <option value="warning">En ruta</option>
          </select>
        </div>
        
        <div class="form-group" style="margin: 0;">
          <label for="yearFilter" class="form-label">Año</label>
          <select id="yearFilter" class="form-control" v-model="filters.year">
            <option value="">Todos</option>
            <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
        
        <div class="form-group" style="margin: 0;">
          <label for="modelFilter" class="form-label">Modelo</label>
          <select id="modelFilter" class="form-control" v-model="filters.model">
            <option value="">Todos</option>
            <option v-for="model in availableModels" :key="model" :value="model">{{ model }}</option>
          </select>
        </div>
      </div>
      
      <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
        <button class="btn btn-secondary" @click="resetFilters">Limpiar filtros</button>
      </div>
    </div>

    <!-- Listado de vehículos -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Listado de vehículos</h2>
        <div>
          <button class="btn btn-secondary" @click="exportData">
            <i class="fas fa-download" style="margin-right: 0.5rem;"></i> Exportar
          </button>
        </div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Placa</th>
            <th>Modelo</th>
            <th>Año</th>
            <th>Kilometraje</th>
            <th>Estado</th>
            <th>Conductor Asignado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vehicle in paginatedVehicles" :key="vehicle.id">
            <td>{{ vehicle.plate }}</td>
            <td>{{ vehicle.model }}</td>
            <td>{{ vehicle.year }}</td>
            <td>{{ formatNumber(vehicle.mileage) }} km</td>
            <td>
              <StatusBadge :status="vehicle.status" :text="getStatusText(vehicle.status)" />
            </td>
            <td>{{ vehicle.assignedDriver || 'No asignado' }}</td>
            <td>
              <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.813rem;" @click="viewVehicle(vehicle)">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.813rem;" @click="editVehicle(vehicle)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.813rem;" @click="showHistory(vehicle)">
                <i class="fas fa-history"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Paginación -->
      <Pagination 
        :current-page="currentPage"
        :total-items="filteredVehicles.length"
        :per-page="itemsPerPage"
        item-label="vehículos"
        @page-change="changePage"
      />
    </div>

    <!-- Modal para nuevo/editar vehículo -->
    <Modal 
      :show="showVehicleModal" 
      :title="editingVehicle.id ? 'Editar Vehículo' : 'Registrar nuevo vehículo'"
      @close="showVehicleModal = false"
    >
      <VehicleForm 
        :vehicle-data="editingVehicle"
        @submit="saveVehicle"
        @cancel="showVehicleModal = false"
      />
    </Modal>
    
    <!-- Modal para historial de vehículo -->
    <Modal 
      :show="showHistoryModal" 
      title="Historial del Vehículo"
      @close="showHistoryModal = false"
    >
      <div v-if="selectedVehicle">
        <h3>{{ selectedVehicle.plate }} - {{ selectedVehicle.model }}</h3>
        
        <div style="margin-top: 1rem;">
          <h4>Historial de mantenimiento</h4>
          <table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #ddd;">Fecha</th>
                <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #ddd;">Tipo</th>
                <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #ddd;">Kilometraje</th>
                <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #ddd;">Costo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">10/04/2025</td>
                <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">Mantenimiento preventivo</td>
                <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">15,000 km</td>
                <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">$350.00</td>
              </tr>
              <tr>
                <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">15/01/2025</td>
                <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">Cambio de aceite</td>
                <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">10,000 km</td>
                <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">$120.00</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div style="margin-top: 1rem;">
          <h4>Historial de conductores asignados</h4>
          <table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #ddd;">Fecha</th>
                <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #ddd;">Conductor</th>
                <th style="text-align: left; padding: 0.5rem; border-bottom: 1px solid #ddd;">Duración</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">01/03/2025 - Actual</td>
                <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">Carlos Méndez</td>
                <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">2 meses</td>
              </tr>
              <tr>
                <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">15/10/2024 - 28/02/2025</td>
                <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">Ana Martínez</td>
                <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">4 meses</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <template #footer>
        <button class="btn btn-secondary" @click="showHistoryModal = false">Cerrar</button>
        <button class="btn btn-primary">
          <i class="fas fa-download" style="margin-right: 0.5rem;"></i> Exportar historial
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { Header, StatusBadge, Modal, Pagination } from '@/components/common'
import VehicleForm from '@/components/vehicles/VehicleForm.vue'
import vehiclesData from '@/data/vehicles.json'

export default {
  name: 'VehicleManagement',
  components: {
    Header,
    StatusBadge,
    Modal,
    Pagination,
    VehicleForm
  },
  data() {
    return {
      vehicles: [...vehiclesData],
      searchQuery: '',
      showFilters: false,
      filters: {
        status: '',
        year: '',
        model: ''
      },
      currentPage: 1,
      itemsPerPage: 5,
      showVehicleModal: false,
      showHistoryModal: false,
      editingVehicle: {},
      selectedVehicle: null
    }
  },
  computed: {
    availableYears() {
      return [...new Set(this.vehicles.map(v => v.year))].sort((a, b) => b - a)
    },
    availableModels() {
      return [...new Set(this.vehicles.map(v => v.model))].sort()
    },
    filteredVehicles() {
      return this.vehicles.filter(vehicle => {
        // Search filter
        if (this.searchQuery && !vehicle.plate.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
            !vehicle.model.toLowerCase().includes(this.searchQuery.toLowerCase())) {
          return false
        }
        
        // Status filter
        if (this.filters.status && vehicle.status !== this.filters.status) {
          return false
        }
        
        // Year filter
        if (this.filters.year && vehicle.year !== parseInt(this.filters.year)) {
          return false
        }
        
        // Model filter
        if (this.filters.model && vehicle.model !== this.filters.model) {
          return false
        }
        
        return true
      })
    },
    paginatedVehicles() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredVehicles.slice(start, end)
    }
  },
  methods: {
    getStatusText(status) {
      const statusMap = {
        active: 'Activo',
        inactive: 'Mantenimiento',
        warning: 'En ruta'
      }
      return statusMap[status] || status
    },
    formatNumber(number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    },
    viewVehicle(vehicle) {
      this.selectedVehicle = vehicle
      this.showVehicleModal = true
      this.editingVehicle = { ...vehicle }
    },
    editVehicle(vehicle) {
      this.editingVehicle = { ...vehicle }
      this.showVehicleModal = true
    },
    showHistory(vehicle) {
      this.selectedVehicle = vehicle
      this.showHistoryModal = true
    },
    saveVehicle(vehicle) {
      if (vehicle.id) {
        // Update existing vehicle
        const index = this.vehicles.findIndex(v => v.id === vehicle.id)
        if (index !== -1) {
          this.vehicles.splice(index, 1, vehicle)
        }
      } else {
        // Add new vehicle
        const newId = Math.max(...this.vehicles.map(v => v.id)) + 1
        this.vehicles.push({
          ...vehicle,
          id: newId
        })
      }
      
      this.showVehicleModal = false
      this.editingVehicle = {}
    },
    resetFilters() {
      this.filters = {
        status: '',
        year: '',
        model: ''
      }
      this.searchQuery = ''
    },
    changePage(page) {
      this.currentPage = page
    },
    exportData() {
      alert('Exportando datos de vehículos...')
    }
  },
  created() {
    // Check if we should open edit modal from another view
    const editId = parseInt(this.$route.query.edit)
    if (editId) {
      const vehicle = this.vehicles.find(v => v.id === editId)
      if (vehicle) {
        this.editVehicle(vehicle)
      }
    }
  }
}
</script>