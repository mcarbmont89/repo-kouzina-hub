'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from "@/components/ui/use-toast"

interface FileState {
  file: File | null
  name: string
  placeholder: string
}

const initialFileState: Record<string, FileState> = {
  ingredients: {
    file: null,
    name: 'Ingredientes CSV',
    placeholder: 'ingredientes.csv'
  },
  recipes: {
    file: null,
    name: 'Recetas CSV',
    placeholder: 'recetas.csv'
  },
  orders: {
    file: null,
    name: 'Órdenes CSV',
    placeholder: 'ordenes.csv'
  }
}

export default function CSVUpload() {
  const [files, setFiles] = useState<Record<string, FileState>>(initialFileState)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast({
          title: "Error",
          description: "Por favor, selecciona un archivo CSV válido.",
          variant: "destructive",
        })
        event.target.value = ''
        return
      }

      setFiles(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          file
        }
      }))
    }
  }

  const handleUpload = async () => {
    setIsUploading(true)
    const formData = new FormData()
    let hasFiles = false

    Object.entries(files).forEach(([key, { file }]) => {
      if (file) {
        formData.append(key, file)
        hasFiles = true
      }
    })

    if (!hasFiles) {
      toast({
        title: "Error",
        description: "Por favor, selecciona al menos un archivo para subir.",
        variant: "destructive",
      })
      setIsUploading(false)
      return
    }

    try {
      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error al subir los archivos')
      }

      const data = await response.json()

      setFiles(initialFileState)
      document.querySelectorAll('input[type="file"]').forEach((input: HTMLInputElement) => {
        input.value = ''
      })

      toast({
        title: "Éxito",
        description: data.message || 'Archivos subidos correctamente',
      })
    } catch (error) {
      console.error('Error al subir archivos:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error al subir los archivos',
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Cargar Archivos CSV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(files).map(([key, { name, placeholder }]) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{name}</Label>
            <div className="flex items-center gap-2">
              <Input
                id={key}
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange(e, key)}
                placeholder={placeholder}
                disabled={isUploading}
                className="cursor-pointer"
              />
              {files[key].file && (
                <span className="text-sm text-muted-foreground">
                  {files[key].file.name}
                </span>
              )}
            </div>
          </div>
        ))}
        <Button 
          onClick={handleUpload} 
          disabled={isUploading} 
          className="w-full"
        >
          {isUploading ? 'Subiendo...' : 'Subir Archivos'}
        </Button>
      </CardContent>
    </Card>
  )
}
