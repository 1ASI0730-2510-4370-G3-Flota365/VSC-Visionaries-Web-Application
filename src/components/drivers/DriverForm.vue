<template>
  <form @submit.prevent="handleSubmit" id="driverForm">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
      <div class="form-group">
        <label for="firstName" class="form-label">Nombre *</label>
        <input type="text" id="firstName" class="form-control" v-model="driver.firstName" required>
      </div>
      
      <div class="form-group">
        <label for="lastName" class="form-label">Apellidos *</label>
        <input type="text" id="lastName" class="form-control" v-model="driver.lastName" required>
      </div>
      
      <div class="form-group">
        <label for="licenseNumber" class="form-label">Número de licencia *</label>
        <input type="text" id="licenseNumber" class="form-control" v-model="driver.licenseNumber" required>
      </div>
      
      <div class="form-group">
        <label for="licenseExpiry" class="form-label">Fecha de vencimiento *</label>
        <input type="date" id="licenseExpiry" class="form-control" v-model="driver.licenseExpiry" required>
      </div>
      
      <div class="form-group">
        <label for="experience" class="form-label">Experiencia (años)</label>
        <input type="number" id="experience" class="form-control" v-model.number="driver.experience">
      </div>
      
      <div class="form-group">
        <label for="assignedVehicle" class="form-label">Vehículo asignado</label>
        <select id="assignedVehicle" class="form-control" v-model="driver.assignedVehicle">
          <option value="">No asignado</option>
          <option value="1">Toyota Hilux (ABC-123)</option>
          <option value="2">Ford Ranger (XYZ-789)</option>
          <option value="3">Mitsubishi L200 (DEF-456)</option>
          <option value="4">Nissan Frontier (GHI-789)</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="phone" class="form-label">Teléfono *</label>
        <input type="tel" id="phone" class="form-control" v-model="driver.phone" required>
      </div>
      
      <div class="form-group">
        <label for="email" class="form-label">Correo electrónico</label>
        <input type="email" id="email" class="form-control" v-model="driver.email">
      </div>
    </div>
    
    <div class="form-group">
      <label for="address" class="form-label">Dirección</label>
      <textarea id="address" class="form-control" rows="2" v-model="driver.address"></textarea>
    </div>
    
    <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem;">
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Cancelar</button>
      <button type="submit" class="btn btn-primary">{{ isEdit ? 'Actualizar' : 'Guardar' }} conductor</button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'DriverForm',
  props: {
    driverData: {
      type: Object,
      default: () => ({
        firstName: '',
        lastName: '',
        licenseNumber: '',
        licenseExpiry: '',
        experience: 0,
        assignedVehicle: '',
        phone: '',
        email: '',
        address: ''
      })
    }
  },
  data() {
    return {
      driver: { ...this.driverData }
    }
  },
  computed: {
    isEdit() {
      return !!this.driverData.id
    }
  },
  methods: {
    handleSubmit() {
      this.$emit('submit', { ...this.driver })
    }
  },
  watch: {
    driverData(newValue) {
      this.driver = { ...newValue }
    }
  }
}
</script>