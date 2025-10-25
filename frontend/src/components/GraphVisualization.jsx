import { useEffect, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

function GraphVisualization({ data, onNodeClick, selectedNode, filter = 'all' }) {
  const graphRef = useRef()
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    if (data && data.nodes && data.edges) {
      // Define compliance groups
      const complianceGroups = {
        'FATF_STRICT': ['United States', 'United Kingdom', 'Singapore'],
        'EU_FRAMEWORK': ['United Kingdom', 'France', 'Germany', 'Spain', 'Italy', 'Netherlands', 'Sweden'],
        'NORTH_AMERICA': ['United States', 'Canada'],
        'EU_CORE': ['France', 'Germany', 'Netherlands'],
        'EU_SOUTH': ['Spain', 'Italy'],
        'EU_NORTH': ['Sweden', 'United Kingdom']
      }

      // Filter edges based on transaction type
      let filteredEdges = data.edges
      let filteredNodes = data.nodes

      if (filter === 'compliance_groups') {
        // Show only country nodes and create edges between countries with similar compliance
        const countryNodes = data.nodes.filter(node => node.type === 'country')
        filteredNodes = countryNodes

        // Create virtual edges between countries in same compliance groups
        const complianceEdges = []
        Object.entries(complianceGroups).forEach(([groupName, countries]) => {
          const groupCountryNodes = countryNodes.filter(node => 
            countries.includes(node.country)
          )
          
          // Create edges between all countries in this group
          for (let i = 0; i < groupCountryNodes.length; i++) {
            for (let j = i + 1; j < groupCountryNodes.length; j++) {
              complianceEdges.push({
                source: groupCountryNodes[i].id,
                target: groupCountryNodes[j].id,
                transaction_type: 'compliance_group',
                edge_type: 'compliance_similarity',
                compliance_group: groupName,
                count: 1,
                total_amount: 0
              })
            }
          }
        })
        
        filteredEdges = complianceEdges
      } else if (filter !== 'all') {
        filteredEdges = data.edges.filter(edge => {
          if (filter === 'user_to_user') {
            return edge.transaction_type === 'user_to_user' || edge.edge_type === 'located_in'
          } else if (filter === 'cross_border') {
            return edge.transaction_type === 'cross_border' || edge.edge_type === 'located_in'
          } else if (filter === 'country_to_country') {
            return edge.transaction_type === 'country_to_country' || edge.edge_type === 'located_in'
          }
          return true
        })

        // Get nodes that are connected by filtered edges
        const connectedNodeIds = new Set()
        filteredEdges.forEach(edge => {
          connectedNodeIds.add(edge.source)
          connectedNodeIds.add(edge.target)
        })

        // Filter nodes to only show connected ones
        filteredNodes = data.nodes.filter(node => connectedNodeIds.has(node.id))
      }

      // Transform data for react-force-graph
      const nodes = filteredNodes.map(node => ({
        id: node.id,
        name: node.name || node.id,
        type: node.type,
        risk_score: node.risk_score,
        signals: node.signals,
        country: node.country,
        user_count: node.user_count,
        // Node size: larger for countries, based on risk for others
        val: node.type === 'country' ? 15 : Math.max(3, node.risk_score * 2)
      }))

      const links = filteredEdges.map(edge => ({
        source: edge.source,
        target: edge.target,
        value: edge.count,
        amount: edge.total_amount,
        transaction_type: edge.transaction_type,
        edge_type: edge.edge_type
      }))

      setGraphData({ nodes, links })
    }
  }, [data, filter])

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
    
    // Country nodes get a special color
    if (node.type === 'country') {
      return '#3b82f6' // Blue for countries
    }
    
    const score = node.risk_score || 0
    if (score >= 7) return '#ef4444' // Red - high risk
    if (score >= 4) return '#f59e0b' // Orange - medium risk
    return '#10b981' // Green - low risk
  }

  const getLinkColor = (link) => {
    // Compliance group edges get special colors
    if (link.edge_type === 'compliance_similarity') {
      if (link.compliance_group === 'FATF_STRICT') {
        return 'rgba(59, 130, 246, 0.6)' // Blue for FATF strict countries
      } else if (link.compliance_group === 'EU_FRAMEWORK') {
        return 'rgba(139, 92, 246, 0.6)' // Purple for EU framework
      } else if (link.compliance_group === 'NORTH_AMERICA') {
        return 'rgba(34, 197, 94, 0.6)' // Green for North America
      } else if (link.compliance_group === 'EU_CORE') {
        return 'rgba(251, 146, 60, 0.6)' // Orange for EU Core (France, Germany, Netherlands)
      } else if (link.compliance_group === 'EU_SOUTH') {
        return 'rgba(236, 72, 153, 0.6)' // Pink for EU South (Spain, Italy)
      } else if (link.compliance_group === 'EU_NORTH') {
        return 'rgba(14, 165, 233, 0.6)' // Sky blue for EU North (Sweden, UK)
      }
    }
    
    // Located_in edges are lighter
    if (link.edge_type === 'located_in') {
      return 'rgba(100, 100, 120, 0.2)'
    }
    
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
          <h3 className="font-semibold">
            {filter === 'compliance_groups' ? 'Compliance Framework Groups' : 'Fraud Network Graph'}
          </h3>
          <p className="text-xs text-gray-400">
            {graphData.nodes.length} nodes • {graphData.links.length} connections
          </p>
          {filter === 'compliance_groups' && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center flex-wrap gap-3">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-0.5 bg-blue-500"></div>
                  <span className="text-xs text-gray-500">FATF Strict</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-0.5 bg-purple-500"></div>
                  <span className="text-xs text-gray-500">EU Framework</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-0.5 bg-green-500"></div>
                  <span className="text-xs text-gray-500">North America</span>
                </div>
              </div>
              <div className="flex items-center flex-wrap gap-3">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-0.5 bg-orange-400"></div>
                  <span className="text-xs text-gray-500">EU Core</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-0.5 bg-pink-500"></div>
                  <span className="text-xs text-gray-500">EU South</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-0.5 bg-sky-500"></div>
                  <span className="text-xs text-gray-500">EU North</span>
                </div>
              </div>
            </div>
          )}
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
            nodeLabel={(node) => {
              if (filter === 'compliance_groups' && node.type === 'country') {
                return `${node.country} - Click to learn about compliance regulations`
              }
              return `${node.name || node.id} (Risk: ${node.risk_score}/10)`
            }}
            nodeColor={getNodeColor}
            linkColor={getLinkColor}
            linkWidth={1}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={0.005}
            onNodeClick={handleNodeClick}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const nodeRadius = node.val || 5
              const fontSize = node.type === 'country' ? 14 / globalScale : 12 / globalScale

              // Draw node circle
              ctx.beginPath()
              ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI)
              ctx.fillStyle = getNodeColor(node)
              ctx.fill()

              // Draw border for selected node or country nodes
              if (node.id === selectedNode) {
                ctx.strokeStyle = '#ffffff'
                ctx.lineWidth = 3 / globalScale
                ctx.stroke()
              } else if (node.type === 'country') {
                ctx.strokeStyle = '#60a5fa'
                ctx.lineWidth = 2 / globalScale
                ctx.stroke()
              }

              // Draw label
              ctx.font = `${node.type === 'country' ? 'bold ' : ''}${fontSize}px Sans-Serif`
              const label = node.type === 'country' ? `🌍 ${node.name}` : (node.name || node.id)
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
