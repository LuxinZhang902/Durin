import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

function RiskTable({ nodes, onAccountSelect, selectedAccount }) {
  const [sortBy, setSortBy] = useState('risk_score')
  const [sortOrder, setSortOrder] = useState('desc')

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const sortedNodes = [...nodes].sort((a, b) => {
    let aVal = a[sortBy]
    let bVal = b[sortBy]

    if (sortBy === 'signals') {
      aVal = a.signals?.length || 0
      bVal = b.signals?.length || 0
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  const getRiskBadge = (score) => {
    if (score >= 7) {
      return (
        <span className="px-2 py-1 bg-risk-high/20 text-risk-high rounded text-xs font-semibold">
          High
        </span>
      )
    } else if (score >= 4) {
      return (
        <span className="px-2 py-1 bg-risk-medium/20 text-risk-medium rounded text-xs font-semibold">
          Medium
        </span>
      )
    } else {
      return (
        <span className="px-2 py-1 bg-risk-low/20 text-risk-low rounded text-xs font-semibold">
          Low
        </span>
      )
    }
  }

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    )
  }

  return (
    <div className="bg-dark-surface rounded-lg border border-dark-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-dark-border">
        <h3 className="font-semibold">Risk Assessment Table</h3>
        <p className="text-xs text-gray-400">{nodes.length} accounts analyzed</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-bg border-b border-dark-border">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center space-x-1">
                  <span>Account ID</span>
                  <SortIcon field="id" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center space-x-1">
                  <span>Type</span>
                  <SortIcon field="type" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('risk_score')}
              >
                <div className="flex items-center space-x-1">
                  <span>Risk Score</span>
                  <SortIcon field="risk_score" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-400 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('signals')}
              >
                <div className="flex items-center space-x-1">
                  <span>Signals</span>
                  <SortIcon field="signals" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {sortedNodes.map((node) => (
              <tr
                key={node.id}
                onClick={() => onAccountSelect(node.id)}
                className={`cursor-pointer transition-colors ${
                  selectedAccount === node.id
                    ? 'bg-accent-blue/10'
                    : 'hover:bg-dark-border/30'
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    {node.risk_score >= 7 && (
                      <AlertTriangle className="w-4 h-4 text-risk-high" />
                    )}
                    <span className="font-mono text-sm">{node.id}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-400 capitalize">
                    {node.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-dark-bg rounded-full h-2 max-w-[100px]">
                      <div
                        className={`h-2 rounded-full ${
                          node.risk_score >= 7
                            ? 'bg-risk-high'
                            : node.risk_score >= 4
                            ? 'bg-risk-medium'
                            : 'bg-risk-low'
                        }`}
                        style={{ width: `${(node.risk_score / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold w-8">
                      {node.risk_score.toFixed(1)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm">
                    {node.signals?.length || 0} detected
                  </span>
                </td>
                <td className="px-4 py-3">{getRiskBadge(node.risk_score)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {nodes.length === 0 && (
        <div className="px-4 py-12 text-center text-gray-400">
          <p>No data available</p>
        </div>
      )}
    </div>
  )
}

export default RiskTable
