import { Brain, AlertCircle, TrendingUp, Users, Wifi, Smartphone, Loader2 } from 'lucide-react'

function ExplanationPanel({ explanation, selectedAccount, analysisResults }) {
  if (!selectedAccount) {
    return (
      <div className="bg-dark-surface rounded-lg border border-dark-border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-5 h-5 text-accent-purple" />
          <h3 className="font-semibold">AI Explanation</h3>
        </div>
        <div className="text-center py-12 text-gray-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select an account to view AI-generated risk explanation</p>
        </div>
      </div>
    )
  }

  // Find account details
  const accountNode = analysisResults?.nodes?.find(n => n.id === selectedAccount)
  
  if (!accountNode) {
    return (
      <div className="bg-dark-surface rounded-lg border border-dark-border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-5 h-5 text-accent-purple" />
          <h3 className="font-semibold">AI Explanation</h3>
        </div>
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">Account not found</p>
        </div>
      </div>
    )
  }

  const getRiskColor = (score) => {
    if (score >= 7) return 'text-risk-high'
    if (score >= 4) return 'text-risk-medium'
    return 'text-risk-low'
  }

  const getSignalIcon = (signalType) => {
    switch (signalType) {
      case 'shared_device':
        return <Smartphone className="w-4 h-4" />
      case 'shared_ip':
        return <Wifi className="w-4 h-4" />
      case 'structuring':
        return <TrendingUp className="w-4 h-4" />
      case 'circular_flow':
        return <Users className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getSeverityBadge = (severity) => {
    const colors = {
      high: 'bg-risk-high/20 text-risk-high',
      medium: 'bg-risk-medium/20 text-risk-medium',
      low: 'bg-risk-low/20 text-risk-low'
    }
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors[severity] || colors.medium}`}>
        {severity}
      </span>
    )
  }

  return (
    <div className="bg-dark-surface rounded-lg border border-dark-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-dark-border bg-gradient-to-r from-accent-blue/10 to-accent-purple/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-accent-purple" />
            <h3 className="font-semibold">AI Risk Analysis</h3>
          </div>
          <div className={`text-2xl font-bold ${getRiskColor(accountNode.risk_score)}`}>
            {accountNode.risk_score.toFixed(1)}/10
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {accountNode.name && (
            <p className="text-sm font-medium text-white">{accountNode.name}</p>
          )}
          <p className="text-xs text-gray-400 font-mono">{selectedAccount}</p>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        {/* AI Explanation */}
        {explanation ? (
          <div className="bg-dark-bg rounded-lg p-4 border border-dark-border">
            <div className="flex items-start space-x-2 mb-2">
              <Brain className="w-4 h-4 text-accent-purple mt-0.5 flex-shrink-0" />
              <h4 className="text-sm font-semibold">AI Explanation</h4>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {explanation.explanation}
            </p>
          </div>
        ) : (
          <div className="bg-dark-bg rounded-lg p-4 border border-dark-border">
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Generating explanation...</span>
            </div>
          </div>
        )}

        {/* Detected Signals */}
        {accountNode.signals && accountNode.signals.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-accent-blue" />
              <span>Detected Signals ({accountNode.signals.length})</span>
            </h4>
            <div className="space-y-2">
              {accountNode.signals.map((signal, idx) => (
                <div
                  key={idx}
                  className="bg-dark-bg rounded-lg p-3 border border-dark-border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="text-accent-blue">
                        {getSignalIcon(signal.type)}
                      </div>
                      <span className="text-sm font-medium capitalize">
                        {signal.type.replace('_', ' ')}
                      </span>
                    </div>
                    {getSeverityBadge(signal.severity)}
                  </div>
                  <p className="text-xs text-gray-400 ml-6">
                    {signal.details}
                  </p>
                  
                  {/* Additional signal details */}
                  {signal.transaction_count && (
                    <div className="mt-2 ml-6 text-xs text-gray-500">
                      {signal.transaction_count} transactions
                    </div>
                  )}
                  {signal.amounts && signal.amounts.length > 0 && (
                    <div className="mt-1 ml-6 text-xs text-gray-500">
                      Amounts: ${signal.amounts.join(', $')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Metadata */}
        {(accountNode.device_id || accountNode.ip || accountNode.country) && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Account Details</h4>
            <div className="bg-dark-bg rounded-lg p-3 border border-dark-border space-y-2 text-xs">
              {accountNode.device_id && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Device ID:</span>
                  <span className="font-mono">{accountNode.device_id}</span>
                </div>
              )}
              {accountNode.ip && (
                <div className="flex justify-between">
                  <span className="text-gray-400">IP Address:</span>
                  <span className="font-mono">{accountNode.ip}</span>
                </div>
              )}
              {accountNode.country && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Country:</span>
                  <span className="font-mono">{accountNode.country}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="capitalize">{accountNode.type}</span>
              </div>
            </div>
          </div>
        )}

        {/* Risk Score Breakdown */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Risk Assessment</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Overall Risk</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-dark-bg rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      accountNode.risk_score >= 7
                        ? 'bg-risk-high'
                        : accountNode.risk_score >= 4
                        ? 'bg-risk-medium'
                        : 'bg-risk-low'
                    }`}
                    style={{ width: `${(accountNode.risk_score / 10) * 100}%` }}
                  ></div>
                </div>
                <span className={`font-bold ${getRiskColor(accountNode.risk_score)}`}>
                  {accountNode.risk_score.toFixed(1)}
                </span>
              </div>
            </div>
            
            {accountNode.risk_score >= 7 && (
              <div className="bg-risk-high/10 border border-risk-high/30 rounded-lg p-3">
                <p className="text-xs text-risk-high">
                  <strong>⚠️ High Risk:</strong> Immediate review recommended. Multiple fraud indicators detected.
                </p>
              </div>
            )}
            {accountNode.risk_score >= 4 && accountNode.risk_score < 7 && (
              <div className="bg-risk-medium/10 border border-risk-medium/30 rounded-lg p-3">
                <p className="text-xs text-risk-medium">
                  <strong>⚡ Medium Risk:</strong> Enhanced monitoring suggested. Some suspicious patterns identified.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExplanationPanel
