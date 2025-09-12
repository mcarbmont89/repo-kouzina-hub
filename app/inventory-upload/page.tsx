import { InventoryUpload } from "@/components/InventoryUpload"

export default function InventoryUploadPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Cargar Inventario con OCR</h1>
      <p className="text-muted-foreground">
        Sube imágenes de facturas o etiquetas de productos para extraer automáticamente la información de los
        ingredientes.
      </p>
      <InventoryUpload />
    </div>
  )
}
