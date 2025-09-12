"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"

type FileType = "ingredients" | "recipes" | "orders"

export default function UploadPage() {
  const [files, setFiles] = useState<{ [key in FileType]?: File }>({})
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (type: FileType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
        setFiles((prev) => ({ ...prev, [type]: selectedFile }))
      } else {
        toast({
          title: "Error",
          description: "Por favor, selecciona un archivo CSV válido",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpload = async (type: FileType) => {
    const file = files[type]
    if (!file) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un archivo CSV",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const response = await fetch("/api/upload-csv", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: `El archivo de ${type} se ha cargado correctamente`,
        })
        setFiles((prev) => ({ ...prev, [type]: undefined }))
        // Reset the file input
        const fileInput = document.getElementById(`${type}-file`) as HTMLInputElement
        if (fileInput) {
          fileInput.value = ""
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al cargar el archivo")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un problema al cargar el archivo CSV",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const fileTypes: { key: FileType; title: string; description: string; columns: string }[] = [
    {
      key: "ingredients",
      title: "Ingredientes",
      description: "Importar lista de ingredientes con precios y proveedores",
      columns: "nombre, categoria, precio_unitario, unidad_medida, proveedor",
    },
    {
      key: "recipes",
      title: "Recetas",
      description: "Importar recetas con ingredientes y preparación",
      columns: "nombre, descripcion, tiempo_preparacion, porciones, ingredientes",
    },
    {
      key: "orders",
      title: "Órdenes",
      description: "Importar órdenes de restaurantes",
      columns: "fecha, restaurante, receta, cantidad, precio_total",
    },
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cargar Datos CSV</h1>
        <p className="text-gray-600 mt-2">Importa datos desde archivos CSV para ingredientes, recetas y órdenes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {fileTypes.map(({ key, title, description, columns }) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${key}-file`}>Archivo CSV</Label>
                <Input
                  id={`${key}-file`}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange(key)}
                  className="cursor-pointer"
                />
              </div>

              {files[key] && (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <FileText className="w-4 h-4 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-green-800 truncate">{files[key]!.name}</p>
                    <p className="text-sm text-green-600">{(files[key]!.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              )}

              <Button
                onClick={() => handleUpload(key)}
                disabled={!files[key] || isUploading}
                className="w-full"
                size="sm"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cargando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Cargar
                  </>
                )}
              </Button>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Formato requerido:</p>
                    <p className="text-xs text-blue-600 mt-1">{columns}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Instrucciones de Formato</CardTitle>
          <CardDescription>Sigue estas pautas para asegurar una importación exitosa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Requisitos Generales</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Formato: CSV (separado por comas)</li>
                  <li>• Codificación: UTF-8</li>
                  <li>• Primera fila debe contener los encabezados</li>
                  <li>• Tamaño máximo: 10MB</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Consejos</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Usa comillas para texto con comas</li>
                  <li>• Evita caracteres especiales</li>
                  <li>• Verifica que no haya filas vacías</li>
                  <li>• Revisa los datos antes de subir</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
