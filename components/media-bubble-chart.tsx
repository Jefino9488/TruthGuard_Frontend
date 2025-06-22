"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Skeleton } from "@/components/ui/skeleton"

interface MediaSource {
  name: string
  bias: number // -1 (far left) to 1 (far right)
  reliability: number // 0 to 1
  reach: number // audience size, determines bubble size
  category: string // type of media
  articleCount?: number // number of articles from this source
  misinformationRisk?: number // risk of misinformation
}

// Fallback data in case the API fails
const fallbackData: MediaSource[] = [
  { name: "CNN", bias: -0.6, reliability: 0.7, reach: 80, category: "TV" },
  { name: "Fox News", bias: 0.8, reliability: 0.5, reach: 90, category: "TV" },
  { name: "Reuters", bias: 0, reliability: 0.95, reach: 50, category: "Wire" },
  { name: "BBC", bias: -0.2, reliability: 0.9, reach: 85, category: "TV" },
  { name: "NPR", bias: -0.3, reliability: 0.85, reach: 45, category: "Radio" },
]

export function MediaBubbleChart() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [mediaSources, setMediaSources] = useState<MediaSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch media landscape data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/media-landscape')

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.success && data.data && data.data.length > 0) {
          // Transform the data to match the MediaSource interface
          const transformedData = data.data.map((source: any) => ({
            name: source.name,
            // Convert bias from 0-1 scale to -1 to 1 scale
            bias: source.bias ? (source.bias * 2) - 1 : 0,
            reliability: source.reliability || 0.5,
            reach: source.reach || 30,
            category: source.category || 'Online',
            articleCount: source.articleCount,
            misinformationRisk: source.misinformationRisk
          }))

          setMediaSources(transformedData)
        } else {
          // Use fallback data if API returns empty data
          console.warn("API returned empty data, using fallback data")
          setMediaSources(fallbackData)
        }
      } catch (err) {
        console.error("Error fetching media landscape data:", err)
        setError("Failed to load media landscape data")
        // Use fallback data on error
        setMediaSources(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (!svgRef.current || !mediaSources.length || loading) return

    const width = 800
    const height = 600
    const margin = { top: 40, right: 40, bottom: 60, left: 60 }

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "100%")

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([-1, 1])
      .range([margin.left, width - margin.right])

    const yScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top])

    const radiusScale = d3
      .scaleSqrt()
      .domain([0, d3.max(mediaSources, (d) => d.reach) || 100])
      .range([5, 30])

    // Color scale for categories
    const colorScale = d3
      .scaleOrdinal()
      .domain(["TV", "Print", "Wire", "Online", "Radio"])
      .range(["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"])

    // Add background grid
    const xAxis = d3.axisBottom(xScale).tickSize(-height + margin.top + margin.bottom)
    const yAxis = d3.axisLeft(yScale).tickSize(-width + margin.left + margin.right)

    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll("line")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 0.5)

    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .selectAll("line")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 0.5)

    // Add axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Political Bias (Left ← → Right)")

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Reliability Score")

    // Add center lines
    svg
      .append("line")
      .attr("x1", xScale(0))
      .attr("x2", xScale(0))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#6b7280")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")

    // Add bubbles
    const bubbles = svg.selectAll(".bubble").data(mediaSources).enter().append("g").attr("class", "bubble")

    bubbles
      .append("circle")
      .attr("cx", (d) => xScale(d.bias))
      .attr("cy", (d) => yScale(d.reliability))
      .attr("r", (d) => radiusScale(d.reach))
      .attr("fill", (d) => colorScale(d.category) as string)
      .attr("opacity", 0.7)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 1)
        tooltip.transition().duration(200).style("opacity", 0.9)
        tooltip
          .html(
            `<strong>${d.name}</strong><br/>
             Category: ${d.category}<br/>
             Bias: ${d.bias > 0 ? "Right" : d.bias < 0 ? "Left" : "Center"} (${d.bias.toFixed(2)})<br/>
             Reliability: ${(d.reliability * 100).toFixed(0)}%<br/>
             Reach: ${d.reach}M`,
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.7)
        tooltip.transition().duration(500).style("opacity", 0)
      })

    // Add labels for major sources
    const majorSources = mediaSources.filter((d) => d.reach > 60)
    bubbles
      .filter((d) => majorSources.includes(d))
      .append("text")
      .attr("x", (d) => xScale(d.bias))
      .attr("y", (d) => yScale(d.reliability))
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text((d) => d.name.split(" ")[0]) // Show first word only

    // Add legend
    const legend = svg.append("g").attr("transform", `translate(${width - 150}, ${margin.top})`)

    const categories = Array.from(new Set(mediaSources.map((d) => d.category)))
    const legendItems = legend
      .selectAll(".legend-item")
      .data(categories)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`)

    legendItems
      .append("circle")
      .attr("r", 6)
      .attr("fill", (d) => colorScale(d) as string)

    legendItems
      .append("text")
      .attr("x", 12)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .attr("font-size", "12px")
      .text((d) => d)

    // Add quadrant labels
    svg
      .append("text")
      .attr("x", xScale(-0.5))
      .attr("y", yScale(0.9))
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "#6b7280")
      .text("High Reliability")

    svg
      .append("text")
      .attr("x", xScale(-0.5))
      .attr("y", yScale(0.85))
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#6b7280")
      .text("Left Bias")

    svg
      .append("text")
      .attr("x", xScale(0.5))
      .attr("y", yScale(0.9))
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "#6b7280")
      .text("High Reliability")

    svg
      .append("text")
      .attr("x", xScale(0.5))
      .attr("y", yScale(0.85))
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#6b7280")
      .text("Right Bias")

    return () => {
      // Cleanup tooltip
      d3.select("body").selectAll(".tooltip").remove()
    }
  }, [mediaSources, loading])

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
        <>
          <svg ref={svgRef} className="w-full h-full"></svg>
          <div className="mt-4 text-sm text-gray-500 text-center">
            <p>Bubble size represents audience reach. Hover over bubbles for detailed information.</p>
          </div>
        </>
      )}
    </div>
  )
}
