"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { sankey, sankeyLinkHorizontal } from 'd3-sankey'
import { Skeleton } from "@/components/ui/skeleton"

interface Node {
  id: string
  group: number
}

interface Link {
  source: string
  target: string
  value: number
}

interface Graph {
  nodes: Node[]
  links: Link[]
}

// Fallback data in case the API fails
const fallbackData: Graph = {
  nodes: [
    { id: "Initial Report", group: 1 },
    { id: "Economic Impact", group: 2 },
    { id: "Political Response", group: 3 },
    { id: "Public Reaction", group: 4 },
    { id: "Expert Analysis", group: 5 },
  ],
  links: [
    { source: "Initial Report", target: "Economic Impact", value: 5 },
    { source: "Initial Report", target: "Political Response", value: 8 },
    { source: "Initial Report", target: "Public Reaction", value: 6 },
    { source: "Economic Impact", target: "Expert Analysis", value: 4 },
    { source: "Political Response", target: "Public Reaction", value: 5 },
  ],
}

export function NarrativeFlow() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [data, setData] = useState<Graph | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch narrative flow data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/narrative-flow')

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const result = await response.json()

        if (result.success && result.data) {
          setData(result.data)
        } else {
          // Use fallback data if API returns empty data
          console.warn("API returned empty data, using fallback data")
          setData(fallbackData)
        }
      } catch (err) {
        console.error("Error fetching narrative flow data:", err)
        setError("Failed to load narrative flow data")
        // Use fallback data on error
        setData(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, []) // Empty dependency array means this effect runs once on mount

  // Function to detect and remove circular links
  const removeCircularLinks = (graph: Graph): Graph => {
    // Create a map of node ids for quick lookup
    const nodeMap = new Map<string, boolean>();
    graph.nodes.forEach(node => {
      nodeMap.set(node.id, true);
    });

    // Filter out problematic links
    const validLinks = graph.links.filter(link => {
      // Check if source and target are different (no self-loops)
      if (link.source === link.target) {
        console.warn(`Removed self-referencing link: ${link.source} -> ${link.target}`);
        return false;
      }

      // Check if both source and target nodes exist
      if (!nodeMap.has(link.source) || !nodeMap.has(link.target)) {
        console.warn(`Removed link with missing node: ${link.source} -> ${link.target}`);
        return false;
      }

      return true;
    });

    // Create a simple directed graph to check for cycles
    const graph2 = {};
    validLinks.forEach(link => {
      if (!graph2[link.source]) graph2[link.source] = [];
      graph2[link.source].push(link.target);
    });

    // Function to check if a link would create a cycle
    const wouldCreateCycle = (source: string, target: string, visited = new Set<string>()): boolean => {
      if (source === target) return true;
      if (visited.has(source)) return false;

      visited.add(source);
      const neighbors = graph2[source] || [];

      for (const neighbor of neighbors) {
        if (wouldCreateCycle(neighbor, target, visited)) {
          return true;
        }
      }

      return false;
    };

    // Filter out links that would create cycles
    const acyclicLinks = validLinks.filter(link => {
      // Check if adding this link would create a cycle
      if (wouldCreateCycle(link.target, link.source)) {
        console.warn(`Removed link that would create cycle: ${link.source} -> ${link.target}`);
        return false;
      }
      return true;
    });

    return {
      nodes: graph.nodes,
      links: acyclicLinks
    };
  };

  useEffect(() => {
    if (!svgRef.current || !data || loading) return

    const width = 800
    const height = 600

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "100%")

    // Create a Sankey diagram
    const sankeyGenerator = sankey()
      .nodeId((d: any) => d.id)
      .nodeWidth(15)
      .nodePadding(10)
      .extent([
        [1, 1],
        [width - 1, height - 5],
      ])

    // Remove circular links before passing to Sankey
    const cleanedData = removeCircularLinks(data);

    // Format the data for Sankey with error handling
    let sankeyData;
    try {
      sankeyData = sankeyGenerator({
        nodes: cleanedData.nodes.map((d) => Object.assign({}, d)),
        links: cleanedData.links.map((d) => Object.assign({}, d)),
      });
    } catch (err) {
      console.error("Error generating Sankey diagram:", err);
      // If there's still an error, use an even more simplified dataset
      // This is a fallback in case our cycle detection missed something
      const minimalData = {
        nodes: cleanedData.nodes,
        links: [] // No links = no cycles
      };
      sankeyData = sankeyGenerator({
        nodes: minimalData.nodes.map((d) => Object.assign({}, d)),
        links: minimalData.links,
      });
    }

    // Color scale for different groups
    const color = d3.scaleOrdinal(d3.schemeCategory10)

    // Add links
    const link = svg
      .append("g")
      .selectAll("path")
      .data(sankeyData.links)
      .enter()
      .append("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d: any) => color(d.source.group.toString()))
      .attr("stroke-width", (d: any) => Math.max(1, d.width))
      .attr("stroke-opacity", 0.5)
      .attr("fill", "none")
      .append("title")
      .text((d: any) => `${d.source.id} → ${d.target.id}\nValue: ${d.value}`)

    // Add nodes
    const node = svg
      .append("g")
      .selectAll("rect")
      .data(sankeyData.nodes)
      .enter()
      .append("rect")
      .attr("x", (d: any) => d.x0)
      .attr("y", (d: any) => d.y0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("fill", (d: any) => color(d.group.toString()))
      .attr("stroke", "#000")
      .append("title")
      .text((d: any) => `${d.id}\nValue: ${d.value}`)

    // Add node labels
    const nodeText = svg
      .append("g")
      .selectAll("text")
      .data(sankeyData.nodes)
      .enter()
      .append("text")
      .attr("x", (d: any) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d: any) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) => (d.x0 < width / 2 ? "start" : "end"))
      .text((d: any) => d.id)
      .attr("font-size", "10px")
      .attr("font-weight", "bold")

    return () => {
      // Cleanup
    }
  }, [data, loading])

  return (
    <div className="w-full h-[600px] overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <Skeleton className="h-[500px] w-full" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <svg ref={svgRef} className="w-full h-full"></svg>
      )}
    </div>
  )
}
