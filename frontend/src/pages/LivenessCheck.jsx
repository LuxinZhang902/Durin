import { useState, useRef, useEffect } from 'react'
import { Camera, Upload, CheckCircle, XCircle, AlertTriangle, Shield, Loader2, User, Globe, Fingerprint, Video, X as CloseIcon } from 'lucide-react'

function LivenessCheck({ onComplete, onBack, userData }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState(null)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  // Set video stream when camera opens
  useEffect(() => {
    if (showCamera && stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(err => {
        console.error('Video play error:', err)
      })
    }
  }, [showCamera, stream])

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      setError(null)
      setResult(null)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      })
      setStream(mediaStream)
      setShowCamera(true)
      setError(null)
      
      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.play().catch(err => {
            console.error('Video play error:', err)
          })
        }
      }, 100)
    } catch (err) {
      setError('Failed to access camera. Please allow camera permissions.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw video frame to canvas
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Create file from blob
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
        setSelectedImage(file)
        
        // Create preview
        const url = URL.createObjectURL(blob)
        setImagePreview(url)
        
        // Stop camera
        stopCamera()
        setResult(null)
      }
    }, 'image/jpeg', 0.95)
  }

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedImage)
      formData.append('user_id', 'demo_user_001')
      formData.append('device_fingerprint', navigator.userAgent)

      const response = await fetch('http://localhost:8000/api/liveness/check', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
        
        // If onComplete is provided (new flow), call it after a short delay
        if (onComplete) {
          setTimeout(() => {
            onComplete(data)
          }, 2000)
        }
      } else {
        setError(data.message || 'Liveness check failed')
      }
    } catch (err) {
      setError(err.message || 'Failed to perform liveness check')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-accent-cyan to-accent-blue rounded-2xl shadow-glow-blue">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Liveness & Identity Verification</h1>
              <p className="text-gray-400">AI-powered face detection with sanctions screening</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Upload Section */}
          <div className="space-y-6">
            <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-8 shadow-glass">
              <h2 className="text-xl font-bold mb-6">Upload Photo</h2>

              {/* Image Preview */}
              {imagePreview ? (
                <div className="mb-6">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-64 object-cover rounded-2xl border-2 border-accent-cyan/30"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null)
                      setImagePreview(null)
                      setResult(null)
                    }}
                    className="mt-4 w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Clear Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-dark-border/50 rounded-2xl p-12 text-center cursor-pointer hover:border-accent-cyan/50 transition-all"
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <p className="text-gray-400 mb-2">Click to upload photo</p>
                    <p className="text-xs text-gray-600">JPG, PNG up to 10MB</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-1 border-t border-dark-border/30"></div>
                    <span className="text-xs text-gray-500 uppercase">or</span>
                    <div className="flex-1 border-t border-dark-border/30"></div>
                  </div>

                  <button
                    onClick={startCamera}
                    className="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-glass border border-accent-blue/30 rounded-2xl hover:border-accent-blue/50 hover:bg-accent-blue/10 transition-all"
                  >
                    <Video className="w-5 h-5 text-accent-blue" />
                    <span className="font-semibold text-white">Use Camera</span>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={loading || !selectedImage}
                className="w-full bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-purple text-white py-4 px-6 rounded-2xl font-bold shadow-glow-blue hover:shadow-glow-purple transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Run Verification</span>
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

            {/* Features */}
            <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-6 shadow-glass">
              <h3 className="text-lg font-bold mb-4">Verification Checks</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-accent-cyan" />
                  <span className="text-sm">Real Face Detection (DeepFace)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-accent-cyan" />
                  <span className="text-sm">Deepfake Detection (Reality Defender)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-accent-cyan" />
                  <span className="text-sm">Sanctions Screening (OpenSanctions)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-accent-cyan" />
                  <span className="text-sm">PEP List Matching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-accent-cyan" />
                  <span className="text-sm">Device Risk Scoring</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results Section */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Overall Status */}
                <div className={`bg-glass backdrop-blur-2xl rounded-3xl border ${result.liveness_pass ? 'border-green-500/30' : 'border-risk-high/30'} p-8 shadow-glass`}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Verification Result</h2>
                    {result.liveness_pass ? (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : (
                      <XCircle className="w-8 h-8 text-risk-high" />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Overall Status</span>
                      <span className={`font-bold ${result.liveness_pass ? 'text-green-500' : 'text-risk-high'}`}>
                        {result.liveness_pass ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Liveness Score</span>
                      <span className="font-bold text-white">{(result.liveness_score * 100).toFixed(1)}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Real Face Detected</span>
                      <span className={`font-bold ${result.is_real_face ? 'text-green-500' : 'text-risk-high'}`}>
                        {result.is_real_face ? 'YES' : 'NO'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Deepfake Detected</span>
                      <span className={`font-bold ${result.is_deepfake ? 'text-risk-high' : 'text-green-500'}`}>
                        {result.is_deepfake ? 'YES' : 'NO'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Replay Attack</span>
                      <span className={`font-bold ${result.replay_detected ? 'text-risk-high' : 'text-green-500'}`}>
                        {result.replay_detected ? 'DETECTED' : 'NONE'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Sanctions Check</span>
                      <span className={`font-bold ${result.sanctions_pass ? 'text-green-500' : 'text-risk-high'}`}>
                        {result.sanctions_pass ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Device Risk Score</span>
                      <span className={`font-bold ${result.device_risk_score < 0.5 ? 'text-green-500' : 'text-risk-high'}`}>
                        {(result.device_risk_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Flags */}
                {result.flags && result.flags.length > 0 && (
                  <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-6 shadow-glass">
                    <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <span>Detected Issues</span>
                    </h3>
                    <div className="space-y-2">
                      {result.flags.map((flag, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-dark-card/50 rounded-xl">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <span className="text-sm text-gray-300">{flag.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Info */}
                <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-6 shadow-glass">
                  <h3 className="text-lg font-bold mb-4">Session Info</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-400">User ID:</span>
                      <span className="text-sm font-mono">{result.user_id}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Fingerprint className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-400">Device:</span>
                      <span className="text-sm font-mono truncate">Browser</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-12 shadow-glass text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-500">Upload a photo to see verification results</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl mx-4">
            {/* Close Button */}
            <button
              onClick={stopCamera}
              className="absolute top-4 right-4 z-10 p-2 bg-dark-surface/80 backdrop-blur-xl rounded-full border border-dark-border/30 hover:bg-risk-high/20 hover:border-risk-high/50 transition-all"
            >
              <CloseIcon className="w-6 h-6 text-white" />
            </button>

            {/* Camera View */}
            <div className="bg-dark-surface rounded-3xl border border-dark-border/30 overflow-hidden shadow-2xl">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-accent-blue/10 rounded-xl">
                    <Video className="w-5 h-5 text-accent-blue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Camera Capture</h3>
                    <p className="text-sm text-gray-400">Position your face in the center</p>
                  </div>
                </div>

                {/* Video Feed */}
                <div className="relative rounded-2xl overflow-hidden bg-black mb-6">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-auto"
                    style={{ transform: 'scaleX(-1)' }} // Mirror effect
                  />
                  
                  {/* Face Guide Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-80 border-4 border-accent-cyan/50 rounded-full"></div>
                  </div>

                  {/* Recording Indicator */}
                  <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-xs text-white font-medium">LIVE</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-6 p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-xl">
                  <p className="text-sm text-gray-300 text-center">
                    📸 Make sure your face is clearly visible and well-lit
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={stopCamera}
                    className="flex-1 py-4 px-6 bg-glass border border-dark-border/30 rounded-2xl font-semibold text-white hover:bg-dark-card transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="flex-1 py-4 px-6 bg-gradient-to-r from-accent-cyan to-accent-blue text-white rounded-2xl font-bold shadow-glow-blue hover:shadow-glow-cyan transition-all flex items-center justify-center space-x-2"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Capture Photo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Canvas for Photo Capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default LivenessCheck
