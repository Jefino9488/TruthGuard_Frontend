// components/bias-chart.tsx
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

// Define the expected data structure for the chart
interface BiasCategoryData {
    name: string; // e.g., "Left", "Center", "Right"
    articles: number; // Count of articles in this category
}

interface BiasChartProps {
    data: BiasCategoryData[];
}

export const BiasChart: React.FC<BiasChartProps> = ({ data }) => {
    // Custom tooltip for better readability
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-2 bg-white border border-gray-300 rounded shadow-md text-sm">
                    <p className="font-medium text-gray-800">{label}</p>
                    <p className="text-gray-600">{`Articles: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={data}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="articles" fill="#8884d8" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="articles" position="top" />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};
