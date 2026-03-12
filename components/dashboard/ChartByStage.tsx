'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { KANBAN_STAGES } from '@/lib/constants'

interface ChartByStageProps {
  data: Record<string, number>
}

export function ChartByStage({ data }: ChartByStageProps) {
  const chartData = KANBAN_STAGES.map((stage) => ({
    name: stage.title,
    count: data[stage.id] ?? 0,
    color: stage.color,
  })).filter((d) => d.count > 0)

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-[#4a4a4a] text-center py-8">Sin datos todavía.</p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: '#6b7280', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '8px',
            color: '#fff',
            fontSize: 12,
          }}
          cursor={{ fill: '#ffffff08' }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.color} opacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
