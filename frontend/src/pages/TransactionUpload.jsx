import { useState } from 'react'
import { Upload, FileText, CheckCircle2, X, ArrowRight, ArrowLeft, Database, AlertCircle, Download, TrendingUp } from 'lucide-react'
import Logo from '../components/Logo'

function TransactionUpload({ onComplete, onBack, userData }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (uploadedFile) => {
    // Validate file type
    if (!uploadedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    // Validate file size (max 50MB)
    if (uploadedFile.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB')
      return
    }

    setError('')
    setFile(uploadedFile)

    // Parse CSV for preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim())
      const rows = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim())
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] || ''
          return obj
        }, {})
      })
      
      setPreview({
        headers,
        rows,
        totalRows: lines.length - 1
      })
    }
    reader.readAsText(uploadedFile)
  }

  const removeFile = () => {
    setFile(null)
    setPreview(null)
  }

  const downloadSample = () => {
    const sampleCSV = `Date,Amount,Description,Merchant,Category,Type
2024-01-15,-45.50,Coffee Shop Purchase,Starbucks,Food & Dining,Debit
2024-01-16,2500.00,Salary Deposit,Acme Corp,Income,Credit
2024-01-17,-120.00,Grocery Shopping,Whole Foods,Groceries,Debit
2024-01-18,-85.00,Gas Station,Shell,Transportation,Debit
2024-01-19,-1200.00,Rent Payment,Property Management,Housing,Debit`

    const blob = new Blob([sampleCSV], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample_transactions.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!file) {
      setError('Please upload a transaction file')
      return
    }

    setIsLoading(true)

    // Simulate upload and processing
    setTimeout(() => {
      setIsLoading(false)
      if (onComplete) {
        onComplete({
          file,
          preview
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
              <div className="w-8 h-8 rounded-full bg-accent-cyan/20 border border-accent-cyan flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-accent-cyan" />
              </div>
              <span className="text-sm text-gray-400">ID Upload</span>
            </div>
            <div className="flex-1 h-0.5 bg-accent-cyan mx-4"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-accent-cyan/20 border border-accent-cyan flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-accent-cyan" />
              </div>
              <span className="text-sm text-gray-400">Verification</span>
            </div>
            <div className="flex-1 h-0.5 bg-accent-cyan mx-4"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple flex items-center justify-center shadow-glow-blue">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold">Transactions</span>
            </div>
          </div>
        </div>

        <div className="bg-glass backdrop-blur-2xl rounded-3xl border border-dark-border/30 p-10 shadow-glass">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl mb-4 shadow-glow-blue">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Transaction History
            </h1>
            <p className="text-gray-400">Upload your bank transaction history for analysis</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Download Sample */}
            <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-6 h-6 text-accent-blue flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Need help formatting your data?</h4>
                    <p className="text-sm text-gray-400">Download our sample CSV template to see the required format</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={downloadSample}
                  className="flex items-center space-x-2 px-4 py-2 bg-accent-blue/20 hover:bg-accent-blue/30 border border-accent-blue/50 rounded-xl transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Download Sample</span>
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-4">
                Upload Transaction File <span className="text-risk-high">*</span>
              </label>
              
              {!file ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                    dragActive
                      ? 'border-accent-cyan bg-accent-cyan/10'
                      : 'border-dark-border/50 bg-dark-card/20 hover:border-accent-cyan/50'
                  }`}
                >
                  <Upload className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400 mb-2 text-lg">Drag and drop your CSV file here</p>
                  <p className="text-sm text-gray-600 mb-4">or</p>
                  <label className="inline-block cursor-pointer px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-purple rounded-xl font-semibold hover:shadow-glow-blue transition-all">
                    Browse Files
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-600 mt-4">CSV files up to 50MB</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Info */}
                  <div className="bg-dark-card/50 border border-dark-border/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-accent-cyan/20 rounded-xl">
                          <FileText className="w-6 h-6 text-accent-cyan" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{file.name}</p>
                          <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 bg-risk-high/20 hover:bg-risk-high/30 border border-risk-high/50 rounded-xl transition-all"
                      >
                        <X className="w-5 h-5 text-risk-high" />
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-green-500">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>File uploaded successfully</span>
                    </div>
                  </div>

                  {/* Preview */}
                  {preview && (
                    <div className="bg-dark-card/50 border border-dark-border/30 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-white">Preview</h4>
                        <span className="text-sm text-gray-400">{preview.totalRows} transactions found</span>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-dark-border/30">
                              {preview.headers.map((header, index) => (
                                <th key={index} className="text-left py-2 px-3 text-gray-400 font-medium">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {preview.rows.map((row, rowIndex) => (
                              <tr key={rowIndex} className="border-b border-dark-border/10">
                                {preview.headers.map((header, colIndex) => (
                                  <td key={colIndex} className="py-2 px-3 text-gray-300">
                                    {row[header]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {preview.totalRows > 5 && (
                        <p className="text-xs text-gray-500 mt-3 text-center">
                          Showing first 5 of {preview.totalRows} transactions
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Required Format Info */}
            <div className="bg-dark-card/30 border border-dark-border/30 rounded-2xl p-6">
              <h4 className="font-semibold text-white mb-3">Required CSV Format:</h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-cyan" />
                  <span className="text-gray-400">Date (YYYY-MM-DD)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-cyan" />
                  <span className="text-gray-400">Amount (numeric)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-cyan" />
                  <span className="text-gray-400">Description</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-cyan" />
                  <span className="text-gray-400">Merchant (optional)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-cyan" />
                  <span className="text-gray-400">Category (optional)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-cyan" />
                  <span className="text-gray-400">Type: Credit/Debit (optional)</span>
                </div>
              </div>
            </div>

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
                disabled={isLoading || !file}
                className="flex-1 bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan text-white py-4 px-6 rounded-2xl font-bold shadow-glow-purple hover:shadow-glow-blue transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze & Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Privacy Notice */}
            <div className="mt-6 p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-xl">
              <p className="text-xs text-gray-400 text-center">
                🔒 Your transaction data is encrypted and analyzed securely. We never share your financial information with third parties.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default TransactionUpload
