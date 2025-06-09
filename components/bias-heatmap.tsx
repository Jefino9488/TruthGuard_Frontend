"use client"

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from 'recharts';

// Data structure for Source Bias Averages
interface SourceBiasData {
  source: string;
  averageBias: number; // Average bias score for this source (e.g., 0.0 to 1.0)
}

interface BiasHeatmapProps {
  data: SourceBiasData[];
}

export const BiasHeatmap: React.FC<BiasHeatmapProps> = ({ data }) => {
  // Function to determine bar color based on bias score
  const getBarColor = (averageBias: number) => {
    // Assuming 0 is Left, 0.5 is Center, 1.0 is Right
    if (averageBias <= 0.2) return '#a3e635'; // Greenish for Left
    if (averageBias <= 0.4) return '#84cc16'; // Lighter Green for Left-Center
    if (averageBias > 0.4 && averageBias < 0.6) return '#3b82f6'; // Blue for Center
    if (averageBias >= 0.6 && averageBias < 0.8) return '#f97316'; // Orange for Right-Center
    return '#ef4444'; // Red for Right
  };

  // Custom tooltip for better readability
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const avgBias = payload[0].value;
      const biasDirection = avgBias <= 0.4 ? 'Left-leaning' : avgBias >= 0.6 ? 'Right-leaning' : 'Centrist';
      return (
          <div className="p-2 bg-white border border-gray-300 rounded shadow-md text-sm">
            <p className="font-medium text-gray-800">{label}</p>
            <p className="text-gray-600">{`Average Bias: ${avgBias.toFixed(2)} (${biasDirection})`}</p>
          </div>
      );
    }
    return null;
  };

  return (
      <ResponsiveContainer width="100%" height={Math.max(400, data.length * 50)}> {/* Dynamic height based on number of sources */}
        <BarChart
            layout="vertical"
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 80, // Increased left margin for source labels
              bottom: 5,
            }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => value.toFixed(1)} />
          <YAxis dataKey="source" type="category" width={100} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="averageBias" >
            {data.map((entry, index) => (
                <Bar key={`bar-${index}`} fill={getBarColor(entry.averageBias)} radius={[0, 4, 4, 0]} />
            ))}
            <LabelList dataKey="averageBias" position="right" formatter={(value: number) => value.toFixed(2)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
  );
};
