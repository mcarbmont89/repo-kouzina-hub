import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const type = formData.get("type") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!type || !["invoice", "label"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    // In a real application, you would:
    // 1. Save the file to a storage service
    // 2. Send the file to an OCR service
    // 3. Process the OCR results
    // 4. Return the extracted data

    // For now, we'll return mock data
    const mockData = type === "invoice" ? generateMockInvoiceData() : generateMockLabelData()

    return NextResponse.json({
      success: true,
      data: mockData,
    })
  } catch (error) {
    console.error("Error processing OCR upload:", error)
    return NextResponse.json(
      {
        error: "Failed to process image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function generateMockInvoiceData() {
  return {
    supplier: "Distribuidora Alimentaria S.A.",
    invoiceNumber: "INV-2023-1234",
    date: "2023-07-15",
    items: [
      {
        name: "Tomate",
        unit: "kg",
        quantity: 10,
        unitPrice: 2.5,
        total: 25.0,
      },
      {
        name: "Cebolla",
        unit: "kg",
        quantity: 5,
        unitPrice: 1.75,
        total: 8.75,
      },
      {
        name: "Ajo",
        unit: "kg",
        quantity: 2,
        unitPrice: 4.2,
        total: 8.4,
      },
      {
        name: "Pimiento",
        unit: "kg",
        quantity: 3,
        unitPrice: 3.15,
        total: 9.45,
      },
    ],
    totalAmount: 51.6,
  }
}

function generateMockLabelData() {
  return {
    productName: "Harina de Trigo",
    brand: "Harinera Premium",
    description: "Harina de trigo refinada tipo 00",
    netWeight: "1 kg",
    ingredients: "Trigo 100%",
    nutritionalInfo: {
      calories: 350,
      protein: 10,
      carbs: 70,
      fat: 1,
    },
    barcode: "8412345678901",
  }
}
