import { useState } from 'react'
import { Upload, AlertTriangle, Shield, Network, FileText, Loader2 } from 'lucide-react'
import FileUpload from './components/FileUpload'
import GraphVisualization from './components/GraphVisualization'
import RiskTable from './components/RiskTable'
import ExplanationPanel from './components/ExplanationPanel'
import { analyzeData, explainAccount } from './services/api'

function App() {
  const [usersFile, setUsersFile] = useState(null)
  const [transactionsFile, setTransactionsFile] = useState(null)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeView, setActiveView] = useState('graph') // 'graph' or 'table'

  const handleAnalyze = async () => {
    if (!usersFile || !transactionsFile) {
      setError('Please upload both users and transactions files')
      return
    }

    setLoading(true)
    setError(null)
    setAnalysisResults(null)
    setSelectedAccount(null)
    setExplanation(null)

    try {
      const results = await analyzeData(usersFile, transactionsFile)
      setAnalysisResults(results)
      
      // Auto-select first high-risk account if available
      if (results.high_risk_accounts && results.high_risk_accounts.length > 0) {
        const firstHighRisk = results.high_risk_accounts[0]
        handleAccountSelect(firstHighRisk.id)
      }
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAccountSelect = async (accountId) => {
    setSelectedAccount(accountId)
    setExplanation(null)

    try {
      const result = await explainAccount(accountId)
      setExplanation(result)
    } catch (err) {
      console.error('Failed to get explanation:', err)
      setExplanation({
        account_id: accountId,
        explanation: 'Failed to generate explanation. Please try again.',
        risk_score: 0
      })
    }
  }

  const getRiskColor = (score) => {
    if (score >= 7) return 'text-risk-high'
    if (score >= 4) return 'text-risk-medium'
    return 'text-risk-low'
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Header */}
      <header className="bg-dark-surface border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-accent-blue" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
                  FinShield AI
                </h1>
                <p className="text-sm text-gray-400">Trust Graph Demo – AI-Powered Fraud Detection</p>
              </div>
            </div>
            
            {analysisResults && (
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-blue">
                    {analysisResults.summary.total_accounts}
                  </div>
                  <div className="text-gray-400">Accounts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-purple">
                    {analysisResults.summary.total_transactions}
                  </div>
                  <div className="text-gray-400">Transactions</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${analysisResults.summary.high_risk_count > 0 ? 'text-risk-high' : 'text-risk-low'}`}>
                    {analysisResults.summary.high_risk_count}
                  </div>
                  <div className="text-gray-400">High Risk</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Upload Section */}
        {!analysisResults && (
          <div className="space-y-6">
            <div className="bg-dark-surface rounded-lg border border-dark-border p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Upload className="w-6 h-6 text-accent-blue" />
                <h2 className="text-xl font-semibold">Upload Data</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <FileUpload
                  label="Users / KYC Data"
                  description="CSV with: user_id, device_id, ip, country"
                  onFileSelect={setUsersFile}
                  accept=".csv"
                />
                <FileUpload
                  label="Transactions Data"
                  description="CSV with: from, to, amount, timestamp, device_id, ip"
                  onFileSelect={setTransactionsFile}
                  accept=".csv"
                />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-risk-high/10 border border-risk-high/30 rounded-lg flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-risk-high flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-risk-high">{error}</p>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading || !usersFile || !transactionsFile}
                className="w-full bg-gradient-to-r from-accent-blue to-accent-purple text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Network className="w-5 h-5" />
                    <span>Run Analysis</span>
                  </>
                )}
              </button>
            </div>

            {/* Sample Data Info */}
            <div className="bg-dark-surface/50 rounded-lg border border-dark-border p-6">
              <h3 className="font-semibold mb-3 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-accent-blue" />
                <span>Sample Data Available</span>
              </h3>
              <p className="text-sm text-gray-400 mb-2">
                Sample CSV files are available in the <code className="bg-dark-bg px-2 py-1 rounded text-accent-blue">/data</code> directory:
              </p>
              <ul className="text-sm text-gray-400 space-y-1 ml-4">
                <li>• <code className="text-accent-purple">users.csv</code> - Mock KYC data with shared devices/IPs</li>
                <li>• <code className="text-accent-purple">transactions.csv</code> - Mock transactions with fraud patterns</li>
              </ul>
            </div>
          </div>
        )}

        {/* Results Section */}
        {analysisResults && (
          <div className="space-y-6">
            {/* View Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2 bg-dark-surface rounded-lg p-1 border border-dark-border">
                <button
                  onClick={() => setActiveView('graph')}
                  className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                    activeView === 'graph'
                      ? 'bg-accent-blue text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Network className="w-4 h-4" />
                  <span>Graph View</span>
                </button>
                <button
                  onClick={() => setActiveView('table')}
                  className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                    activeView === 'table'
                      ? 'bg-accent-blue text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Table View</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setAnalysisResults(null)
                  setUsersFile(null)
                  setTransactionsFile(null)
                  setSelectedAccount(null)
                  setExplanation(null)
                }}
                className="px-4 py-2 bg-dark-surface border border-dark-border rounded-lg hover:bg-dark-border transition-colors"
              >
                New Analysis
              </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Visualization Area */}
              <div className="lg:col-span-2">
                {activeView === 'graph' ? (
                  <GraphVisualization
                    data={analysisResults}
                    onNodeClick={handleAccountSelect}
                    selectedNode={selectedAccount}
                  />
                ) : (
                  <RiskTable
                    nodes={analysisResults.nodes}
                    onAccountSelect={handleAccountSelect}
                    selectedAccount={selectedAccount}
                  />
                )}
              </div>

              {/* Explanation Panel */}
              <div className="lg:col-span-1">
                <ExplanationPanel
                  explanation={explanation}
                  selectedAccount={selectedAccount}
                  analysisResults={analysisResults}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-dark-border">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-500">
          <p>FinShield AI – Hackathon Demo • Built with React, FastAPI, NetworkX & OpenAI</p>
        </div>
      </footer>
    </div>
  )
}

export default App
