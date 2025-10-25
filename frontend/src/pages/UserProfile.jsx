import { useState } from 'react'
import { User, Building2, Mail, Phone, MapPin, Briefcase, Save, X, Edit2, CheckCircle2, ArrowLeft, Calendar, Home, CreditCard } from 'lucide-react'
import Logo from '../components/Logo'

function UserProfile({ userData, onUpdateProfile, onClose }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedData, setEditedData] = useState(userData || {})

  const handleSave = () => {
    setIsSaving(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setIsEditing(false)
      if (onUpdateProfile) {
        onUpdateProfile(editedData)
      }
    }, 1000)
  }

  const handleCancel = () => {
    setEditedData(userData)
    setIsEditing(false)
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

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-8 py-16">
        {/* Back Button */}
        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 shadow-glass overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border-2 border-white/20 flex items-center justify-center text-3xl font-bold">
                  {userData?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{userData?.fullName || 'User Profile'}</h1>
                  <p className="text-white/70">{userData?.email}</p>
                </div>
              </div>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="font-medium">Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {/* Personal Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <User className="w-5 h-5 text-accent-cyan" />
                <span>Personal Information</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-400">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.fullName || ''}
                      onChange={(e) => setEditedData({ ...editedData, fullName: e.target.value })}
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                    />
                  ) : (
                    <p className="text-white font-medium">{userData?.fullName || 'Not set'}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-400">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedData.email || ''}
                      onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                    />
                  ) : (
                    <p className="text-white font-medium">{userData?.email || 'Not set'}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-400">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedData.phoneNumber || ''}
                      onChange={(e) => setEditedData({ ...editedData, phoneNumber: e.target.value })}
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                    />
                  ) : (
                    <p className="text-white font-medium">{userData?.phoneNumber || 'Not set'}</p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-400">Age</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedData.age || ''}
                      onChange={(e) => setEditedData({ ...editedData, age: e.target.value })}
                      min="18"
                      max="120"
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                    />
                  ) : (
                    <p className="text-white font-medium">{userData?.age || 'Not set'}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-400">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedData.dateOfBirth || ''}
                      onChange={(e) => setEditedData({ ...editedData, dateOfBirth: e.target.value })}
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                    />
                  ) : (
                    <p className="text-white font-medium">{userData?.dateOfBirth || 'Not set'}</p>
                  )}
                </div>

                {/* Occupation */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-400">Occupation</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.occupation || ''}
                      onChange={(e) => setEditedData({ ...editedData, occupation: e.target.value })}
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                    />
                  ) : (
                    <p className="text-white font-medium">{userData?.occupation || 'Not set'}</p>
                  )}
                </div>

                {/* Number of Bank Accounts */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-400">Number of Bank Accounts</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedData.numberOfBankAccounts || ''}
                      onChange={(e) => setEditedData({ ...editedData, numberOfBankAccounts: e.target.value })}
                      min="1"
                      max="20"
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                    />
                  ) : (
                    <p className="text-white font-medium">{userData?.numberOfBankAccounts || 'Not set'}</p>
                  )}
                </div>

                {/* Annual Income */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-400">Annual Income</label>
                  {isEditing ? (
                    <select
                      value={editedData.annualIncome || ''}
                      onChange={(e) => setEditedData({ ...editedData, annualIncome: e.target.value })}
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
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
                  ) : (
                    <p className="text-white font-medium">{userData?.annualIncome || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Home className="w-5 h-5 text-accent-purple" />
                <span>Address Information</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Street Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-400">Street Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.address || ''}
                      onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                    />
                  ) : (
                    <p className="text-white font-medium">{userData?.address || 'Not set'}</p>
                  )}
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-400">Postal Code</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.postalCode || ''}
                      onChange={(e) => setEditedData({ ...editedData, postalCode: e.target.value })}
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                    />
                  ) : (
                    <p className="text-white font-medium">{userData?.postalCode || 'Not set'}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-400">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.city || ''}
                      onChange={(e) => setEditedData({ ...editedData, city: e.target.value })}
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                    />
                  ) : (
                    <p className="text-white font-medium">{userData?.city || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-accent-blue" />
                <span>Country</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-400">Country</label>
                  {isEditing ? (
                    <select
                      value={editedData.country || ''}
                      onChange={(e) => setEditedData({ ...editedData, country: e.target.value })}
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
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
                  ) : (
                    <p className="text-white font-medium">{userData?.country || 'Not set'}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-400">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData.city || ''}
                      onChange={(e) => setEditedData({ ...editedData, city: e.target.value })}
                      className="w-full bg-dark-card/50 border border-dark-border/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all"
                    />
                  ) : (
                    <p className="text-white font-medium">{userData?.city || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-4 pt-6 border-t border-dark-border/30">
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-dark-card/50 border border-dark-border/30 text-white py-3 px-6 rounded-xl font-semibold hover:bg-dark-card transition-all flex items-center justify-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan text-white py-3 px-6 rounded-xl font-semibold shadow-glow-blue hover:shadow-glow-purple transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Success Message */}
            {!isEditing && (
              <div className="mt-6 p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-xl flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-accent-cyan" />
                <p className="text-sm text-gray-400">
                  Your profile is up to date. Click "Edit Profile" to make changes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
