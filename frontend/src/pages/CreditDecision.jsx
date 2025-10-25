import { useState } from 'react'
import { CheckCircle2, XCircle, TrendingUp, CreditCard, DollarSign, Percent, Shield, Sparkles, Download, Share2, Home } from 'lucide-react'
import Logo from '../components/Logo'

function CreditDecision({ decision, userData, onGoToDashboard }) {
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 })
  const [isCardHovered, setIsCardHovered] = useState(false)

  const handleCardMouseMove = (e) => {
    if (!isCardHovered) return
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10
    setCardRotate({ x: rotateX, y: rotateY })
  }

  const handleCardMouseLeave = () => {
    setIsCardHovered(false)
    setCardRotate({ x: 0, y: 0 })
  }

  const getScoreColor = (score) => {
    if (score >= 620) return 'text-green-500'
    if (score >= 580) return 'text-accent-cyan'
    if (score >= 550) return 'text-accent-blue'
    if (score >= 500) return 'text-amber-500'
    return 'text-risk-high'
  }

  const getScoreGradient = (score) => {
    if (score >= 620) return 'from-green-500 to-accent-cyan'
    if (score >= 580) return 'from-accent-cyan to-accent-blue'
    if (score >= 550) return 'from-accent-blue to-accent-purple'
    if (score >= 500) return 'from-amber-500 to-risk-medium'
    return 'from-risk-high to-risk-medium'
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent-blue/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent-purple/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-accent-cyan/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative bg-dark-surface/40 backdrop-blur-2xl border-b border-dark-border/30 shadow-glass">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <Logo size="md" showText={true} />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Decision & Score */}
          <div className="space-y-6">
            {/* Decision Header */}
            <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-8 shadow-glass">
              <div className="text-center">
                {decision.approved ? (
                  <>
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-accent-cyan rounded-full mb-6 shadow-glow-cyan animate-bounce">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-green-500 via-accent-cyan to-accent-blue bg-clip-text text-transparent">
                      Congratulations! 🎉
                    </h1>
                    <p className="text-xl text-gray-300 mb-2">Your application has been approved!</p>
                    <p className="text-gray-400">Welcome to FinShield Banking</p>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-risk-high to-risk-medium rounded-full mb-6">
                      <XCircle className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-3 text-white">
                      Application Under Review
                    </h1>
                    <p className="text-xl text-gray-300 mb-2">We need more information</p>
                    <p className="text-gray-400">Please improve your profile and reapply</p>
                  </>
                )}
              </div>
            </div>

            {/* Credit Score */}
            <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-8 shadow-glass">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="w-6 h-6 text-accent-cyan" />
                <h2 className="text-2xl font-bold">Credit Score</h2>
              </div>

              <div className="text-center mb-6">
                <div className={`text-7xl font-bold mb-2 ${getScoreColor(decision.creditScore)}`}>
                  {decision.creditScore}
                </div>
                <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getScoreGradient(decision.creditScore)} bg-opacity-20 border border-current`}>
                  <span className={`font-semibold ${getScoreColor(decision.creditScore)}`}>
                    {decision.scoreLevel}
                  </span>
                </div>
              </div>

              {/* Score Range */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>400</span>
                  <span>550 (Min)</span>
                  <span>650 (Max)</span>
                </div>
                <div className="h-3 bg-dark-card rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full transition-all duration-1000 bg-gradient-to-r ${getScoreGradient(decision.creditScore)}`}
                    style={{ width: `${((decision.creditScore - 400) / 250) * 100}%` }}
                  ></div>
                </div>
              </div>

              {decision.approved && (
                <>
                  {/* Credit Details */}
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-dark-border/30">
                    <div className="text-center p-4 bg-dark-card/30 rounded-xl">
                      <DollarSign className="w-5 h-5 text-accent-cyan mx-auto mb-2" />
                      <p className="text-sm text-gray-400 mb-1">Credit Limit</p>
                      <p className="text-2xl font-bold text-accent-cyan">${decision.creditLimit?.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 bg-dark-card/30 rounded-xl">
                      <Percent className="w-5 h-5 text-accent-blue mx-auto mb-2" />
                      <p className="text-sm text-gray-400 mb-1">APR</p>
                      <p className="text-2xl font-bold text-accent-blue">{decision.apr}%</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Reasons */}
            <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-8 shadow-glass">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-accent-purple" />
                <span>{decision.approved ? 'Approval Factors' : 'Areas for Improvement'}</span>
              </h3>
              <ul className="space-y-3">
                {decision.reasons.map((reason, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    {decision.approved ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-risk-high flex-shrink-0 mt-0.5" />
                    )}
                    <span className="text-gray-300">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Virtual Card */}
          <div className="space-y-6">
            {decision.approved ? (
              <>
                {/* Virtual Card */}
                <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-8 shadow-glass">
                  <div className="flex items-center space-x-3 mb-6">
                    <CreditCard className="w-6 h-6 text-accent-cyan" />
                    <h2 className="text-2xl font-bold">Your Virtual Card</h2>
                  </div>

                  {/* 3D Card */}
                  <div 
                    className="perspective-1000 mb-6"
                    onMouseMove={handleCardMouseMove}
                    onMouseEnter={() => setIsCardHovered(true)}
                    onMouseLeave={handleCardMouseLeave}
                  >
                    <div
                      className="relative w-full aspect-[1.586/1] rounded-2xl transition-transform duration-300 ease-out"
                      style={{
                        transform: `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg)`,
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      {/* Card Front */}
                      <div className="absolute inset-0 bg-gradient-to-br from-accent-purple via-accent-blue to-accent-cyan rounded-2xl p-6 shadow-2xl">
                        {/* Card Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 rounded-2xl opacity-50"></div>
                        
                        {/* Card Content */}
                        <div className="relative h-full flex flex-col justify-between">
                          {/* Top */}
                          <div className="flex items-start justify-between">
                            <div>
                              <Shield className="w-10 h-10 text-white/90 mb-2" />
                              <p className="text-white/80 text-sm font-medium">FinShield</p>
                            </div>
                            <Sparkles className="w-8 h-8 text-white/60" />
                          </div>

                          {/* Middle - Card Number */}
                          <div>
                            <div className="flex space-x-3 text-white text-xl font-mono tracking-wider mb-4">
                              <span>****</span>
                              <span>****</span>
                              <span>****</span>
                              <span>{Math.floor(1000 + Math.random() * 9000)}</span>
                            </div>
                          </div>

                          {/* Bottom */}
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-white/60 text-xs mb-1">Cardholder</p>
                              <p className="text-white font-semibold">{userData?.fullName || 'CARDHOLDER NAME'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white/60 text-xs mb-1">Expires</p>
                              <p className="text-white font-mono">
                                {String(new Date().getMonth() + 1).padStart(2, '0')}/{String(new Date().getFullYear() + 3).slice(-2)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Chip */}
                        <div className="absolute top-20 left-6 w-12 h-10 bg-gradient-to-br from-amber-200 to-amber-400 rounded-lg opacity-80"></div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 text-center mb-6">
                    💳 Hover over the card to see the 3D effect
                  </p>

                  {/* Backed By */}
                  <div className="bg-dark-card/30 border border-dark-border/30 rounded-2xl p-6 text-center">
                    <p className="text-sm text-gray-400 mb-2">Powered by</p>
                    <div className="flex items-center justify-center space-x-2">
                      <Shield className="w-6 h-6 text-accent-cyan" />
                      <span className="text-xl font-bold bg-gradient-to-r from-accent-cyan to-accent-blue bg-clip-text text-transparent">
                        FinShield Bank
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">FDIC Insured • Member FDIC</p>
                  </div>
                </div>

                {/* Card Features */}
                <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-8 shadow-glass">
                  <h3 className="text-xl font-bold mb-6">Card Benefits</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-accent-cyan/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-accent-cyan" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Fraud Protection</p>
                        <p className="text-sm text-gray-400">24/7 AI-powered fraud monitoring</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-accent-blue" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Instant Notifications</p>
                        <p className="text-sm text-gray-400">Real-time transaction alerts</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 text-accent-purple" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">No Hidden Fees</p>
                        <p className="text-sm text-gray-400">Transparent pricing, no surprises</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center space-x-2 px-6 py-4 bg-dark-card/50 border border-dark-border/30 rounded-2xl font-semibold hover:bg-dark-card transition-all">
                    <Download className="w-5 h-5" />
                    <span>Download Card</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 px-6 py-4 bg-dark-card/50 border border-dark-border/30 rounded-2xl font-semibold hover:bg-dark-card transition-all">
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>
              </>
            ) : (
              /* Declined - Show Improvement Tips */
              <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-8 shadow-glass">
                <h3 className="text-xl font-bold mb-6">How to Improve Your Application</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-dark-card/30 rounded-xl">
                    <p className="font-semibold text-white mb-2">📈 Build Credit History</p>
                    <p className="text-sm text-gray-400">Maintain consistent transaction patterns for 3+ months</p>
                  </div>
                  <div className="p-4 bg-dark-card/30 rounded-xl">
                    <p className="font-semibold text-white mb-2">💼 Stable Employment</p>
                    <p className="text-sm text-gray-400">Provide proof of stable income from employment</p>
                  </div>
                  <div className="p-4 bg-dark-card/30 rounded-xl">
                    <p className="font-semibold text-white mb-2">🔍 Verify Identity</p>
                    <p className="text-sm text-gray-400">Ensure all documents are clear and up-to-date</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full mt-6 bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan text-white py-4 px-6 rounded-2xl font-bold shadow-glow-purple hover:shadow-glow-blue transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Apply Again in 30 Days
                </button>
              </div>
            )}

            {/* Go to Dashboard */}
            <button
              onClick={onGoToDashboard}
              className="w-full bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan text-white py-4 px-6 rounded-2xl font-bold shadow-glow-purple hover:shadow-glow-blue transition-all duration-500 flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Home className="w-5 h-5" />
              <span>Go to Dashboard</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CreditDecision
