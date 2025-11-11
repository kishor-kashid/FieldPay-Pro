import React, { useState } from 'react';

const Upload = () => {
  const [saFile, setSaFile] = useState(null);
  const [paychexFile, setPaychexFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      if (type === 'sa') {
        setSaFile(file);
      } else {
        setPaychexFile(file);
      }
      setMessage({ type: '', text: '' });
    } else {
      setMessage({ type: 'error', text: 'Please select a valid CSV file' });
    }
  };

  const handleUpload = async (type) => {
    const file = type === 'sa' ? saFile : paychexFile;
    if (!file) return;

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // TODO: Implement upload API endpoint
      // await api.post('/upload', formData);
      
      // Simulate upload for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage({ 
        type: 'success', 
        text: `${type === 'sa' ? 'Service Autopilot' : 'Paychex'} data uploaded successfully!` 
      });
      
      if (type === 'sa') {
        setSaFile(null);
      } else {
        setPaychexFile(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Data</h1>
        <p className="text-gray-600 mt-1">Upload CSV files from Service Autopilot and Paychex</p>
      </div>

      {message.text && (
        <div className={`px-4 py-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Service Autopilot Upload */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">🔧</span>
          Service Autopilot Job Data
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload CSV containing job assignments, budgeted hours, and crew assignments
        </p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            id="sa-file"
            accept=".csv"
            onChange={(e) => handleFileChange(e, 'sa')}
            className="hidden"
          />
          <label htmlFor="sa-file" className="cursor-pointer">
            <div className="text-4xl mb-3">📄</div>
            {saFile ? (
              <div>
                <p className="text-sm font-medium text-gray-800">{saFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(saFile.size / 1024).toFixed(2)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-800">Click to select CSV file</p>
                <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
              </div>
            )}
          </label>
        </div>

        {saFile && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleUpload('sa')}
              disabled={uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {uploading ? 'Uploading...' : 'Upload Service Autopilot Data'}
            </button>
          </div>
        )}
      </div>

      {/* Paychex Upload */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">⏰</span>
          Paychex Timesheet Data
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload CSV containing employee timesheets, clock in/out times, and pay rates
        </p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
          <input
            type="file"
            id="paychex-file"
            accept=".csv"
            onChange={(e) => handleFileChange(e, 'paychex')}
            className="hidden"
          />
          <label htmlFor="paychex-file" className="cursor-pointer">
            <div className="text-4xl mb-3">📄</div>
            {paychexFile ? (
              <div>
                <p className="text-sm font-medium text-gray-800">{paychexFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(paychexFile.size / 1024).toFixed(2)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-800">Click to select CSV file</p>
                <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
              </div>
            )}
          </label>
        </div>

        {paychexFile && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleUpload('paychex')}
              disabled={uploading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
            >
              {uploading ? 'Uploading...' : 'Upload Paychex Data'}
            </button>
          </div>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">Upload Instructions</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start">
            <span className="mr-2">1.</span>
            <span>Export data from Service Autopilot and Paychex in CSV format</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">2.</span>
            <span>Ensure CSV files contain all required columns</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">3.</span>
            <span>Upload files for the same date range</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">4.</span>
            <span>After uploading, use "Analyze Payroll" to preview calculations</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;

