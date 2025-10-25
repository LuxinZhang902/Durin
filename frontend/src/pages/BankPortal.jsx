import { useState } from 'react'
import { Building2, Download, Shield, Lock, CheckCircle2, ArrowRight, FileText, Database, TrendingUp, AlertCircle, ArrowLeft } from 'lucide-react'
import Logo from '../components/Logo'

function BankPortal({ onLogin, selectedBank, onBackToBankSelection }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState({ users: false, transactions: false })
  const [showDownloadSection, setShowDownloadSection] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate authentication - go directly to main page
    setTimeout(() => {
      setIsLoading(false)
      onLogin()
    }, 1500)
  }

  const downloadFile = (type) => {
    const filename = type === 'users' ? 'users.csv' : 'transactions.csv'
    
    // Generate CSV content based on type
    let csvContent = ''
    
    if (type === 'users') {
      csvContent = `user_id,user_name,device_id,ip,country
U1,Jack,D1,192.168.1.100,United States
U2,Andy,D1,192.168.1.101,United States
U3,Sarah,D2,192.168.1.102,United States
U4,Michael,D3,192.168.1.103,Singapore
U5,David,D3,192.168.1.104,Singapore
U6,Emma,D4,192.168.1.105,United Kingdom
U7,James,D5,192.168.1.106,United States
U8,Robert,D1,192.168.1.107,United States
U9,Lisa,D6,192.168.1.108,Canada
U10,Tom,D7,192.168.1.109,United States
U11,Kevin,D8,192.168.1.110,Singapore
U12,Ryan,D3,192.168.1.111,Singapore
U13,Sophie,D9,192.168.1.112,United Kingdom
U14,Chris,D10,192.168.1.113,United States
U15,Alex,D11,192.168.1.114,Canada
U16,Pierre,D12,192.168.1.115,France
U17,Hans,D13,192.168.1.116,Germany
U18,Maria,D14,192.168.1.117,Spain
U19,Giovanni,D15,192.168.1.118,Italy
U20,Lars,D16,192.168.1.119,Netherlands
U21,Anna,D17,192.168.1.120,Sweden
U22,Klaus,D18,192.168.1.121,Germany
U23,Francois,D19,192.168.1.122,France
U24,Isabella,D20,192.168.1.123,Italy
U25,Oliver,D21,192.168.1.124,United Kingdom`
    } else {
      csvContent = `from,to,amount,timestamp,device_id,ip,from_country,to_country,transaction_type
Jack,Andy,1000,2025-10-23T10:00:00Z,D1,192.168.1.100,United States,United States,user_to_user
Andy,Sarah,1500,2025-10-23T10:30:00Z,D1,192.168.1.101,United States,United States,user_to_user
Jack,Robert,2000,2025-10-23T11:00:00Z,D1,192.168.1.100,United States,United States,user_to_user
Michael,David,3000,2025-10-23T11:30:00Z,D3,192.168.1.103,Singapore,Singapore,user_to_user
David,Kevin,2500,2025-10-23T12:00:00Z,D3,192.168.1.104,Singapore,Singapore,user_to_user
Michael,Ryan,3500,2025-10-23T12:30:00Z,D3,192.168.1.103,Singapore,Singapore,user_to_user
Emma,Sophie,1800,2025-10-23T13:00:00Z,D4,192.168.1.105,United Kingdom,United Kingdom,user_to_user
Lisa,Alex,2200,2025-10-23T13:30:00Z,D6,192.168.1.108,Canada,Canada,user_to_user
Jack,Michael,5000,2025-10-23T14:00:00Z,D1,192.168.1.100,United States,Singapore,cross_border
Andy,David,4500,2025-10-23T14:30:00Z,D1,192.168.1.101,United States,Singapore,cross_border
Sarah,Kevin,5500,2025-10-23T15:00:00Z,D2,192.168.1.102,United States,Singapore,cross_border
Emma,Lisa,6000,2025-10-23T15:30:00Z,D4,192.168.1.105,United Kingdom,Canada,cross_border
Sophie,Alex,5800,2025-10-23T16:00:00Z,D9,192.168.1.112,United Kingdom,Canada,cross_border
Michael,Jack,7000,2025-10-23T16:30:00Z,D3,192.168.1.103,Singapore,United States,cross_border
David,Andy,6800,2025-10-23T17:00:00Z,D3,192.168.1.104,Singapore,United States,cross_border
Kevin,Sarah,7200,2025-10-23T17:30:00Z,D8,192.168.1.110,Singapore,United States,cross_border
Ryan,Tom,6500,2025-10-23T18:00:00Z,D3,192.168.1.111,Singapore,United States,cross_border
Lisa,Emma,4800,2025-10-23T18:30:00Z,D6,192.168.1.108,Canada,United Kingdom,cross_border
Alex,Sophie,5200,2025-10-23T19:00:00Z,D11,192.168.1.114,Canada,United Kingdom,cross_border
Jack,Sarah,3500,2025-10-23T19:30:00Z,D1,192.168.1.100,United States,United States,user_to_user
Sarah,Robert,4100,2025-10-23T20:00:00Z,D3,192.168.1.103,United States,United States,user_to_user
Michael,Tom,7800,2025-10-23T20:30:00Z,D4,192.168.1.105,Singapore,United States,cross_border
David,Jack,6500,2025-10-23T21:00:00Z,D5,192.168.1.106,Singapore,United States,cross_border
Emma,Chris,3900,2025-10-23T21:30:00Z,D6,192.168.1.108,United Kingdom,United States,cross_border
James,Alex,8200,2025-10-23T22:00:00Z,D7,192.168.1.109,United States,Canada,cross_border
United States,Singapore,45000,2025-10-23T23:00:00Z,D12,192.168.1.115,United States,Singapore,country_to_country
Singapore,United Kingdom,32000,2025-10-23T23:30:00Z,D13,192.168.1.116,Singapore,United Kingdom,country_to_country
United Kingdom,Canada,28000,2025-10-24T00:00:00Z,D14,192.168.1.117,United Kingdom,Canada,country_to_country
Canada,United States,51000,2025-10-24T00:30:00Z,D15,192.168.1.118,Canada,United States,country_to_country
Singapore,United States,67000,2025-10-24T01:00:00Z,D16,192.168.1.119,Singapore,United States,country_to_country
Pierre,Hans,5200,2025-10-24T02:00:00Z,D12,192.168.1.115,France,Germany,cross_border
Hans,Maria,3800,2025-10-24T02:30:00Z,D13,192.168.1.116,Germany,Spain,cross_border
Maria,Giovanni,4500,2025-10-24T03:00:00Z,D14,192.168.1.117,Spain,Italy,cross_border
Giovanni,Lars,6200,2025-10-24T03:30:00Z,D15,192.168.1.118,Italy,Netherlands,cross_border
Lars,Anna,3900,2025-10-24T04:00:00Z,D16,192.168.1.119,Netherlands,Sweden,cross_border
Anna,Sophie,5500,2025-10-24T04:30:00Z,D17,192.168.1.120,Sweden,United Kingdom,cross_border
Klaus,Francois,4100,2025-10-24T05:00:00Z,D18,192.168.1.121,Germany,France,cross_border
Francois,Isabella,3700,2025-10-24T05:30:00Z,D19,192.168.1.122,France,Italy,cross_border
Isabella,Oliver,5800,2025-10-24T06:00:00Z,D20,192.168.1.123,Italy,United Kingdom,cross_border
Oliver,Emma,4200,2025-10-24T06:30:00Z,D21,192.168.1.124,United Kingdom,United Kingdom,user_to_user
Pierre,Francois,2100,2025-10-24T07:00:00Z,D12,192.168.1.115,France,France,user_to_user
Hans,Klaus,1800,2025-10-24T07:30:00Z,D13,192.168.1.116,Germany,Germany,user_to_user
Giovanni,Isabella,2500,2025-10-24T08:00:00Z,D15,192.168.1.118,Italy,Italy,user_to_user
France,Germany,85000,2025-10-24T09:00:00Z,D22,192.168.1.125,France,Germany,country_to_country
Germany,Netherlands,72000,2025-10-24T09:30:00Z,D23,192.168.1.126,Germany,Netherlands,country_to_country
Netherlands,France,68000,2025-10-24T10:00:00Z,D24,192.168.1.127,Netherlands,France,country_to_country
Spain,Italy,55000,2025-10-24T10:30:00Z,D25,192.168.1.128,Spain,Italy,country_to_country
Italy,Spain,61000,2025-10-24T11:00:00Z,D26,192.168.1.129,Italy,Spain,country_to_country
United Kingdom,France,95000,2025-10-24T11:30:00Z,D27,192.168.1.130,United Kingdom,France,country_to_country
Sweden,Germany,48000,2025-10-24T12:00:00Z,D28,192.168.1.131,Sweden,Germany,country_to_country`
    }
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    setDownloadStatus(prev => ({ ...prev, [type]: true }))
  }

  const handleProceedToAnalysis = () => {
    // Redirect to main app
    if (onLogin) {
      onLogin()
    }
  }

  const handleBackToLogin = () => {
    setShowDownloadSection(false)
    setDownloadStatus({ users: false, transactions: false })
  }

  const allDownloaded = downloadStatus.users && downloadStatus.transactions

  return (
    <div className="min-h-screen bg-dark-bg text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-accent-blue/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-accent-purple/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

      {/* Header */}
      <header className="relative bg-dark-surface/40 backdrop-blur-2xl border-b border-dark-border/30 shadow-glass">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <Logo size="md" showText={true} />
            
            <div className="flex items-center space-x-2 bg-glass backdrop-blur-xl border border-accent-cyan/20 rounded-2xl px-4 py-2 shadow-glass">
              <Shield className="w-4 h-4 text-accent-cyan" />
              <span className="text-xs text-gray-400 font-medium">256-bit Encryption</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Info */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center space-x-2 bg-accent-blue/10 border border-accent-blue/30 rounded-full px-4 py-2 mb-6">
                <Database className="w-4 h-4 text-accent-blue" />
                <span className="text-sm font-medium text-accent-blue">Fraud Detection Demo</span>
              </div>
              
              <h2 className="text-5xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Access Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan bg-clip-text text-transparent">
                  Transaction Data
                </span>
              </h2>
              
              <p className="text-lg text-gray-400 mb-8">
                Download your KYC and transaction records to analyze with Durin's advanced fraud detection system.
              </p>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-accent-blue/10 rounded-xl border border-accent-blue/20 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-accent-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Secure Data Export</h3>
                    <p className="text-sm text-gray-400">Bank-grade encryption for all data transfers</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-accent-purple/10 rounded-xl border border-accent-purple/20 mt-0.5">
                    <TrendingUp className="w-5 h-5 text-accent-purple" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">AI-Powered Analysis</h3>
                    <p className="text-sm text-gray-400">Advanced graph algorithms detect hidden patterns</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-accent-cyan/10 rounded-xl border border-accent-cyan/20 mt-0.5">
                    <Shield className="w-5 h-5 text-accent-cyan" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Compliance Ready</h3>
                    <p className="text-sm text-gray-400">Meet AML/KYC regulatory requirements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login/Download */}
          <div className="relative">
            {!showDownloadSection ? (
              /* Login Form */
              <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-10 shadow-glass">
                {/* Back to Bank Selection Button */}
                {onBackToBankSelection && (
                  <button
                    onClick={onBackToBankSelection}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6 group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Change Bank</span>
                  </button>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">Bank Portal Login</h3>
                  <p className="text-sm text-gray-400">Access your transaction data securely</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="demo@securebank.com"
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-dark-border/30 bg-dark-card/50 text-accent-blue focus:ring-accent-blue/20" />
                      <span className="text-gray-400">Remember me</span>
                    </label>
                    <a href="#" className="text-accent-cyan hover:underline">Forgot password?</a>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-glow-blue hover:shadow-glow-purple transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-3 overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>Secure Login</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 p-4 bg-accent-blue/5 border border-accent-blue/20 rounded-xl">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-accent-blue mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-400">
                      <span className="text-accent-blue font-semibold">Demo credentials:</span> Use any username/password to access the demo data
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Download Section */
              <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-10 shadow-glass">
                {/* Back Button */}
                <button
                  onClick={handleBackToLogin}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm font-medium">Back to Login</span>
                </button>

                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-accent-cyan/10 rounded-xl border border-accent-cyan/20">
                      <CheckCircle2 className="w-6 h-6 text-accent-cyan" />
                    </div>
                    <h3 className="text-2xl font-bold">Login Successful</h3>
                  </div>
                  <p className="text-sm text-gray-400">Download your data files to begin fraud analysis</p>
                </div>

                <div className="space-y-4 mb-8">
                  {/* Users CSV */}
                  <div className={`bg-dark-card/50 border rounded-2xl p-5 transition-all ${
                    downloadStatus.users ? 'border-risk-low/30' : 'border-dark-border/30'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl border ${
                          downloadStatus.users 
                            ? 'bg-risk-low/10 border-risk-low/30' 
                            : 'bg-accent-purple/10 border-accent-purple/20'
                        }`}>
                          <FileText className={`w-5 h-5 ${
                            downloadStatus.users ? 'text-risk-low' : 'text-accent-purple'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">users.csv</h4>
                          <p className="text-xs text-gray-500">KYC data with user information</p>
                        </div>
                      </div>
                      {downloadStatus.users && (
                        <CheckCircle2 className="w-5 h-5 text-risk-low" />
                      )}
                    </div>
                    <button
                      onClick={() => downloadFile('users')}
                      disabled={downloadStatus.users}
                      className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center space-x-2 ${
                        downloadStatus.users
                          ? 'bg-risk-low/10 text-risk-low cursor-not-allowed'
                          : 'bg-accent-purple/20 hover:bg-accent-purple/30 text-accent-purple border border-accent-purple/30'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>{downloadStatus.users ? 'Downloaded' : 'Download File'}</span>
                    </button>
                  </div>

                  {/* Transactions CSV */}
                  <div className={`bg-dark-card/50 border rounded-2xl p-5 transition-all ${
                    downloadStatus.transactions ? 'border-risk-low/30' : 'border-dark-border/30'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl border ${
                          downloadStatus.transactions 
                            ? 'bg-risk-low/10 border-risk-low/30' 
                            : 'bg-accent-blue/10 border-accent-blue/20'
                        }`}>
                          <Database className={`w-5 h-5 ${
                            downloadStatus.transactions ? 'text-risk-low' : 'text-accent-blue'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">transactions.csv</h4>
                          <p className="text-xs text-gray-500">Transaction records with patterns</p>
                        </div>
                      </div>
                      {downloadStatus.transactions && (
                        <CheckCircle2 className="w-5 h-5 text-risk-low" />
                      )}
                    </div>
                    <button
                      onClick={() => downloadFile('transactions')}
                      disabled={downloadStatus.transactions}
                      className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center space-x-2 ${
                        downloadStatus.transactions
                          ? 'bg-risk-low/10 text-risk-low cursor-not-allowed'
                          : 'bg-accent-blue/20 hover:bg-accent-blue/30 text-accent-blue border border-accent-blue/30'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>{downloadStatus.transactions ? 'Downloaded' : 'Download File'}</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleProceedToAnalysis}
                  className="w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-500 flex items-center justify-center space-x-3 overflow-hidden bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan text-white shadow-glow-blue hover:shadow-glow-purple hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Proceed to Fraud Analysis</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="mt-4 p-3 bg-accent-blue/5 border border-accent-blue/20 rounded-xl">
                  <p className="text-xs text-gray-400 text-center">
                    {allDownloaded 
                      ? '✓ Files ready! Click above to continue to fraud analysis' 
                      : '💡 Tip: You can proceed now or download files first for offline demo'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-dark-border/30 mt-20">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>© 2025 SecureBank. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <a href="#" className="hover:text-accent-cyan transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-accent-cyan transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-accent-cyan transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default BankPortal
