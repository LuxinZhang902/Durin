import { useState } from 'react'
import { Shield, AlertTriangle, CheckCircle, XCircle, Phone, Mail, CreditCard, MapPin, Calendar, DollarSign, Loader2, Info } from 'lucide-react'

function UserProtection() {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: '',
    cardNumber: '',
    transactionAmount: '',
    merchantName: '',
    transactionDate: '',
    location: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckFraud = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulate fraud check (in production, this would call your backend API)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock fraud detection logic
      const riskFactors = []
      let riskScore = 0

      // Check for suspicious patterns
      if (formData.transactionAmount && parseFloat(formData.transactionAmount) > 1000) {
        riskFactors.push('Large transaction amount')
        riskScore += 30
      }

      if (formData.merchantName && formData.merchantName.toLowerCase().includes('unknown')) {
        riskFactors.push('Unrecognized merchant')
        riskScore += 25
      }

      if (formData.location && !formData.location.toLowerCase().includes('us')) {
        riskFactors.push('International transaction')
        riskScore += 20
      }

      // Check if transaction is recent
      if (formData.transactionDate) {
        const transDate = new Date(formData.transactionDate)
        const now = new Date()
        const hoursDiff = (now - transDate) / (1000 * 60 * 60)
        
        if (hoursDiff < 1) {
          riskFactors.push('Very recent transaction')
          riskScore += 15
        }
      }

      const isFraudulent = riskScore >= 50

      setResult({
        isFraudulent,
        riskScore,
        riskLevel: riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW',
        riskFactors,
        recommendations: isFraudulent ? [
          'Contact your bank immediately',
          'Freeze your card to prevent further transactions',
          'File a fraud report',
          'Monitor your account for additional suspicious activity',
          'Consider changing your passwords and PINs'
        ] : [
          'Transaction appears legitimate',
          'Continue to monitor your account',
          'Enable transaction alerts',
          'Review your statements regularly'
        ]
      })
    } catch (err) {
      setError('Failed to check transaction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return 'text-risk-high'
      case 'MEDIUM': return 'text-amber-500'
      case 'LOW': return 'text-green-500'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-accent-purple to-accent-blue rounded-2xl shadow-glow-purple">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">User Fraud Protection</h1>
              <p className="text-gray-400">Check if you're a victim of fraudulent activity</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Input Form */}
          <div className="space-y-6">
            <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-8 shadow-glass">
              <h2 className="text-xl font-bold mb-6">Transaction Details</h2>

              <div className="space-y-4">
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>Phone Number</span>
                    </div>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 bg-dark-card border border-dark-border/30 rounded-xl text-white placeholder-gray-600 focus:border-accent-cyan/50 focus:outline-none transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </div>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 bg-dark-card border border-dark-border/30 rounded-xl text-white placeholder-gray-600 focus:border-accent-cyan/50 focus:outline-none transition-all"
                  />
                </div>

                {/* Card Number (last 4 digits) */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Card Last 4 Digits</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234"
                    maxLength="4"
                    className="w-full px-4 py-3 bg-dark-card border border-dark-border/30 rounded-xl text-white placeholder-gray-600 focus:border-accent-cyan/50 focus:outline-none transition-all"
                  />
                </div>

                {/* Transaction Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Transaction Amount</span>
                    </div>
                  </label>
                  <input
                    type="number"
                    name="transactionAmount"
                    value={formData.transactionAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-4 py-3 bg-dark-card border border-dark-border/30 rounded-xl text-white placeholder-gray-600 focus:border-accent-cyan/50 focus:outline-none transition-all"
                  />
                </div>

                {/* Merchant Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center space-x-2">
                      <Info className="w-4 h-4" />
                      <span>Merchant Name</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="merchantName"
                    value={formData.merchantName}
                    onChange={handleInputChange}
                    placeholder="e.g., Amazon, Walmart"
                    className="w-full px-4 py-3 bg-dark-card border border-dark-border/30 rounded-xl text-white placeholder-gray-600 focus:border-accent-cyan/50 focus:outline-none transition-all"
                  />
                </div>

                {/* Transaction Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Transaction Date & Time</span>
                    </div>
                  </label>
                  <input
                    type="datetime-local"
                    name="transactionDate"
                    value={formData.transactionDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-dark-card border border-dark-border/30 rounded-xl text-white placeholder-gray-600 focus:border-accent-cyan/50 focus:outline-none transition-all"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>Transaction Location</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., New York, US"
                    className="w-full px-4 py-3 bg-dark-card border border-dark-border/30 rounded-xl text-white placeholder-gray-600 focus:border-accent-cyan/50 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Check Button */}
              <button
                onClick={handleCheckFraud}
                disabled={loading}
                className="mt-6 w-full bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan text-white py-4 px-6 rounded-2xl font-bold shadow-glow-purple hover:shadow-glow-blue transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Check for Fraud</span>
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-risk-high/10 border border-risk-high/30 rounded-xl flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-risk-high flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-risk-high">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Results */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Risk Assessment */}
                <div className={`bg-glass backdrop-blur-2xl rounded-3xl border ${result.isFraudulent ? 'border-risk-high/30' : 'border-green-500/30'} p-8 shadow-glass`}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Risk Assessment</h2>
                    {result.isFraudulent ? (
                      <XCircle className="w-8 h-8 text-risk-high" />
                    ) : (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className={`font-bold ${result.isFraudulent ? 'text-risk-high' : 'text-green-500'}`}>
                        {result.isFraudulent ? 'POTENTIALLY FRAUDULENT' : 'APPEARS SAFE'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Risk Level</span>
                      <span className={`font-bold ${getRiskColor(result.riskLevel)}`}>
                        {result.riskLevel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Risk Score</span>
                      <span className="font-bold text-white">{result.riskScore}/100</span>
                    </div>

                    {/* Risk Score Bar */}
                    <div className="mt-4">
                      <div className="h-3 bg-dark-card rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            result.riskScore >= 70 ? 'bg-risk-high' :
                            result.riskScore >= 40 ? 'bg-amber-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${result.riskScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Factors */}
                {result.riskFactors.length > 0 && (
                  <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-6 shadow-glass">
                    <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <span>Detected Risk Factors</span>
                    </h3>
                    <div className="space-y-2">
                      {result.riskFactors.map((factor, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-dark-card/50 rounded-xl">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <span className="text-sm text-gray-300">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-6 shadow-glass">
                  <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                    <Info className="w-5 h-5 text-accent-cyan" />
                    <span>Recommendations</span>
                  </h3>
                  <div className="space-y-3">
                    {result.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-12 shadow-glass text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-500">Enter transaction details to check for fraud</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProtection
