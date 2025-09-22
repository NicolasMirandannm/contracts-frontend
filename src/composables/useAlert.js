import { ref } from 'vue'

let idCounter = 0
const alerts = ref([])

const getIcon = (type) => {
  switch (type) {
    case 'success': return 'mdi-check-circle'
    case 'error': return 'mdi-alert-circle'
    case 'info': return 'mdi-information'
    case 'warning': return 'mdi-alert'
    default: return 'mdi-bell'
  }
}

const showAlert = ({ msg, type = 'success', timeout = 4000 }) => {
  const id = ++idCounter
  alerts.value.push({
    id,
    msg,
    type,
    icon: getIcon(type),
    timeout,
    visible: true
  })

  setTimeout(() => {
    closeAlert(id)
  }, timeout)
}

const closeAlert = (id) => {
  const index = alerts.value.findIndex(a => a.id === id)
  if (index !== -1) alerts.value.splice(index, 1)
}

export function useAlert() {
  return {
    alerts,
    showAlert,
    closeAlert
  }
}
