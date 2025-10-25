import { useState } from 'react'
import { Shield, Mail, Lock, User, Building2, Phone, MapPin, Briefcase, ArrowRight, CheckCircle2, AlertCircle, Calendar, Home, CreditCard } from 'lucide-react'
import Logo from '../components/Logo'

function SignUp({ onSignUpComplete }) {
  const [step, setStep] = useState(1) // 1: Auth, 2: Profile Form, 3: Success
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Auth data
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })
  
  // Profile data
  const [profileData, setProfileData] = useState({
    age: '',
    dateOfBirth: '',
    phoneNumber: '',
    country: '',
    city: '',
    address: '',
    postalCode: '',
    numberOfBankAccounts: '',
    occupation: '',
    annualIncome: ''
  })

  const handleAuthSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (authData.password !== authData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (authData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setStep(2)
    }, 1500)
  }

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setStep(3)
      
      // Complete signup after showing success message
      setTimeout(() => {
        if (onSignUpComplete) {
          onSignUpComplete({
            ...authData,
            ...profileData
          })
        }
      }, 2000)
    }, 1500)
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
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= 1 
                  ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-glow-blue' 
                  : 'bg-dark-card border border-dark-border text-gray-500'
              }`}>
                {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
              </div>
              <div>
                <p className={`text-sm font-semibold ${step >= 1 ? 'text-white' : 'text-gray-500'}`}>
                  Authentication
                </p>
                <p className="text-xs text-gray-500">Create account</p>
              </div>
            </div>

            {/* Connector */}
            <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-gradient-to-r from-accent-blue to-accent-purple' : 'bg-dark-border'}`}></div>

            {/* Step 2 */}
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= 2 
                  ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-glow-blue' 
                  : 'bg-dark-card border border-dark-border text-gray-500'
              }`}>
                {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
              </div>
              <div>
                <p className={`text-sm font-semibold ${step >= 2 ? 'text-white' : 'text-gray-500'}`}>
                  Profile Setup
                </p>
                <p className="text-xs text-gray-500">Company details</p>
              </div>
            </div>

            {/* Connector */}
            <div className={`flex-1 h-0.5 mx-4 ${step >= 3 ? 'bg-gradient-to-r from-accent-blue to-accent-purple' : 'bg-dark-border'}`}></div>

            {/* Step 3 */}
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= 3 
                  ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-glow-blue' 
                  : 'bg-dark-card border border-dark-border text-gray-500'
              }`}>
                {step > 3 ? <CheckCircle2 className="w-5 h-5" /> : '3'}
              </div>
              <div>
                <p className={`text-sm font-semibold ${step >= 3 ? 'text-white' : 'text-gray-500'}`}>
                  Complete
                </p>
                <p className="text-xs text-gray-500">Start analyzing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Authentication */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-10 shadow-glass">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Create Your Account</h2>
                <p className="text-gray-400">Join FinShield AI to start detecting fraud</p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={authData.fullName}
                      onChange={(e) => setAuthData({ ...authData, fullName: e.target.value })}
                      placeholder="John Doe"
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      value={authData.email}
                      onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                      placeholder="john@company.com"
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      value={authData.password}
                      onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      value={authData.confirmPassword}
                      onChange={(e) => setAuthData({ ...authData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-risk-high/10 backdrop-blur-xl border border-risk-high/30 rounded-2xl flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-risk-high flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-risk-high font-medium">{error}</p>
                  </div>
                )}

                {/* Terms */}
                <div className="flex items-start space-x-2">
                  <input 
                    type="checkbox" 
                    id="terms"
                    className="mt-1 rounded border-dark-border/30 bg-dark-card/50 text-accent-blue focus:ring-accent-blue/20" 
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-400">
                    I agree to the <a href="#" className="text-accent-cyan hover:underline">Terms of Service</a> and <a href="#" className="text-accent-cyan hover:underline">Privacy Policy</a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-glow-blue hover:shadow-glow-purple transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-3 overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Profile Setup</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
                Already have an account? <button onClick={() => onSignUpComplete({ fullName: 'Demo User', companyName: 'Demo Company' })} className="text-accent-cyan hover:underline font-semibold">Sign in</button>
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Profile Form */}
        {step === 2 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-10 shadow-glass">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Complete Your Profile</h2>
                <p className="text-gray-400">Tell us about yourself</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Age */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Age</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="number"
                        value={profileData.age}
                        onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                        placeholder="25"
                        min="18"
                        max="120"
                        className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                        className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Occupation</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={profileData.occupation}
                        onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })}
                        placeholder="Software Engineer"
                        className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="tel"
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Country</label>
                    <select
                      value={profileData.country}
                      onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                      required
                    >
                      <option value="">Select Country</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Singapore">Singapore</option>
                      <option value="France">France</option>
                      <option value="Germany">Germany</option>
                      <option value="Spain">Spain</option>
                      <option value="Italy">Italy</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="Sweden">Sweden</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        placeholder="New York"
                        className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Street Address</label>
                    <div className="relative">
                      <Home className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        placeholder="123 Main Street, Apt 4B"
                        className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Postal Code</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={profileData.postalCode}
                        onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                        placeholder="10001"
                        className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Number of Bank Accounts */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Number of Bank Accounts</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="number"
                        value={profileData.numberOfBankAccounts}
                        onChange={(e) => setProfileData({ ...profileData, numberOfBankAccounts: e.target.value })}
                        placeholder="2"
                        min="1"
                        max="20"
                        className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Annual Income */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Annual Income</label>
                    <select
                      value={profileData.annualIncome}
                      onChange={(e) => setProfileData({ ...profileData, annualIncome: e.target.value })}
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                      required
                    >
                      <option value="">Select Income Range</option>
                      <option value="0-25k">$0 - $25,000</option>
                      <option value="25k-50k">$25,000 - $50,000</option>
                      <option value="50k-75k">$50,000 - $75,000</option>
                      <option value="75k-100k">$75,000 - $100,000</option>
                      <option value="100k-150k">$100,000 - $150,000</option>
                      <option value="150k-200k">$150,000 - $200,000</option>
                      <option value="200k+">$200,000+</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-dark-card/50 border border-dark-border/30 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-dark-card transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-glow-blue hover:shadow-glow-purple transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-3 overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Setup</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-10 shadow-glass text-center">
              <div className="inline-flex p-6 bg-gradient-to-br from-accent-cyan/20 to-accent-blue/20 rounded-full mb-6 border border-accent-cyan/30">
                <CheckCircle2 className="w-16 h-16 text-accent-cyan" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4">Welcome to FinShield AI!</h2>
              <p className="text-lg text-gray-400 mb-8">
                Your account has been created successfully. You'll be redirected to the bank portal to download your data.
              </p>

              <div className="bg-dark-card/50 border border-dark-border/30 rounded-2xl p-6 mb-8">
                <h3 className="font-semibold mb-4">What's Next?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-accent-blue text-xs font-bold">1</span>
                    </div>
                    <p className="text-sm text-gray-400">Login to your bank portal to access transaction data</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-accent-purple text-xs font-bold">2</span>
                    </div>
                    <p className="text-sm text-gray-400">Download your KYC and transaction CSV files</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-accent-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-accent-cyan text-xs font-bold">3</span>
                    </div>
                    <p className="text-sm text-gray-400">Upload files to FinShield AI for fraud detection analysis</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse"></div>
                <span>Redirecting to bank portal...</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default SignUp
