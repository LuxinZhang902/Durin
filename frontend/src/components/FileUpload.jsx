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
      <label className="block text-sm font-bold mb-2 text-white">{label}</label>
      <p className="text-xs text-gray-500 mb-3">{description}</p>

      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
          dragActive
            ? 'border-accent-blue bg-accent-blue/10 scale-105 shadow-lg shadow-accent-blue/20'
            : selectedFile
            ? 'border-risk-low bg-risk-low/10 shadow-lg shadow-risk-low/20'
            : 'border-dark-border/50 hover:border-accent-blue/50 hover:bg-dark-border/10'
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
              <div className="p-2 bg-risk-low/20 rounded-lg">
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
              className="p-2 hover:bg-risk-high/20 rounded-lg transition-colors group"
            >
              <X className="w-4 h-4 text-gray-400 group-hover:text-risk-high" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-flex p-4 bg-accent-blue/10 rounded-full mb-3">
              <Upload className="w-8 h-8 text-accent-blue" />
            </div>
            <p className="text-sm font-medium text-gray-300 mb-1">
              Drag & drop your file here
            </p>
            <p className="text-xs text-gray-500">
              or <span className="text-accent-blue font-semibold cursor-pointer hover:underline">browse</span> to upload
            </p>
            <p className="text-xs text-gray-600 mt-2">CSV files only</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUpload
