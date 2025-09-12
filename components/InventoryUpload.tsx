"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Upload, FileText, Tag, Check, AlertCircle, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Ingredient, Provider } from "@/types/schema"

export function InventoryUpload() {
  const [activeTab, setActiveTab] = useState("invoice")
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [extractedIngredients, setExtractedIngredients] = useState<Partial<Ingredient>[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [isReviewing, setIsReviewing] = useState(false)
  const { toast } = useToast()

  // Fetch providers when component mounts
  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const response = await fetch("/api/providers")
      if (!response.ok) throw new Error("Failed to fetch providers")
      const data = await response.json()
      setProviders(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch providers",
        variant: "destructive",
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Por favor, sube una imagen válida",
          variant: "destructive",
        })
        return
      }

      setUploadedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setExtractedIngredients([])
      setIsReviewing(false)
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile) {
      toast({
        title: "Error",
        description: "Por favor, selecciona una imagen para subir",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // In a real application, you would upload the file to your server here
      // For now, we'll simulate a file upload with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Éxito",
        description: "Imagen subida correctamente",
      })

      // Move to processing stage
      processImage()
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al subir la imagen",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const processImage = async () => {
    setIsProcessing(true)

    try {
      // In a real application, this would call your OCR service
      // For now, we'll simulate OCR processing with a timeout and mock data
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate mock extracted ingredients based on the active tab
      const mockIngredients =
        activeTab === "invoice" ? generateMockInvoiceIngredients() : generateMockLabelIngredients()

      setExtractedIngredients(mockIngredients)
      setIsReviewing(true)

      toast({
        title: "Procesamiento completado",
        description: `Se han detectado ${mockIngredients.length} ingredientes`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar la imagen",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const generateMockInvoiceIngredients = (): Partial<Ingredient>[] => {
    // Mock data for invoice OCR
    return [
      {
        name: "Tomate",
        unit: "kg",
        cost_per_unit: 2.5,
        in_stock: 10,
      },
      {
        name: "Cebolla",
        unit: "kg",
        cost_per_unit: 1.75,
        in_stock: 5,
      },
      {
        name: "Ajo",
        unit: "kg",
        cost_per_unit: 4.2,
        in_stock: 2,
      },
      {
        name: "Pimiento",
        unit: "kg",
        cost_per_unit: 3.15,
        in_stock: 3,
      },
    ]
  }

  const generateMockLabelIngredients = (): Partial<Ingredient>[] => {
    // Mock data for product label OCR
    return [
      {
        name: "Harina de Trigo",
        description: "Harina de trigo refinada tipo 00",
        unit: "kg",
        cost_per_unit: 1.2,
        in_stock: 5,
      },
    ]
  }

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: any) => {
    setExtractedIngredients((prev) =>
      prev.map((ingredient, i) => (i === index ? { ...ingredient, [field]: value } : ingredient)),
    )
  }

  const handleSaveIngredients = async () => {
    try {
      // Validate ingredients
      const invalidIngredients = extractedIngredients.filter(
        (ing) => !ing.name || !ing.unit || !ing.cost_per_unit || !ing.provider_id,
      )

      if (invalidIngredients.length > 0) {
        toast({
          title: "Error",
          description: "Todos los ingredientes deben tener nombre, unidad, costo y proveedor",
          variant: "destructive",
        })
        return
      }

      // In a real application, you would save these ingredients to your database
      // For now, we'll simulate saving with a timeout
      setIsProcessing(true)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Éxito",
        description: `${extractedIngredients.length} ingredientes añadidos al inventario`,
      })

      // Reset the form
      setUploadedFile(null)
      setPreviewUrl(null)
      setExtractedIngredients([])
      setIsReviewing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar los ingredientes",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="invoice">
          <FileText className="w-4 h-4 mr-2" />
          Facturas
        </TabsTrigger>
        <TabsTrigger value="label">
          <Tag className="w-4 h-4 mr-2" />
          Etiquetas de Productos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="invoice" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Subir Factura</CardTitle>
            <CardDescription>
              Sube una imagen de una factura para extraer automáticamente los ingredientes y sus precios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isReviewing ? (
              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="invoice-image">Imagen de Factura</Label>
                  <Input
                    id="invoice-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading || isProcessing}
                  />
                </div>

                {previewUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
                    <div className="border rounded-md overflow-hidden">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="max-h-[300px] object-contain mx-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Ingredientes Detectados</h3>
                  <p className="text-sm text-muted-foreground">Revisa y edita la información antes de guardar</p>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Costo por Unidad (€)</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Proveedor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extractedIngredients.map((ingredient, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={ingredient.name || ""}
                            onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={ingredient.unit || ""}
                            onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={ingredient.cost_per_unit || ""}
                            onChange={(e) =>
                              handleIngredientChange(index, "cost_per_unit", Number.parseFloat(e.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={ingredient.in_stock || ""}
                            onChange={(e) =>
                              handleIngredientChange(index, "in_stock", Number.parseFloat(e.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={ingredient.provider_id || ""}
                            onValueChange={(value) => handleIngredientChange(index, "provider_id", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar proveedor" />
                            </SelectTrigger>
                            <SelectContent>
                              {providers.map((provider) => (
                                <SelectItem key={provider.id} value={provider.id}>
                                  {provider.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {!isReviewing ? (
              <Button onClick={handleUpload} disabled={!uploadedFile || isUploading || isProcessing}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Subir y Procesar
                  </>
                )}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsReviewing(false)} disabled={isProcessing}>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <Button onClick={handleSaveIngredients} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Guardar Ingredientes
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="label" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Subir Etiqueta de Producto</CardTitle>
            <CardDescription>
              Sube una imagen de la etiqueta de un producto para extraer automáticamente la información nutricional y de
              ingredientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isReviewing ? (
              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="label-image">Imagen de Etiqueta</Label>
                  <Input
                    id="label-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading || isProcessing}
                  />
                </div>

                {previewUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
                    <div className="border rounded-md overflow-hidden">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="max-h-[300px] object-contain mx-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Información Detectada</h3>
                  <p className="text-sm text-muted-foreground">Revisa y edita la información antes de guardar</p>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Costo por Unidad (€)</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Proveedor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extractedIngredients.map((ingredient, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={ingredient.name || ""}
                            onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={ingredient.description || ""}
                            onChange={(e) => handleIngredientChange(index, "description", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={ingredient.unit || ""}
                            onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={ingredient.cost_per_unit || ""}
                            onChange={(e) =>
                              handleIngredientChange(index, "cost_per_unit", Number.parseFloat(e.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={ingredient.in_stock || ""}
                            onChange={(e) =>
                              handleIngredientChange(index, "in_stock", Number.parseFloat(e.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={ingredient.provider_id || ""}
                            onValueChange={(value) => handleIngredientChange(index, "provider_id", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar proveedor" />
                            </SelectTrigger>
                            <SelectContent>
                              {providers.map((provider) => (
                                <SelectItem key={provider.id} value={provider.id}>
                                  {provider.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {!isReviewing ? (
              <Button onClick={handleUpload} disabled={!uploadedFile || isUploading || isProcessing}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Subir y Procesar
                  </>
                )}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsReviewing(false)} disabled={isProcessing}>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <Button onClick={handleSaveIngredients} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Guardar Ingredientes
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
