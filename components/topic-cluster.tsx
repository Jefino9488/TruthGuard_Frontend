"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Skeleton } from "@/components/ui/skeleton"

interface Node {
  id: string
  group: number
  value: number
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
    { id: "Economy", group: 1, value: 25 },
    { id: "Politics", group: 2, value: 30 },
    { id: "Climate", group: 3, value: 20 },
    { id: "Healthcare", group: 4, value: 18 },
    { id: "Technology", group: 5, value: 22 },
  ],
  links: [
    { source: "Economy", target: "Politics", value: 5 },
    { source: "Climate", target: "Politics", value: 4 },
    { source: "Healthcare", target: "Politics", value: 4 },
    { source: "Technology", target: "Economy", value: 3 },
  ],
}

export function TopicCluster() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [data, setData] = useState<Graph | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch topic clusters data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/topic-clusters')

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
        console.error("Error fetching topic clusters data:", err)
        setError("Failed to load topic clusters data")
        // Use fallback data on error
        setData(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (!svgRef.current || !data || loading) return

    const width = 800
    const height = 500

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "100%")

    // Color scale for different groups
    const color = d3.scaleOrdinal(d3.schemeCategory10)

    // Create a force simulation
    const simulation = d3
      .forceSimulation(data.nodes as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink(data.links)
          .id((d: any) => d.id)
          .distance((d: any) => 100 / d.value),
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d: any) => d.value + 10),
      )

    // Create links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.sqrt(d.value))

    // Create nodes
    const node = svg
      .append("g")
      .selectAll("g")
      .data(data.nodes)
      .enter()
      .append("g")
      .call(d3.drag<SVGGElement, Node>().on("start", dragstarted).on("drag", dragged).on("end", dragended) as any)

    // Add circles to nodes
    node
      .append("circle")
      .attr("r", (d) => d.value * 0.8)
      .attr("fill", (d) => color(d.group.toString()))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)

    // Add labels to nodes
    node
      .append("text")
      .text((d) => d.id)
      .attr("x", 0)
      .attr("y", (d) => -d.value - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    })

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event: any, d: any) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    return () => {
      simulation.stop()
    }
  }, [data, loading])

  return (
    <div className="w-full h-[500px] overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <Skeleton className="h-[400px] w-full" />
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
