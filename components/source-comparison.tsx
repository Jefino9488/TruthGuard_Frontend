// components/source-comparison.tsx
"use client"

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"; // Assuming these are available from shadcn/ui
import { Badge } from "@/components/ui/badge";

// Data structure for Source Comparison
interface SourceComparisonData {
    source: string;
    averageBias: number; // 0.0 (Left) to 1.0 (Right), 0.5 (Center)
    averageMisinformationRisk: number; // e.g., 0.0 (Low) to 1.0 (High)
    averageCredibility: number; // e.g., 0.0 (Low) to 1.0 (High)
    articleCount: number;
}

interface SourceComparisonProps {
    data: SourceComparisonData[];
}

export const SourceComparison: React.FC<SourceComparisonProps> = ({ data }) => {
    // Helper to determine bias direction string and color
    const getBiasLabelAndColor = (bias: number) => {
        // Updated ranges to reflect 0-1 scale with 0.5 as center
        if (bias >= 0 && bias < 0.2) return { label: 'Far Left', color: 'bg-blue-700' };
        if (bias >= 0.2 && bias < 0.4) return { label: 'Left-leaning', color: 'bg-blue-500' };
        if (bias >= 0.4 && bias <= 0.6) return { label: 'Centrist', color: 'bg-gray-500' }; // Center is 0.5
        if (bias > 0.6 && bias <= 0.8) return { label: 'Right-leaning', color: 'bg-red-500' };
        if (bias > 0.8 && bias <= 1.0) return { label: 'Far Right', color: 'bg-red-700' };
        return { label: 'Unknown', color: 'bg-gray-400' };
    };

    // Helper to determine credibility level string and color
    const getCredibilityLabelAndColor = (credibility: number) => {
        if (credibility > 0.8) return { label: 'High', color: 'bg-green-600' };
        if (credibility > 0.5) return { label: 'Medium', color: 'bg-yellow-500' };
        return { label: 'Low', color: 'bg-red-600' };
    };

    // Helper to determine misinformation risk label and color
    const getMisinformationLabelAndColor = (risk: number) => {
        if (risk < 0.3) return { label: 'Low Risk', color: 'bg-green-600' };
        if (risk < 0.6) return { label: 'Moderate Risk', color: 'bg-yellow-500' };
        return { label: 'High Risk', color: 'bg-red-600' };
    };


    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No source comparison data available. Please ensure articles have 'source' and bias/misinformation/credibility scores.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[150px]">Source</TableHead>
                        <TableHead>Articles</TableHead>
                        <TableHead>Avg. Bias</TableHead>
                        <TableHead>Bias Direction</TableHead>
                        <TableHead>Avg. Misinformation Risk</TableHead>
                        <TableHead>Avg. Credibility</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{item.source}</TableCell>
                            <TableCell>{item.articleCount}</TableCell>
                            <TableCell>{item.averageBias.toFixed(2)}</TableCell>
                            <TableCell>
                                <Badge className={`${getBiasLabelAndColor(item.averageBias).color} text-white`}>
                                    {getBiasLabelAndColor(item.averageBias).label}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge className={`${getMisinformationLabelAndColor(item.averageMisinformationRisk).color} text-white`}>
                                    {getMisinformationLabelAndColor(item.averageMisinformationRisk).label}
                                </Badge>
                                ({item.averageMisinformationRisk.toFixed(2)})
                            </TableCell>
                            <TableCell>
                                <Badge className={`${getCredibilityLabelAndColor(item.averageCredibility).color} text-white`}>
                                    {getCredibilityLabelAndColor(item.averageCredibility).label}
                                </Badge>
                                ({item.averageCredibility.toFixed(2)})
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};