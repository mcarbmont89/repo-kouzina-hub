'use client'

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface CostChartProps {
  data: any[]
}

export function CostChart({ data }: CostChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Dish" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Cost per Dish (€)" fill="#8884d8" />
        <Bar dataKey="Selling Price (€)" fill="#82ca9d" />
        <Bar dataKey="Weekly Revenue (€)" fill="#ffc658" />
      </BarChart>
    </ResponsiveContainer>
  )
}
