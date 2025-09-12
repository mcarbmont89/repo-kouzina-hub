"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, CheckCircle } from "lucide-react"

export default function CSVUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile)
      } else {
        toast({
          title: "Error",
          description: "Por favor, selecciona un archivo CSV válido",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpload = async () => {
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

      const response = await fetch("/api/upload-csv", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "El archivo CSV se ha cargado correctamente",
        })
        setFile(null)
        // Reset the file input
        const fileInput = document.getElementById("csv-file") as HTMLInputElement
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

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cargar Archivo CSV</h1>
        <p className="text-gray-600 mt-2">Sube archivos CSV para importar datos de ingredientes, recetas u órdenes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Subir Archivo CSV
          </CardTitle>
          <CardDescription>Selecciona un archivo CSV para importar datos a tu sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="csv-file">Archivo CSV</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500">Solo se permiten archivos .csv (máximo 10MB)</p>
          </div>

          {file && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <FileText className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-800">{file.name}</p>
                <p className="text-sm text-green-600">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          )}

          <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cargando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Cargar CSV
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Formato de Archivo</CardTitle>
          <CardDescription>Asegúrate de que tu archivo CSV tenga el formato correcto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">Ingredientes</h4>
              <p className="text-sm text-gray-600">
                Columnas: nombre, categoria, precio_unitario, unidad_medida, proveedor
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Recetas</h4>
              <p className="text-sm text-gray-600">
                Columnas: nombre, descripcion, tiempo_preparacion, porciones, ingredientes
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Órdenes</h4>
              <p className="text-sm text-gray-600">Columnas: fecha, restaurante, receta, cantidad, precio_total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
