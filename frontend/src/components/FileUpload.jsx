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
      <label className="block text-sm font-medium mb-2">{label}</label>
      <p className="text-xs text-gray-400 mb-3">{description}</p>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-accent-blue bg-accent-blue/5'
            : selectedFile
            ? 'border-risk-low bg-risk-low/5'
            : 'border-dark-border hover:border-dark-border/60'
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
              <File className="w-5 h-5 text-risk-low" />
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearFile()
              }}
              className="p-1 hover:bg-dark-border rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-400">
              Drag & drop or <span className="text-accent-blue">browse</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">CSV files only</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUpload
