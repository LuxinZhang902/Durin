import { useState } from 'react'
import { Upload, AlertTriangle, Shield, Network, FileText, Loader2, Sparkles, TrendingUp, Lock, Filter, Users, Globe2, ArrowRightLeft, Scale } from 'lucide-react'
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
  const [graphFilter, setGraphFilter] = useState('all') // 'all', 'user_to_user', 'cross_border', 'country_to_country', 'compliance_groups'

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
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-accent-blue/5 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="relative bg-dark-surface/80 backdrop-blur-xl border-b border-dark-border/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-blue to-accent-purple blur-lg opacity-50"></div>
                <Shield className="relative w-10 h-10 text-white drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-accent-blue via-accent-purple to-accent-blue bg-clip-text text-transparent animate-gradient">
                  FinShield AI
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Sparkles className="w-3 h-3 text-accent-purple" />
                  <p className="text-sm text-gray-400 font-medium">AI-Powered Fraud Detection Platform</p>
                </div>
              </div>
            </div>
            
            {analysisResults && (
              <div className="flex items-center space-x-4">
                <div className="bg-accent-blue/10 backdrop-blur-sm border border-accent-blue/30 rounded-xl px-6 py-3 text-center">
                  <div className="text-2xl font-bold text-accent-blue drop-shadow-lg">
                    {analysisResults.summary.total_accounts}
                  </div>
                  <div className="text-xs text-gray-400 font-medium">Accounts</div>
                </div>
                <div className="bg-accent-purple/10 backdrop-blur-sm border border-accent-purple/30 rounded-xl px-6 py-3 text-center">
                  <div className="text-2xl font-bold text-accent-purple drop-shadow-lg">
                    {analysisResults.summary.total_transactions}
                  </div>
                  <div className="text-xs text-gray-400 font-medium">Transactions</div>
                </div>
                <div className={`backdrop-blur-sm border rounded-xl px-6 py-3 text-center ${
                  analysisResults.summary.high_risk_count > 0 
                    ? 'bg-risk-high/10 border-risk-high/30' 
                    : 'bg-risk-low/10 border-risk-low/30'
                }`}>
                  <div className={`text-2xl font-bold drop-shadow-lg ${analysisResults.summary.high_risk_count > 0 ? 'text-risk-high' : 'text-risk-low'}`}>
                    {analysisResults.summary.high_risk_count}
                  </div>
                  <div className="text-xs text-gray-400 font-medium">High Risk</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Upload Section */}
        {!analysisResults && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4 mb-12">
              <div className="inline-flex items-center space-x-2 bg-accent-blue/10 border border-accent-blue/30 rounded-full px-4 py-2 mb-4">
                <Lock className="w-4 h-4 text-accent-blue" />
                <span className="text-sm font-medium text-accent-blue">Enterprise-Grade Security</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Detect Fraud Networks
                <br />
                <span className="bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
                  in Real-Time
                </span>
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Upload your KYC and transaction data to uncover hidden fraud patterns with AI-powered graph analysis
              </p>
            </div>

            <div className="relative bg-gradient-to-br from-dark-surface/90 to-dark-surface/50 backdrop-blur-xl rounded-2xl border border-dark-border/50 p-8 shadow-2xl">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-blue/5 rounded-full blur-3xl"></div>
              
              <div className="relative">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-2 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Upload Your Data</h3>
                </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <FileUpload
                  label="Users / KYC Data"
                  description="CSV with: user_id, user_name, device_id, ip, country"
                  onFileSelect={setUsersFile}
                  accept=".csv"
                />
                <FileUpload
                  label="Transactions Data"
                  description="CSV with: from, to, amount, timestamp, countries"
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
                  className="group relative w-full bg-gradient-to-r from-accent-blue via-accent-purple to-accent-blue bg-size-200 hover:bg-pos-100 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-accent-blue/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Analyzing Your Data...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      <span>Run AI Analysis</span>
                      <TrendingUp className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sample Data Info */}
            <div className="relative bg-gradient-to-br from-dark-surface/70 to-dark-surface/30 backdrop-blur-sm rounded-xl border border-dark-border/50 p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 rounded-full blur-2xl"></div>
              <div className="relative">
                <h3 className="font-bold mb-4 flex items-center space-x-2 text-lg">
                  <div className="p-1.5 bg-accent-blue/10 rounded-lg">
                    <FileText className="w-4 h-4 text-accent-blue" />
                  </div>
                  <span>Sample Data Available</span>
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  Demo CSV files are included in the <code className="bg-dark-bg/80 px-2 py-1 rounded text-accent-blue font-mono">/data</code> directory:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-dark-bg/50 border border-accent-purple/20 rounded-lg p-3">
                    <code className="text-accent-purple font-semibold">users.csv</code>
                    <p className="text-xs text-gray-500 mt-1">KYC data with shared devices/IPs</p>
                  </div>
                  <div className="bg-dark-bg/50 border border-accent-blue/20 rounded-lg p-3">
                    <code className="text-accent-blue font-semibold">transactions.csv</code>
                    <p className="text-xs text-gray-500 mt-1">Transactions with fraud patterns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {analysisResults && (
          <div className="space-y-6">
            {/* View Toggle and Filters */}
            <div className="flex items-center justify-between flex-wrap gap-4">
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

              {/* Graph Filters */}
              {activeView === 'graph' && (
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Filter:</span>
                  <div className="flex space-x-2 bg-dark-surface rounded-lg p-1 border border-dark-border">
                    <button
                      onClick={() => setGraphFilter('all')}
                      className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 text-sm ${
                        graphFilter === 'all'
                          ? 'bg-accent-purple text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <span>All</span>
                    </button>
                    <button
                      onClick={() => setGraphFilter('user_to_user')}
                      className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 text-sm ${
                        graphFilter === 'user_to_user'
                          ? 'bg-accent-purple text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>User→User</span>
                    </button>
                    <button
                      onClick={() => setGraphFilter('cross_border')}
                      className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 text-sm ${
                        graphFilter === 'cross_border'
                          ? 'bg-accent-purple text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Cross-Border</span>
                    </button>
                    <button
                      onClick={() => setGraphFilter('country_to_country')}
                      className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 text-sm ${
                        graphFilter === 'country_to_country'
                          ? 'bg-accent-purple text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Globe2 className="w-3.5 h-3.5" />
                      <span>Country→Country</span>
                    </button>
                    <button
                      onClick={() => setGraphFilter('compliance_groups')}
                      className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 text-sm ${
                        graphFilter === 'compliance_groups'
                          ? 'bg-accent-purple text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Compliance Groups</span>
                    </button>
                  </div>
                </div>
              )}

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
                    filter={graphFilter}
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
