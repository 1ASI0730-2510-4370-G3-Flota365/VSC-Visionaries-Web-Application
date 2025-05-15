<template>
  <form @submit.prevent="handleSubmit" id="vehicleForm">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
      <div class="form-group">
        <label for="plateNumber" class="form-label">Número de placa *</label>
        <input type="text" id="plateNumber" class="form-control" v-model="vehicle.plate" required>
      </div>
      
      <div class="form-group">
        <label for="model" class="form-label">Modelo *</label>
        <input type="text" id="model" class="form-control" v-model="vehicle.model" required>
      </div>
      
      <div class="form-group">
        <label for="year" class="form-label">Año *</label>
        <input type="number" id="year" class="form-control" v-model.number="vehicle.year" required>
      </div>
      
      <div class="form-group">
        <label for="mileage" class="form-label">Kilometraje inicial *</label>
        <input type="number" id="mileage" class="form-control" v-model.number="vehicle.mileage" required>
      </div>
      
      <div class="form-group">
        <label for="status" class="form-label">Estado</label>
        <select id="status" class="form-control" v-model="vehicle.status">
          <option value="active">Activo</option>
          <option value="inactive">Mantenimiento</option>
          <option value="warning">En ruta</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="driver" class="form-label">Conductor asignado</label>
        <select id="driver" class="form-control" v-model="vehicle.assignedDriver">
          <option value="">No asignado</option>
          <option value="Carlos Méndez">Carlos Méndez</option>
          <option value="Ana Martínez">Ana Martínez</option>
          <option value="Roberto Torres">Roberto Torres</option>
          <option value="Pedro Ramírez">Pedro Ramírez</option>
        </select>
      </div>
    </div>
    
    <div class="form-group">
      <label for="notes" class="form-label">Notas adicionales</label>
      <textarea id="notes" class="form-control" rows="3" v-model="vehicle.notes"></textarea>
    </div>
    
    <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem;">
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Cancelar</button>
      <button type="submit" class="btn btn-primary">{{ isEdit ? 'Actualizar' : 'Guardar' }} vehículo</button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'VehicleForm',
  props: {
    vehicleData: {
      type: Object,
      default: () => ({
        plate: '',
        model: '',
        year: new Date().getFullYear(),
        mileage: 0,
        status: 'active',
        assignedDriver: '',
        notes: ''
      })
    }
  },
  data() {
    return {
      vehicle: { ...this.vehicleData }
    }
  },
  computed: {
    isEdit() {
      return !!this.vehicleData.id
    }
  },
  methods: {
    handleSubmit() {
      this.$emit('submit', { ...this.vehicle })
    }
  },
  watch: {
    vehicleData(newValue) {
      this.vehicle = { ...newValue }
    }
  }
}
</script>