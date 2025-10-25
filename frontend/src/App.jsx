import { useState, useEffect } from 'react'
import { Upload, AlertTriangle, Shield, Network, FileText, Loader2, Sparkles, TrendingUp, Lock, Filter, Users, Globe2, ArrowRightLeft, Scale, User as UserIcon, Download, CreditCard, X, CheckCircle, Wifi, ChevronRight, LogOut, UserCircle, ChevronDown } from 'lucide-react'
import FileUpload from './components/FileUpload'
import GraphVisualization from './components/GraphVisualization'
import RiskTable from './components/RiskTable'
import ExplanationPanel from './components/ExplanationPanel'
import Logo from './components/Logo'
import SignUp from './pages/SignUp'
import BankImport from './pages/BankImport'
import BankPortal from './pages/BankPortal'
import UserProfile from './pages/UserProfile'
import { analyzeData, explainAccount } from './services/api'

function App() {
  const [currentPage, setCurrentPage] = useState('signup') // 'signup', 'bankimport', 'bank', 'main', 'profile'
  const [userData, setUserData] = useState(null)
  const [selectedBank, setSelectedBank] = useState(null)
  const [showVirtualCardModal, setShowVirtualCardModal] = useState(false)
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 })
  const [isCardHovered, setIsCardHovered] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [usersFile, setUsersFile] = useState(null)
  const [transactionsFile, setTransactionsFile] = useState(null)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [explanation, setExplanation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeView, setActiveView] = useState('graph') // 'graph' or 'table'
  const [graphFilter, setGraphFilter] = useState('all') // 'all', 'user_to_user', 'cross_border', 'country_to_country', 'compliance_groups'

  const handleSignUpComplete = (data) => {
    setUserData(data)
    setCurrentPage('bankimport')
  }

  const handleBankSelected = (bank) => {
    setSelectedBank(bank)
    setCurrentPage('bank')
  }

  const handleBackToProfile = () => {
    setCurrentPage('signup')
  }

  const handleBackToBankSelection = () => {
    setCurrentPage('bankimport')
  }

  const handleBankLogin = () => {
    setCurrentPage('main')
  }

  const handleUpdateProfile = (updatedData) => {
    setUserData(updatedData)
  }

  const handleOpenProfile = () => {
    setCurrentPage('profile')
  }

  const handleCloseProfile = () => {
    setCurrentPage('main')
  }

  const handleLogout = () => {
    // Clear all user data and analysis results
    setUserData(null)
    setSelectedBank(null)
    setUsersFile(null)
    setTransactionsFile(null)
    setAnalysisResults(null)
    setSelectedAccount(null)
    setExplanation(null)
    setShowUserMenu(false)
    setCurrentPage('signup')
  }

  const handleSwitchUser = () => {
    // Keep analysis results but go back to signup
    setUserData(null)
    setSelectedBank(null)
    setShowUserMenu(false)
    setCurrentPage('signup')
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  const handleCardMouseMove = (e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 10
    const rotateY = (centerX - x) / 10
    setCardRotate({ x: rotateX, y: rotateY })
  }

  const handleCardMouseLeave = () => {
    setCardRotate({ x: 0, y: 0 })
    setIsCardHovered(false)
  }

  const handleGenerateReport = () => {
    if (!analysisResults) return
    
    // Get high risk accounts
    const highRiskAccounts = analysisResults.accounts 
      ? analysisResults.accounts.filter(acc => acc.risk_score >= 7)
      : []
    
    const highRiskSection = highRiskAccounts.length > 0
      ? highRiskAccounts.map(acc => 
          `Account: ${acc.account_id} | Risk Score: ${acc.risk_score}/10 | Signals: ${acc.risk_signals?.join(', ') || 'N/A'}`
        ).join('\n')
      : 'No high-risk accounts detected'
    
    // Create a simple text report
    const report = `
FRAUD DETECTION ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}
================================

SUMMARY
-------
Total Accounts: ${analysisResults.summary?.total_accounts || 0}
Total Transactions: ${analysisResults.summary?.total_transactions || 0}
High Risk Accounts: ${analysisResults.summary?.high_risk_count || 0}
Medium Risk Accounts: ${analysisResults.summary?.medium_risk_count || 0}
Low Risk Accounts: ${analysisResults.summary?.low_risk_count || 0}

HIGH RISK ACCOUNTS
------------------
${highRiskSection}

DETECTED PATTERNS
-----------------
${analysisResults.summary?.detected_patterns?.join('\n') || 'No patterns detected'}

NETWORK ANALYSIS
----------------
Total Nodes: ${analysisResults.graph?.nodes?.length || 0}
Total Connections: ${analysisResults.graph?.edges?.length || 0}

================================
Report generated by Durin Fraud Detection System
    `.trim()

    // Create and download the report
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fraud-report-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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

  // Show sign-up page first
  if (currentPage === 'signup') {
    return <SignUp onSignUpComplete={handleSignUpComplete} />
  }

  // Then show bank import selection
  if (currentPage === 'bankimport') {
    return <BankImport onBankSelected={handleBankSelected} onBack={handleBackToProfile} />
  }

  // Then show bank portal
  if (currentPage === 'bank') {
    return <BankPortal onLogin={handleBankLogin} selectedBank={selectedBank} onBackToBankSelection={handleBackToBankSelection} />
  }

  // Show user profile
  if (currentPage === 'profile') {
    return <UserProfile userData={userData} onUpdateProfile={handleUpdateProfile} onClose={handleCloseProfile} />
  }

  // Finally show main app
  return (
    <div className="min-h-screen bg-dark-bg text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent-blue/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent-purple/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-accent-cyan/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

      {/* Header */}
      <header className="relative bg-dark-surface/40 backdrop-blur-2xl border-b border-dark-border/30 shadow-glass">
        <div className="max-w-[1400px] mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} />
            
            <div className="flex items-center space-x-4">
              {/* User Profile with Dropdown */}
              {userData && (
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 bg-glass backdrop-blur-xl border border-dark-border/30 rounded-2xl px-4 py-2 shadow-glass hover:border-accent-cyan/40 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
                      {userData.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold">{userData.fullName}</p>
                      <p className="text-xs text-gray-500">{userData.occupation || userData.email}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 group-hover:text-accent-cyan transition-all ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-dark-surface border border-dark-border/50 rounded-2xl shadow-2xl overflow-hidden z-[100]"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <div className="p-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowUserMenu(false)
                            handleOpenProfile()
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-glass transition-all group text-left cursor-pointer"
                          type="button"
                        >
                          <UserCircle className="w-5 h-5 text-gray-400 group-hover:text-accent-cyan transition-colors" />
                          <div>
                            <p className="text-sm font-semibold text-white">View Profile</p>
                            <p className="text-xs text-gray-500">Manage your account</p>
                          </div>
                        </button>

                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleSwitchUser()
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-glass transition-all group text-left cursor-pointer"
                          type="button"
                        >
                          <Users className="w-5 h-5 text-gray-400 group-hover:text-accent-blue transition-colors" />
                          <div>
                            <p className="text-sm font-semibold text-white">Switch User</p>
                            <p className="text-xs text-gray-500">Login as another user</p>
                          </div>
                        </button>

                        <div className="my-2 border-t border-dark-border/30"></div>

                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleLogout()
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-risk-high/10 transition-all group text-left cursor-pointer"
                          type="button"
                        >
                          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-risk-high transition-colors" />
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-risk-high transition-colors">Logout</p>
                            <p className="text-xs text-gray-500">Sign out of your account</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {analysisResults && (
                <div className="flex items-center space-x-3">
                <div className="bg-glass backdrop-blur-xl border border-accent-blue/20 rounded-2xl px-5 py-3 shadow-glass hover:border-accent-blue/40 transition-all">
                  <div className="text-xl font-bold text-accent-blue">
                    {analysisResults.summary.total_accounts}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Accounts</div>
                </div>
                <div className="bg-glass backdrop-blur-xl border border-accent-purple/20 rounded-2xl px-5 py-3 shadow-glass hover:border-accent-purple/40 transition-all">
                  <div className="text-xl font-bold text-accent-purple">
                    {analysisResults.summary.total_transactions}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Transactions</div>
                </div>
                <div className={`bg-glass backdrop-blur-xl border rounded-2xl px-5 py-3 shadow-glass transition-all ${
                  analysisResults.summary.high_risk_count > 0 
                    ? 'border-risk-high/20 hover:border-risk-high/40' 
                    : 'border-risk-low/20 hover:border-risk-low/40'
                }`}>
                  <div className={`text-xl font-bold ${analysisResults.summary.high_risk_count > 0 ? 'text-risk-high' : 'text-risk-low'}`}>
                    {analysisResults.summary.high_risk_count}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">High Risk</div>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-[1400px] mx-auto px-8 py-10">
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

            {/* Download User's Data Section */}
            <div className="relative bg-glass backdrop-blur-2xl rounded-3xl border border-accent-cyan/20 p-8 shadow-glass overflow-hidden mb-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/10 rounded-full blur-[80px]"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-accent-cyan/10 rounded-xl border border-accent-cyan/20">
                      <Download className="w-5 h-5 text-accent-cyan" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Download User's Data</h3>
                      <p className="text-xs text-gray-500">Download your data files to begin fraud analysis</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Users CSV Download */}
                  <a
                    href="/data/users.csv"
                    download="users.csv"
                    className="flex items-center justify-between p-4 bg-dark-card/50 border border-dark-border/30 rounded-xl hover:border-accent-cyan/40 hover:bg-dark-card transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-accent-purple/10 rounded-lg">
                        <FileText className="w-5 h-5 text-accent-purple" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">users.csv</p>
                        <p className="text-xs text-gray-500">KYC data with user information</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-gray-500 group-hover:text-accent-cyan transition-colors" />
                  </a>

                  {/* Transactions CSV Download */}
                  <a
                    href="/data/transactions.csv"
                    download="transactions.csv"
                    className="flex items-center justify-between p-4 bg-dark-card/50 border border-dark-border/30 rounded-xl hover:border-accent-cyan/40 hover:bg-dark-card transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-accent-blue/10 rounded-lg">
                        <FileText className="w-5 h-5 text-accent-blue" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">transactions.csv</p>
                        <p className="text-xs text-gray-500">Transaction records with patterns</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-gray-500 group-hover:text-accent-cyan transition-colors" />
                  </a>
                </div>

                <div className="mt-4 p-3 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
                  <p className="text-xs text-gray-400 text-center">
                    💡 Tip: Download these files first, then upload them below to see the fraud detection in action
                  </p>
                </div>
              </div>
            </div>

            <div className="relative bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-10 shadow-glass overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent-purple/10 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-blue/10 rounded-full blur-[100px]"></div>
              
              <div className="relative">
                <div className="flex items-center space-x-3 mb-10">
                  <div className="p-3 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl shadow-glow-blue">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Upload Your Data</h3>
                    <p className="text-sm text-gray-500">CSV files with user and transaction information</p>
                  </div>
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
                <div className="mb-6 p-4 bg-risk-high/10 backdrop-blur-xl border border-risk-high/30 rounded-2xl flex items-start space-x-3 shadow-glass">
                  <AlertTriangle className="w-5 h-5 text-risk-high flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-risk-high font-medium">{error}</p>
                </div>
              )}

                <button
                  onClick={handleAnalyze}
                  disabled={loading || !usersFile || !transactionsFile}
                  className="group relative w-full bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan text-white py-5 px-8 rounded-2xl font-bold text-lg shadow-glow-blue hover:shadow-glow-purple transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-3 overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  <div className="relative flex items-center space-x-3">
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
                  </div>
                </button>
              </div>
            </div>

            {/* Sample Data Info */}
            <div className="relative bg-glass backdrop-blur-xl rounded-2xl border border-dark-border/30 p-6 overflow-hidden shadow-glass">
              <div className="absolute top-0 right-0 w-40 h-40 bg-accent-cyan/10 rounded-full blur-[60px]"></div>
              <div className="relative">
                <h3 className="font-bold mb-4 flex items-center space-x-2 text-base">
                  <div className="p-2 bg-accent-cyan/10 rounded-xl border border-accent-cyan/20">
                    <FileText className="w-4 h-4 text-accent-cyan" />
                  </div>
                  <span>Sample Data Available</span>
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Demo CSV files are included in the <code className="bg-dark-card/80 px-2 py-1 rounded text-accent-cyan font-mono text-xs">/data</code> directory:
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-dark-card/50 backdrop-blur-sm border border-accent-purple/20 rounded-xl p-4 hover:border-accent-purple/40 transition-all">
                    <code className="text-accent-purple font-semibold text-sm">users.csv</code>
                    <p className="text-xs text-gray-500 mt-1.5">KYC data with shared devices/IPs</p>
                  </div>
                  <div className="bg-dark-card/50 backdrop-blur-sm border border-accent-blue/20 rounded-xl p-4 hover:border-accent-blue/40 transition-all">
                    <code className="text-accent-blue font-semibold text-sm">transactions.csv</code>
                    <p className="text-xs text-gray-500 mt-1.5">Transactions with fraud patterns</p>
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
              <div className="flex space-x-1 bg-dark-card/50 backdrop-blur-xl rounded-2xl p-1.5 border border-dark-border/30 shadow-glass">
                <button
                  onClick={() => setActiveView('graph')}
                  className={`px-5 py-2.5 rounded-xl transition-all flex items-center space-x-2 font-medium ${
                    activeView === 'graph'
                      ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-glow-blue'
                      : 'text-gray-400 hover:text-white hover:bg-dark-surface/50'
                  }`}
                >
                  <Network className="w-4 h-4" />
                  <span>Graph View</span>
                </button>
                <button
                  onClick={() => setActiveView('table')}
                  className={`px-5 py-2.5 rounded-xl transition-all flex items-center space-x-2 font-medium ${
                    activeView === 'table'
                      ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-glow-blue'
                      : 'text-gray-400 hover:text-white hover:bg-dark-surface/50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Table View</span>
                </button>
              </div>

              {/* Graph Filters */}
              {activeView === 'graph' && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-accent-cyan" />
                    <span className="text-sm text-gray-400 font-medium">Filter:</span>
                  </div>
                  <div className="flex space-x-1.5 bg-dark-card/50 backdrop-blur-xl rounded-2xl p-1.5 border border-dark-border/30 shadow-glass">
                    <button
                      onClick={() => setGraphFilter('all')}
                      className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 text-xs font-medium ${
                        graphFilter === 'all'
                          ? 'bg-gradient-to-r from-accent-purple to-accent-blue text-white shadow-glow-purple'
                          : 'text-gray-400 hover:text-white hover:bg-dark-surface/50'
                      }`}
                    >
                      <span>All</span>
                    </button>
                    <button
                      onClick={() => setGraphFilter('user_to_user')}
                      className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 text-xs font-medium ${
                        graphFilter === 'user_to_user'
                          ? 'bg-gradient-to-r from-accent-purple to-accent-blue text-white shadow-glow-purple'
                          : 'text-gray-400 hover:text-white hover:bg-dark-surface/50'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>User→User</span>
                    </button>
                    <button
                      onClick={() => setGraphFilter('cross_border')}
                      className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 text-xs font-medium ${
                        graphFilter === 'cross_border'
                          ? 'bg-gradient-to-r from-accent-purple to-accent-blue text-white shadow-glow-purple'
                          : 'text-gray-400 hover:text-white hover:bg-dark-surface/50'
                      }`}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Cross-Border</span>
                    </button>
                    <button
                      onClick={() => setGraphFilter('country_to_country')}
                      className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 text-xs font-medium ${
                        graphFilter === 'country_to_country'
                          ? 'bg-gradient-to-r from-accent-purple to-accent-blue text-white shadow-glow-purple'
                          : 'text-gray-400 hover:text-white hover:bg-dark-surface/50'
                      }`}
                    >
                      <Globe2 className="w-3.5 h-3.5" />
                      <span>Country→Country</span>
                    </button>
                    <button
                      onClick={() => setGraphFilter('compliance_groups')}
                      className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 text-xs font-medium ${
                        graphFilter === 'compliance_groups'
                          ? 'bg-gradient-to-r from-accent-purple to-accent-blue text-white shadow-glow-purple'
                          : 'text-gray-400 hover:text-white hover:bg-dark-surface/50'
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
                className="px-5 py-2.5 bg-dark-card/50 backdrop-blur-xl border border-dark-border/30 rounded-2xl hover:border-accent-cyan/40 transition-all font-medium text-sm shadow-glass hover:shadow-glow-blue"
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

      {/* Floating Action Buttons - Bottom Right */}
      <div className="fixed bottom-8 right-8 flex flex-col space-y-4 z-50">
        {/* Generate Report Button */}
        {analysisResults && (
          <button
            onClick={handleGenerateReport}
            className="flex items-center space-x-3 bg-glass backdrop-blur-xl border border-accent-cyan/30 rounded-2xl px-6 py-4 shadow-2xl hover:border-accent-cyan/50 hover:bg-accent-cyan/10 transition-all group hover:scale-105"
          >
            <Download className="w-5 h-5 text-accent-cyan group-hover:animate-bounce" />
            <span className="text-sm font-semibold text-white">Generate Report</span>
          </button>
        )}

        {/* Virtual Credit Card Button */}
        {userData && (
          <button
            onClick={() => setShowVirtualCardModal(true)}
            className="flex items-center space-x-3 bg-gradient-to-r from-accent-purple to-accent-blue hover:from-accent-blue hover:to-accent-cyan text-white px-6 py-4 rounded-2xl font-semibold text-sm shadow-2xl hover:shadow-glow-purple transition-all duration-300 hover:scale-105"
          >
            <CreditCard className="w-5 h-5" />
            <span>Get Virtual Card</span>
          </button>
        )}
      </div>

      {/* Virtual Card Modal */}
      {showVirtualCardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-dark-surface/95 backdrop-blur-2xl rounded-3xl border border-dark-border/30 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan p-8">
              <button
                onClick={() => setShowVirtualCardModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Durin Virtual Card</h2>
                  <p className="text-white/80">Secure payments with fraud protection</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* Card Preview with 3D Effect */}
              <div 
                className="perspective-1000 flex justify-center"
                onMouseMove={handleCardMouseMove}
                onMouseEnter={() => setIsCardHovered(true)}
                onMouseLeave={handleCardMouseLeave}
              >
                <div 
                  className="relative w-full max-w-md aspect-[1.586/1] transition-transform duration-200 ease-out"
                  style={{
                    transform: `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg) ${isCardHovered ? 'scale(1.05)' : 'scale(1)'}`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* Card Front */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
                    
                    {/* Holographic Effect Overlay */}
                    <div 
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: `radial-gradient(circle at ${50 + cardRotate.y * 2}% ${50 - cardRotate.x * 2}%, rgba(139, 92, 246, 0.3), transparent 50%)`
                      }}
                    ></div>
                    
                    {/* Shine Effect */}
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `linear-gradient(${110 + cardRotate.y * 2}deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)`
                      }}
                    ></div>
                    
                    {/* Card Content */}
                    <div className="relative h-full p-8 flex flex-col justify-between text-white">
                      {/* Top Section */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                            <Wifi className="w-6 h-6 text-white rotate-90" />
                          </div>
                        </div>
                        <div className="text-right">
                          <Logo size="sm" showText={false} />
                          <p className="text-xs opacity-70 mt-1">DURIN</p>
                        </div>
                      </div>
                      
                      {/* Middle Section - Card Number */}
                      <div className="space-y-6">
                        <div className="font-mono text-2xl tracking-[0.3em] font-light">
                          {Array.from({ length: 4 }, (_, i) => (
                            <span key={i} className="inline-block">
                              {i < 3 ? '••••' : Math.floor(1000 + Math.random() * 9000)}
                              {i < 3 && <span className="inline-block w-4"></span>}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Bottom Section */}
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1">Card Holder</p>
                          <p className="font-semibold text-lg tracking-wide">{userData?.fullName?.toUpperCase() || 'YOUR NAME'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1">Expires</p>
                          <p className="font-semibold text-lg">12/{String(new Date().getFullYear() + 3).slice(-2)}</p>
                        </div>
                      </div>
                      
                      {/* CVV Hint */}
                      <div className="absolute bottom-8 right-8 flex items-center space-x-2 opacity-40">
                        <Lock className="w-3 h-3" />
                        <span className="text-xs">CVV: •••</span>
                      </div>
                    </div>
                    
                    {/* Mastercard/Visa Logo */}
                    <div className="absolute bottom-6 right-6">
                      <div className="flex space-x-1">
                        <div className="w-8 h-8 rounded-full bg-red-500 opacity-80"></div>
                        <div className="w-8 h-8 rounded-full bg-amber-500 opacity-80 -ml-4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Card Info Banner */}
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                <Sparkles className="w-4 h-4 text-accent-cyan" />
                <span>Move your mouse over the card to see the 3D effect</span>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Card Features</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 p-4 bg-glass rounded-xl border border-dark-border/30">
                    <CheckCircle className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Fraud Protection</p>
                      <p className="text-sm text-gray-400">AI-powered transaction monitoring</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 bg-glass rounded-xl border border-dark-border/30">
                    <CheckCircle className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Instant Freeze</p>
                      <p className="text-sm text-gray-400">Lock your card anytime</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 bg-glass rounded-xl border border-dark-border/30">
                    <CheckCircle className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Virtual Numbers</p>
                      <p className="text-sm text-gray-400">Generate unlimited virtual cards</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 bg-glass rounded-xl border border-dark-border/30">
                    <CheckCircle className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Real-time Alerts</p>
                      <p className="text-sm text-gray-400">Instant transaction notifications</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setShowVirtualCardModal(false)}
                  className="flex-1 bg-dark-card/50 border border-dark-border/30 text-white py-3 px-6 rounded-xl font-semibold hover:bg-dark-card transition-all"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    setShowVirtualCardModal(false)
                    alert('Virtual card application submitted! Check your email for next steps.')
                  }}
                  className="flex-1 bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan text-white py-3 px-6 rounded-xl font-semibold shadow-glow-blue hover:shadow-glow-purple transition-all duration-300 hover:scale-105"
                >
                  Apply Now
                </button>
              </div>

              {/* Info */}
              <div className="p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-xl">
                <p className="text-xs text-gray-400 text-center">
                  🔒 Your application is secure and encrypted. Approval typically takes 1-2 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
