import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Please upload a CSV file." },
        { status: 400 },
      )
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size too large. Maximum size is 10MB." },
        { status: 400 },
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    const filepath = path.join(uploadsDir, filename)

    // Write the file
    await writeFile(filepath, buffer)

    // Here you would typically process the CSV file
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      filename: filename,
      size: file.size,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
