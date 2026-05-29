export function formatCurrency(n: number) {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(n)
}
export function generateTicketNumber() {
  return `TKT-${Date.now().toString(36).toUpperCase()}`
}
