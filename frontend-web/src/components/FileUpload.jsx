import React, { useRef, useState } from 'react';

/**
 * FileUpload Component
 * Drag-and-drop file upload component with validation
 */
const FileUpload = ({ 
  onFileSelect, 
  onFileRemove,
  acceptedFile = null,
  label = 'Upload CSV File',
  description = 'Select a CSV file to upload',
  accept = '.csv',
  maxSizeMB = 10,
  disabled = false
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const validateFile = (file) => {
    setError('');

    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please select a valid CSV file');
      return false;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (file) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onFileRemove) {
      onFileRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError('');
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <p className="text-sm text-gray-600 mb-4">{description}</p>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : acceptedFile
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-blue-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {acceptedFile ? (
          <div className="space-y-2">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-sm font-medium text-gray-800">{acceptedFile.name}</p>
            <p className="text-xs text-gray-500">
              {(acceptedFile.size / 1024).toFixed(2)} KB
            </p>
            {!disabled && onFileRemove && (
              <button
                onClick={handleRemove}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-sm font-medium text-gray-800">
              {disabled ? 'Upload disabled' : 'Click to select CSV file'}
            </p>
            <p className="text-xs text-gray-500">
              {disabled ? '' : 'or drag and drop'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Max size: {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
};

export default FileUpload;

