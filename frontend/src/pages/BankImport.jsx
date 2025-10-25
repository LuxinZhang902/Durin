import { useState } from 'react'
import { Building2, CheckCircle2, ArrowRight, Shield, Lock, TrendingUp, Globe2, ArrowLeft } from 'lucide-react'
import Logo from '../components/Logo'

function BankImport({ onBankSelected, onBack }) {
  const [selectedBank, setSelectedBank] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const banks = [
    {
      id: 'securebank',
      name: 'SecureBank',
      logo: '🏦',
      description: 'Leading global banking institution',
      countries: ['United States', 'United Kingdom', 'Canada'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'globalfinance',
      name: 'Global Finance Corp',
      logo: '🌍',
      description: 'International financial services',
      countries: ['Singapore', 'Hong Kong', 'Australia'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'eurobank',
      name: 'EuroBank',
      logo: '🇪🇺',
      description: 'European banking network',
      countries: ['France', 'Germany', 'Spain', 'Italy'],
      color: 'from-indigo-500 to-blue-500'
    },
    {
      id: 'techbank',
      name: 'TechBank Digital',
      logo: '💳',
      description: 'Modern digital banking platform',
      countries: ['United States', 'Canada', 'Mexico'],
      color: 'from-green-500 to-emerald-500'
    }
  ]

  const handleConnect = () => {
    if (!selectedBank) return
    
    setIsConnecting(true)
    
    // Simulate bank connection
    setTimeout(() => {
      setIsConnecting(false)
      if (onBankSelected) {
        onBankSelected(selectedBank)
      }
    }, 2000)
  }

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
        <div className="max-w-7xl mx-auto px-8 py-5">
          <Logo size="md" showText={true} />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-8 py-16">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Profile</span>
          </button>
        )}

        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-accent-cyan/10 border border-accent-cyan/30 rounded-full px-4 py-2 mb-6">
            <Lock className="w-4 h-4 text-accent-cyan" />
            <span className="text-sm font-medium text-accent-cyan">Secure Bank Connection</span>
          </div>
          
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Connect Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan bg-clip-text text-transparent">
              Banking Institution
            </span>
          </h2>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Select your bank to securely import transaction data for fraud detection analysis
          </p>
        </div>

        {/* Bank Selection Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {banks.map((bank) => (
            <button
              key={bank.id}
              onClick={() => setSelectedBank(bank)}
              className={`relative bg-glass backdrop-blur-2xl rounded-3xl border p-8 shadow-glass transition-all hover:scale-[1.02] text-left ${
                selectedBank?.id === bank.id
                  ? 'border-accent-cyan/50 shadow-glow-blue'
                  : 'border-dark-border/30 hover:border-accent-blue/30'
              }`}
            >
              {/* Selection Indicator */}
              {selectedBank?.id === bank.id && (
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-cyan to-accent-blue flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}

              {/* Bank Logo */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${bank.color} flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                {bank.logo}
              </div>

              {/* Bank Info */}
              <h3 className="text-xl font-bold mb-2">{bank.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{bank.description}</p>

              {/* Countries */}
              <div className="flex flex-wrap gap-2">
                {bank.countries.map((country) => (
                  <span
                    key={country}
                    className="text-xs px-2 py-1 bg-dark-card/50 border border-dark-border/30 rounded-lg text-gray-400"
                  >
                    {country}
                  </span>
                ))}
              </div>

              {/* Features */}
              <div className="mt-4 pt-4 border-t border-dark-border/30 space-y-2">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Shield className="w-3 h-3 text-accent-cyan" />
                  <span>Bank-grade encryption</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <TrendingUp className="w-3 h-3 text-accent-purple" />
                  <span>Real-time data sync</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Globe2 className="w-3 h-3 text-accent-blue" />
                  <span>Multi-currency support</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Connect Button */}
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleConnect}
            disabled={!selectedBank || isConnecting}
            className={`w-full py-5 px-8 rounded-2xl font-bold text-lg transition-all duration-500 flex items-center justify-center space-x-3 overflow-hidden ${
              selectedBank && !isConnecting
                ? 'bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan text-white shadow-glow-blue hover:shadow-glow-purple hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-dark-card/50 text-gray-500 cursor-not-allowed border border-dark-border/30'
            }`}
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Connecting to {selectedBank?.name}...</span>
              </>
            ) : (
              <>
                <Building2 className="w-5 h-5" />
                <span>{selectedBank ? `Connect to ${selectedBank.name}` : 'Select a Bank to Continue'}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {selectedBank && !isConnecting && (
            <div className="mt-4 p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-xl">
              <p className="text-xs text-gray-400 text-center">
                🔒 Your credentials are encrypted and never stored. We only access transaction data with your permission.
              </p>
            </div>
          )}
        </div>

        {/* Security Info */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-glass backdrop-blur-xl rounded-2xl border border-dark-border/30 p-6 shadow-glass">
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-accent-cyan" />
              <span>Why is this secure?</span>
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-400">
              <div>
                <p className="font-semibold text-white mb-1">🔐 Bank-Level Security</p>
                <p className="text-xs">256-bit encryption for all data transfers</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">🛡️ Read-Only Access</p>
                <p className="text-xs">We can only view data, never modify</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">✅ Compliance Ready</p>
                <p className="text-xs">SOC 2, GDPR, and PCI DSS certified</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default BankImport
