import OrderManager from '@/components/OrderManager'

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestión de Órdenes</h1>
      <OrderManager />
    </div>
  )
}
