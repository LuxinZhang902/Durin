import { useState } from 'react'
import { Upload, FileText, CheckCircle2, X, ArrowRight, ArrowLeft, Shield, Camera, AlertCircle } from 'lucide-react'
import Logo from '../components/Logo'

const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Passport', icon: '🛂' },
  { value: 'drivers_license', label: "Driver's License", icon: '🪪' },
  { value: 'national_id', label: 'National ID Card', icon: '🆔' },
  { value: 'residence_permit', label: 'Residence Permit', icon: '📋' }
]

function IDUpload({ onComplete, onBack, userData }) {
  const [documentType, setDocumentType] = useState('')
  const [frontImage, setFrontImage] = useState(null)
  const [backImage, setBackImage] = useState(null)
  const [frontPreview, setFrontPreview] = useState(null)
  const [backPreview, setBackPreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileUpload = (e, side) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setError('')

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      if (side === 'front') {
        setFrontImage(file)
        setFrontPreview(reader.result)
      } else {
        setBackImage(file)
        setBackPreview(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (side) => {
    if (side === 'front') {
      setFrontImage(null)
      setFrontPreview(null)
    } else {
      setBackImage(null)
      setBackPreview(null)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!documentType) {
      setError('Please select a document type')
      return
    }

    if (!frontImage) {
      setError('Please upload the front of your document')
      return
    }

    // Back image is optional for passport
    if (documentType !== 'passport' && !backImage) {
      setError('Please upload the back of your document')
      return
    }

    setIsLoading(true)

    // Simulate upload
    setTimeout(() => {
      setIsLoading(false)
      if (onComplete) {
        onComplete({
          documentType,
          frontImage,
          backImage,
          frontPreview,
          backPreview
        })
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
              <div className="w-8 h-8 rounded-full bg-accent-cyan/20 border border-accent-cyan flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-accent-cyan" />
              </div>
              <span className="text-sm text-gray-400">Personal Info</span>
            </div>
            <div className="flex-1 h-0.5 bg-accent-cyan mx-4"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple flex items-center justify-center shadow-glow-blue">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold">ID Upload</span>
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
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Identity Verification
            </h1>
            <p className="text-gray-400">Upload a government-issued ID to verify your identity</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Document Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-4">
                Select Document Type <span className="text-risk-high">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {DOCUMENT_TYPES.map(doc => (
                  <button
                    key={doc.value}
                    type="button"
                    onClick={() => setDocumentType(doc.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      documentType === doc.value
                        ? 'border-accent-cyan bg-accent-cyan/10 shadow-glow-cyan'
                        : 'border-dark-border/30 bg-dark-card/30 hover:border-accent-cyan/50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{doc.icon}</div>
                    <div className="text-sm font-medium">{doc.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {documentType && (
              <>
                {/* Front Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-4">
                    Front of Document <span className="text-risk-high">*</span>
                  </label>
                  
                  {!frontPreview ? (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-dark-border/50 rounded-2xl p-12 text-center hover:border-accent-cyan/50 transition-all bg-dark-card/20">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                        <p className="text-gray-400 mb-2">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-600">JPG, PNG up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'front')}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-dark-border/30">
                      <img src={frontPreview} alt="Front of document" className="w-full h-64 object-contain bg-dark-card/50" />
                      <button
                        type="button"
                        onClick={() => removeImage('front')}
                        className="absolute top-4 right-4 p-2 bg-risk-high/80 hover:bg-risk-high rounded-full transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-4 left-4 px-3 py-1 bg-green-500/80 rounded-full flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Uploaded</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Back Image Upload (if not passport) */}
                {documentType !== 'passport' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-4">
                      Back of Document <span className="text-risk-high">*</span>
                    </label>
                    
                    {!backPreview ? (
                      <label className="block cursor-pointer">
                        <div className="border-2 border-dashed border-dark-border/50 rounded-2xl p-12 text-center hover:border-accent-cyan/50 transition-all bg-dark-card/20">
                          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                          <p className="text-gray-400 mb-2">Click to upload or drag and drop</p>
                          <p className="text-sm text-gray-600">JPG, PNG up to 10MB</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'back')}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden border border-dark-border/30">
                        <img src={backPreview} alt="Back of document" className="w-full h-64 object-contain bg-dark-card/50" />
                        <button
                          type="button"
                          onClick={() => removeImage('back')}
                          className="absolute top-4 right-4 p-2 bg-risk-high/80 hover:bg-risk-high rounded-full transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-4 left-4 px-3 py-1 bg-green-500/80 rounded-full flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Uploaded</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Important Tips */}
                <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-2xl p-6">
                  <div className="flex items-start space-x-3">
                    <Camera className="w-6 h-6 text-accent-blue flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-white mb-2">Tips for best results:</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Ensure all text is clearly visible and readable</li>
                        <li>• Avoid glare and shadows</li>
                        <li>• Place document on a flat, contrasting surface</li>
                        <li>• Make sure the entire document fits in the frame</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-risk-high/10 border border-risk-high/30 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-risk-high flex-shrink-0 mt-0.5" />
                <p className="text-sm text-risk-high">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 bg-dark-card/50 border border-dark-border/30 text-white py-4 px-6 rounded-2xl font-bold hover:bg-dark-card transition-all flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              
              <button
                type="submit"
                disabled={isLoading || !documentType || !frontImage || (documentType !== 'passport' && !backImage)}
                className="flex-1 bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan text-white py-4 px-6 rounded-2xl font-bold shadow-glow-purple hover:shadow-glow-blue transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Liveness Check</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Privacy Notice */}
            <div className="mt-6 p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-xl">
              <p className="text-xs text-gray-400 text-center">
                🔒 Your documents are encrypted and stored securely. We comply with all data protection regulations including GDPR and CCPA.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default IDUpload
