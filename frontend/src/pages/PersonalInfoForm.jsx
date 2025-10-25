import { useState } from 'react'
import { User, Mail, Phone, Calendar, MapPin, Home, Globe, Briefcase, ArrowRight, Shield, CheckCircle2 } from 'lucide-react'
import Logo from '../components/Logo'

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' }
]

const OCCUPATIONS = [
  'Software Engineer',
  'Data Scientist',
  'Product Manager',
  'Business Analyst',
  'Financial Analyst',
  'Accountant',
  'Doctor',
  'Nurse',
  'Teacher',
  'Lawyer',
  'Engineer',
  'Manager',
  'Consultant',
  'Sales Representative',
  'Marketing Manager',
  'Entrepreneur',
  'Freelancer',
  'Student',
  'Retired',
  'Other'
]

function PersonalInfoForm({ onComplete }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    phoneNumber: '',
    previousCountry: 'US',
    currentCountry: 'US',
    streetAddress: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    occupation: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.dateOfBirth) {
      setError('Please fill in all required personal information fields')
      return
    }
    
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    
    if (!formData.streetAddress || !formData.city || !formData.postalCode) {
      setError('Please complete your current address')
      return
    }
    
    if (!formData.occupation) {
      setError('Please select your occupation')
      return
    }
    
    // Calculate age
    const birthDate = new Date(formData.dateOfBirth)
    const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000))
    
    if (age < 18) {
      setError('You must be at least 18 years old to apply')
      return
    }
    
    setIsLoading(true)
    
    setTimeout(() => {
      setIsLoading(false)
      if (onComplete) {
        onComplete(formData)
      }
    }, 1500)
  }

  const getCountryFlag = (countryCode) => {
    const country = COUNTRIES.find(c => c.code === countryCode)
    return country ? country.flag : '🌍'
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
      <main className="relative max-w-5xl mx-auto px-8 py-12">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple flex items-center justify-center shadow-glow-blue">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold">Personal Info</span>
            </div>
            <div className="flex-1 h-0.5 bg-dark-border mx-4"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-dark-card border border-dark-border flex items-center justify-center">
                <span className="text-sm">2</span>
              </div>
              <span className="text-sm text-gray-500">ID Upload</span>
            </div>
            <div className="flex-1 h-0.5 bg-dark-border mx-4"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-dark-card border border-dark-border flex items-center justify-center">
                <span className="text-sm">3</span>
              </div>
              <span className="text-sm text-gray-500">Verification</span>
            </div>
            <div className="flex-1 h-0.5 bg-dark-border mx-4"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-dark-card border border-dark-border flex items-center justify-center">
                <span className="text-sm">4</span>
              </div>
              <span className="text-sm text-gray-500">Transactions</span>
            </div>
          </div>
        </div>

        <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-10 shadow-glass">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl mb-4 shadow-glow-blue">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Account Application
            </h1>
            <p className="text-gray-400">Please provide your personal information to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2 pb-2 border-b border-dark-border/30">
                <User className="w-5 h-5 text-accent-cyan" />
                <span>Personal Information</span>
              </h3>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Full Legal Name <span className="text-risk-high">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Michael Doe"
                    className="w-full pl-12 pr-4 py-3 bg-dark-card/50 border border-dark-border/30 rounded-xl text-white placeholder-gray-600 focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email Address <span className="text-risk-high">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john.doe@example.com"
                      className="w-full pl-12 pr-4 py-3 bg-dark-card/50 border border-dark-border/30 rounded-xl text-white placeholder-gray-600 focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Phone Number <span className="text-risk-high">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      className="w-full pl-12 pr-4 py-3 bg-dark-card/50 border border-dark-border/30 rounded-xl text-white placeholder-gray-600 focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Date of Birth <span className="text-risk-high">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-dark-card/50 border border-dark-border/30 rounded-xl text-white focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">You must be at least 18 years old</p>
              </div>

              {/* Previous Country of Residence */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Previous Country of Residence <span className="text-risk-high">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">
                    {getCountryFlag(formData.previousCountry)}
                  </span>
                  <select
                    name="previousCountry"
                    value={formData.previousCountry}
                    onChange={handleInputChange}
                    className="w-full pl-14 pr-4 py-3 bg-dark-card/50 border border-dark-border/30 rounded-xl text-white focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all appearance-none cursor-pointer"
                    required
                  >
                    {COUNTRIES.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                  <Globe className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Current Address */}
            <div className="space-y-6 pt-6 border-t border-dark-border/30">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2 pb-2 border-b border-dark-border/30">
                <Home className="w-5 h-5 text-accent-blue" />
                <span>Current Residential Address</span>
              </h3>

              {/* Current Country */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Country <span className="text-risk-high">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">
                    {getCountryFlag(formData.currentCountry)}
                  </span>
                  <select
                    name="currentCountry"
                    value={formData.currentCountry}
                    onChange={handleInputChange}
                    className="w-full pl-14 pr-4 py-3 bg-dark-card/50 border border-dark-border/30 rounded-xl text-white focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all appearance-none cursor-pointer"
                    required
                  >
                    {COUNTRIES.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                  <Globe className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Street Address <span className="text-risk-high">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    placeholder="123 Main Street, Apt 4B"
                    className="w-full pl-12 pr-4 py-3 bg-dark-card/50 border border-dark-border/30 rounded-xl text-white placeholder-gray-600 focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    City <span className="text-risk-high">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    className="w-full px-4 py-3 bg-dark-card/50 border border-dark-border/30 rounded-xl text-white placeholder-gray-600 focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                    required
                  />
                </div>

                {/* State/Province */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    State/Province <span className="text-risk-high">*</span>
                  </label>
                  <input
                    type="text"
                    name="stateProvince"
                    value={formData.stateProvince}
                    onChange={handleInputChange}
                    placeholder="NY"
                    className="w-full px-4 py-3 bg-dark-card/50 border border-dark-border/30 rounded-xl text-white placeholder-gray-600 focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                    required
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Postal Code <span className="text-risk-high">*</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    className="w-full px-4 py-3 bg-dark-card/50 border border-dark-border/30 rounded-xl text-white placeholder-gray-600 focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Occupation */}
            <div className="space-y-6 pt-6 border-t border-dark-border/30">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2 pb-2 border-b border-dark-border/30">
                <Briefcase className="w-5 h-5 text-accent-purple" />
                <span>Employment Information</span>
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Occupation <span className="text-risk-high">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <select
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-dark-card/50 border border-dark-border/30 rounded-xl text-white focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select your occupation</option>
                    {OCCUPATIONS.map(occ => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-risk-high/10 border border-risk-high/30 rounded-xl">
                <p className="text-sm text-risk-high">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan text-white py-4 px-6 rounded-2xl font-bold shadow-glow-purple hover:shadow-glow-blue transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-3 mt-8 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Continue to Identity Verification</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Privacy Notice */}
            <div className="mt-6 p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-xl">
              <p className="text-xs text-gray-400 text-center">
                🔒 Your information is encrypted and secure. We use bank-level security to protect your data. By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default PersonalInfoForm
