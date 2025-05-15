<template>
  <div>
    <Header title="Dashboard" />

    <!-- Resumen estadístico -->
    <div class="dashboard-grid">
      <div class="stats-card" v-for="(stat, index) in statCards" :key="index">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div class="stats-label">{{ stat.label }}</div>
            <div class="stats-value">{{ stat.value }}</div>
            <div :style="{ color: stat.changeColor, fontSize: '0.875rem' }">
              <i :class="['fas', stat.changeIcon]"></i> {{ stat.changeText }}
            </div>
          </div>
          <div class="stats-icon">
            <i :class="['fas', stat.icon]"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Vehículos activos -->
    <div class="card" style="margin-top: 1.875rem;">
      <div class="card-header">
        <h2 class="card-title">Vehículos activos</h2>
        <button class="btn btn-primary" @click="exportData">
          <i class="fas fa-download" style="margin-right: 0.5rem;"></i> Exportar
        </button>
      </div>

      <table class="data-table">
        <thead>
        <tr>
          <th>Placa</th>
          <th>Modelo</th>
          <th>Conductor</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="vehicle in activeVehicles" :key="vehicle.id">
          <td>{{ vehicle.plate }}</td>
          <td>{{ vehicle.model }} {{ vehicle.year }}</td>
          <td>{{ vehicle.assignedDriver || 'No asignado' }}</td>
          <td>
            <StatusBadge :status="vehicle.status" :text="getStatusText(vehicle.status)" />
          </td>
          <td>
            <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.813rem;" @click="viewVehicle(vehicle)">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.813rem;" @click="editVehicle(vehicle)">
              <i class="fas fa-edit"></i>
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Alertas recientes -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Alertas recientes</h2>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div v-for="(alert, index) in stats.alerts" :key="index"
             :style="getAlertStyle(alert.type)"
             style="display: flex; gap: 1rem; padding: 0.75rem;">
          <i :class="['fas', getAlertIcon(alert.type)]" :style="{ color: getAlertColor(alert.type), fontSize: '1.25rem' }"></i>
          <div>
            <h4 style="margin: 0;">{{ alert.title }}</h4>
            <p style="margin: 0.25rem 0 0 0; color: #666;">{{ alert.description }}</p>
            <p style="margin: 0.25rem 0 0 0; font-size: 0.813rem; color: #999;">hace {{ alert.time }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para ver detalle de vehículo -->
    <Modal
        :show="showVehicleModal"
        title="Detalles del Vehículo"
        @close="showVehicleModal = false"
    >
      <div v-if="selectedVehicle">
        <div style="margin-bottom: 1rem;">
          <h3>{{ selectedVehicle.model }} ({{ selectedVehicle.plate }})</h3>
          <StatusBadge :status="selectedVehicle.status" :text="getStatusText(selectedVehicle.status)" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <p><strong>Año:</strong> {{ selectedVehicle.year }}</p>
            <p><strong>Kilometraje:</strong> {{ selectedVehicle.mileage }} km</p>
            <p><strong>Conductor:</strong> {{ selectedVehicle.assignedDriver || 'No asignado' }}</p>
          </div>
          <div>
            <p><strong>Último servicio:</strong> {{ formatDate(selectedVehicle.lastService) }}</p>
            <p><strong>Próximo servicio:</strong> {{ formatDate(selectedVehicle.nextService) }}</p>
            <p><strong>Flota:</strong> {{ selectedVehicle.fleet }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <button class="btn btn-secondary" @click="showVehicleModal = false">Cerrar</button>
        <button class="btn btn-primary" @click="editVehicle(selectedVehicle)">Editar</button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { Header, StatusBadge, Modal } from '@/components/common'
import statsData from '@/data/stats.json'
import vehiclesData from '@/data/vehicles.json'

export default {
  name: 'Dashboard',
  components: {
    Header,
    StatusBadge,
    Modal
  },
  data() {
    return {
      stats: statsData,
      vehicles: vehiclesData,
      showVehicleModal: false,
      selectedVehicle: null
    }
  },
  computed: {
    statCards() {
      return [
        {
          label: 'Total de vehículos',
          value: this.stats.total_vehicles,
          icon: 'fa-car',
          changeColor: 'var(--color-success)',
          changeIcon: 'fa-arrow-up',
          changeText: `${this.stats.recent_changes.vehicles}% esta semana`
        },
        {
          label: 'Conductores activos',
          value: this.stats.active_drivers,
          icon: 'fa-id-card',
          changeColor: 'var(--color-warning)',
          changeIcon: 'fa-arrow-down',
          changeText: `${Math.abs(this.stats.recent_changes.drivers)}% esta semana`
        },
        {
          label: 'En mantenimiento',
          value: this.stats.maintenance_vehicles,
          icon: 'fa-tools',
          changeColor: 'var(--color-error)',
          changeIcon: 'fa-arrow-up',
          changeText: `${this.stats.recent_changes.maintenance}% esta semana`
        },
        {
          label: 'Eficiencia de flota',
          value: `${this.stats.fleet_efficiency}%`,
          icon: 'fa-chart-line',
          changeColor: 'var(--color-success)',
          changeIcon: 'fa-arrow-up',
          changeText: `${this.stats.recent_changes.efficiency}% este mes`
        }
      ]
    },
    activeVehicles() {
      return this.vehicles.filter(v => v.status === 'active' || v.status === 'warning')
    }
  },
  methods: {
    getStatusText(status) {
      const statusMap = {
        active: 'Activo',
        inactive: 'Inactivo',
        warning: 'En ruta'
      }
      return statusMap[status] || status
    },
    getAlertStyle(type) {
      const borderColorMap = {
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        info: 'var(--color-turquoise)'
      }
      const color = borderColorMap[type] || 'var(--color-turquoise)'
      return {
        borderLeft: `4px solid ${color}`,
        backgroundColor: `rgba(244, 67, 54, 0.05)`
      }
    },
    getAlertColor(type) {
      const colorMap = {
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        info: 'var(--color-turquoise)'
      }
      return colorMap[type] || 'var(--color-turquoise)'
    },
    getAlertIcon(type) {
      const iconMap = {
        error: 'fa-exclamation-circle',
        warning: 'fa-bell',
        info: 'fa-info-circle'
      }
      return iconMap[type] || 'fa-info-circle'
    },
    viewVehicle(vehicle) {
      this.selectedVehicle = vehicle
      this.showVehicleModal = true
    },
    editVehicle(vehicle) {
      this.$router.push({
        path: '/vehicle-management',
        query: { edit: vehicle.id }
      })
    },
    exportData() {
      alert('Exportando datos de vehículos...')
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A'

      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  }
}
</script>