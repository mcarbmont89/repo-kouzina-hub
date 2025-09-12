'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

interface Report {
  id: string
  date: string
  totalRevenue: number
  totalCost: number
  profit: number
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports')
      if (!response.ok) throw new Error('Failed to fetch reports')
      const data = await response.json()
      setReports(data)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch reports', variant: 'destructive' })
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Reportes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Ingresos Totales (€)</TableHead>
                <TableHead>Costos Totales (€)</TableHead>
                <TableHead>Beneficio (€)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                  <TableCell>{report.totalRevenue.toFixed(2)}</TableCell>
                  <TableCell>{report.totalCost.toFixed(2)}</TableCell>
                  <TableCell>{report.profit.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
