import { useState } from 'react'
import { Upload, File, X } from 'lucide-react'

function FileUpload({ label, description, onFileSelect, accept = '.csv' }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
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

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    if (file.name.endsWith('.csv')) {
      setSelectedFile(file)
      onFileSelect(file)
    } else {
      alert('Please upload a CSV file')
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    onFileSelect(null)
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-white">{label}</label>
      <p className="text-xs text-gray-400 mb-3">{description}</p>

      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 backdrop-blur-sm ${
          dragActive
            ? 'border-accent-blue bg-accent-blue/10 scale-[1.02] shadow-glow-blue'
            : selectedFile
            ? 'border-risk-low bg-risk-low/10 shadow-glass'
            : 'border-dark-border/40 hover:border-accent-blue/40 hover:bg-dark-card/30'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-risk-low/20 rounded-xl border border-risk-low/30">
                <File className="w-5 h-5 text-risk-low" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB • Ready to analyze
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearFile()
              }}
              className="p-2 hover:bg-risk-high/20 rounded-xl transition-all group"
            >
              <X className="w-4 h-4 text-gray-400 group-hover:text-risk-high" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-flex p-4 bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 rounded-2xl mb-3 border border-accent-blue/20">
              <Upload className="w-7 h-7 text-accent-blue" />
            </div>
            <p className="text-sm font-medium text-gray-200 mb-1">
              Drag & drop your file here
            </p>
            <p className="text-xs text-gray-400">
              or <span className="text-accent-cyan font-semibold cursor-pointer hover:underline">browse</span> to upload
            </p>
            <p className="text-xs text-gray-600 mt-2">CSV files only</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUpload
