import { useEffect, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

function GraphVisualization({ data, onNodeClick, selectedNode }) {
  const graphRef = useRef()
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    if (data && data.nodes && data.edges) {
      // Transform data for react-force-graph
      const nodes = data.nodes.map(node => ({
        id: node.id,
        name: node.id,
        type: node.type,
        risk_score: node.risk_score,
        signals: node.signals,
        val: Math.max(3, node.risk_score * 2) // Node size based on risk
      }))

      const links = data.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        value: edge.count,
        amount: edge.total_amount
      }))

      setGraphData({ nodes, links })
    }
  }, [data])

  useEffect(() => {
    // Auto-fit graph on load
    if (graphRef.current && graphData.nodes.length > 0) {
      setTimeout(() => {
        graphRef.current.zoomToFit(400, 50)
      }, 500)
    }
  }, [graphData])

  const getNodeColor = (node) => {
    if (node.id === selectedNode) {
      return '#8b5cf6' // Purple for selected
    }
    
    const score = node.risk_score || 0
    if (score >= 7) return '#ef4444' // Red - high risk
    if (score >= 4) return '#f59e0b' // Orange - medium risk
    return '#10b981' // Green - low risk
  }

  const getLinkColor = (link) => {
    return 'rgba(100, 100, 120, 0.3)'
  }

  const handleNodeClick = (node) => {
    if (onNodeClick) {
      onNodeClick(node.id)
    }
  }

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() * 1.2, 400)
    }
  }

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() / 1.2, 400)
    }
  }

  const handleFitView = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50)
    }
  }

  return (
    <div className="bg-dark-surface rounded-lg border border-dark-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-dark-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Fraud Network Graph</h3>
          <p className="text-xs text-gray-400">
            {graphData.nodes.length} nodes • {graphData.links.length} connections
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-dark-border rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-dark-border rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitView}
            className="p-2 hover:bg-dark-border rounded transition-colors"
            title="Fit View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Graph */}
      <div className="relative bg-dark-bg" style={{ height: '600px' }}>
        {graphData.nodes.length > 0 ? (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeLabel={(node) => `${node.id} (Risk: ${node.risk_score}/10)`}
            nodeColor={getNodeColor}
            linkColor={getLinkColor}
            linkWidth={1}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={0.005}
            onNodeClick={handleNodeClick}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.id
              const fontSize = 12 / globalScale
              const nodeRadius = node.val || 5

              // Draw node circle
              ctx.beginPath()
              ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI)
              ctx.fillStyle = getNodeColor(node)
              ctx.fill()

              // Draw border for selected node
              if (node.id === selectedNode) {
                ctx.strokeStyle = '#ffffff'
                ctx.lineWidth = 2 / globalScale
                ctx.stroke()
              }

              // Draw label
              ctx.font = `${fontSize}px Sans-Serif`
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillStyle = '#ffffff'
              ctx.fillText(label, node.x, node.y + nodeRadius + fontSize)
            }}
            cooldownTicks={100}
            onEngineStop={() => {
              if (graphRef.current) {
                graphRef.current.zoomToFit(400, 50)
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No graph data available</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-dark-border flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-risk-high"></div>
            <span className="text-gray-400">High Risk (7-10)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-risk-medium"></div>
            <span className="text-gray-400">Medium Risk (4-6)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-risk-low"></div>
            <span className="text-gray-400">Low Risk (0-3)</span>
          </div>
        </div>
        <div className="text-gray-500">
          Click nodes to view AI explanation
        </div>
      </div>
    </div>
  )
}

export default GraphVisualization
