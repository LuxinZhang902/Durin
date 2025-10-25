import { useState, useEffect } from 'react'
import { CheckCircle2, Loader2, Shield, FileText, Camera, Database, TrendingUp, Brain } from 'lucide-react'
import Logo from '../components/Logo'

const PROCESSING_STEPS = [
  {
    id: 'identity',
    icon: FileText,
    title: 'Verifying Identity',
    description: 'Validating government-issued documents',
    duration: 2000
  },
  {
    id: 'liveness',
    icon: Camera,
    title: 'Liveness Check',
    description: 'Analyzing facial biometrics and deepfake detection',
    duration: 2500
  },
  {
    id: 'sanctions',
    icon: Shield,
    title: 'Sanctions Screening',
    description: 'Checking against global watchlists',
    duration: 2000
  },
  {
    id: 'transactions',
    icon: Database,
    title: 'Analyzing Transactions',
    description: 'Processing transaction history and patterns',
    duration: 3000
  },
  {
    id: 'risk',
    icon: TrendingUp,
    title: 'Risk Assessment',
    description: 'Calculating fraud risk and credit score',
    duration: 2500
  },
  {
    id: 'decision',
    icon: Brain,
    title: 'Making Decision',
    description: 'Generating final credit decision',
    duration: 2000
  }
]

function ProcessingScreen({ onComplete, userData, idData, livenessData, transactionData }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (currentStep >= PROCESSING_STEPS.length) {
      // All steps completed, generate final result
      setTimeout(() => {
        const result = generateCreditDecision()
        onComplete(result)
      }, 1000)
      return
    }

    const step = PROCESSING_STEPS[currentStep]
    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, step.id])
      setCurrentStep(prev => prev + 1)
    }, step.duration)

    // Update progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const increment = 100 / (step.duration / 50)
        return Math.min(prev + increment, 100)
      })
    }, 50)

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [currentStep])

  useEffect(() => {
    // Reset progress when moving to next step
    if (currentStep > 0) {
      setProgress(0)
    }
  }, [currentStep])

  const generateCreditDecision = () => {
    // Simulate credit scoring algorithm
    let score = 450
    
    // Add points based on occupation
    const occupation = userData?.occupation?.toLowerCase() || ''
    if (['engineer', 'doctor', 'lawyer', 'manager'].some(o => occupation.includes(o))) {
      score += 120
    } else if (['teacher', 'accountant', 'nurse'].some(o => occupation.includes(o))) {
      score += 90
    } else {
      score += 50
    }

    // Add points for successful verification
    if (livenessData?.isReal) score += 30
    if (idData?.documentType) score += 20

    // Add points for transaction history
    if (transactionData?.preview?.totalRows > 50) score += 40
    else if (transactionData?.preview?.totalRows > 20) score += 25

    // Random variance
    score += Math.floor(Math.random() * 20) - 10

    // Cap at 650
    score = Math.min(650, Math.max(400, score))

    const approved = score >= 550
    const creditLimit = approved ? Math.round((score - 400) * 40) : 0
    const apr = approved ? (25 - ((score - 400) / 250) * 10).toFixed(2) : 0

    return {
      approved,
      creditScore: score,
      creditLimit,
      apr,
      scoreLevel: 
        score >= 620 ? 'Good' :
        score >= 580 ? 'Fair' :
        score >= 550 ? 'Acceptable' :
        score >= 500 ? 'Poor' : 'Very Poor',
      reasons: approved ? [
        'Identity successfully verified',
        'Liveness check passed',
        'No sanctions or watchlist matches',
        'Healthy transaction patterns detected',
        'Stable income indicators'
      ] : [
        'Credit score below minimum threshold (550)',
        'Insufficient transaction history',
        'Income verification needed'
      ]
    }
  }

  const overallProgress = ((completedSteps.length + (progress / 100)) / PROCESSING_STEPS.length) * 100

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
      <main className="relative max-w-4xl mx-auto px-8 py-16">
        <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-12 shadow-glass">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full mb-6 shadow-glow-blue animate-pulse">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Processing Your Application
            </h1>
            <p className="text-gray-400 text-lg">Please wait while we analyze your information</p>
          </div>

          {/* Overall Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-400">Overall Progress</span>
              <span className="text-sm font-bold text-accent-cyan">{Math.round(overallProgress)}%</span>
            </div>
            <div className="h-3 bg-dark-card rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan transition-all duration-300 ease-out"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Processing Steps */}
          <div className="space-y-4">
            {PROCESSING_STEPS.map((step, index) => {
              const Icon = step.icon
              const isCompleted = completedSteps.includes(step.id)
              const isCurrent = index === currentStep
              const isPending = index > currentStep

              return (
                <div
                  key={step.id}
                  className={`p-6 rounded-2xl border transition-all duration-500 ${
                    isCompleted
                      ? 'bg-accent-cyan/10 border-accent-cyan/30'
                      : isCurrent
                      ? 'bg-accent-blue/10 border-accent-blue/30 shadow-glow-blue'
                      : 'bg-dark-card/30 border-dark-border/30'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-accent-cyan/20'
                        : isCurrent
                        ? 'bg-accent-blue/20'
                        : 'bg-dark-card/50'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-accent-cyan" />
                      ) : isCurrent ? (
                        <Loader2 className="w-6 h-6 text-accent-blue animate-spin" />
                      ) : (
                        <Icon className="w-6 h-6 text-gray-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold ${
                          isCompleted || isCurrent ? 'text-white' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </h3>
                        {isCompleted && (
                          <span className="text-xs font-medium text-accent-cyan">Completed</span>
                        )}
                        {isCurrent && (
                          <span className="text-xs font-medium text-accent-blue">Processing...</span>
                        )}
                      </div>
                      <p className={`text-sm ${
                        isCompleted || isCurrent ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {step.description}
                      </p>

                      {/* Step Progress Bar */}
                      {isCurrent && (
                        <div className="mt-3">
                          <div className="h-1 bg-dark-card rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-accent-blue to-accent-purple transition-all duration-100"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Info Message */}
          <div className="mt-8 p-6 bg-accent-cyan/5 border border-accent-cyan/20 rounded-2xl">
            <p className="text-sm text-gray-400 text-center">
              🔒 We're using advanced AI and machine learning to analyze your application. This process typically takes 30-60 seconds.
            </p>
          </div>

          {/* Fun Facts */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              💡 Did you know? We analyze over 50+ data points to ensure accurate credit decisions
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProcessingScreen
