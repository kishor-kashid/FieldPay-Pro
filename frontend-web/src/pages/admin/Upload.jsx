import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadAPI } from '../../services/api';
import FileUpload from '../../components/FileUpload';
import CSVPreview from '../../components/CSVPreview';

const Upload = () => {
  const navigate = useNavigate();
  const [saFile, setSaFile] = useState(null);
  const [paychexFile, setPaychexFile] = useState(null);
  const [saUploadResult, setSaUploadResult] = useState(null);
  const [paychexUploadResult, setPaychexUploadResult] = useState(null);
  const [uploading, setUploading] = useState({ sa: false, paychex: false });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileSelect = (type) => (file) => {
    if (type === 'sa') {
      setSaFile(file);
      setSaUploadResult(null);
    } else {
      setPaychexFile(file);
      setPaychexUploadResult(null);
    }
    setMessage({ type: '', text: '' });
  };

  const handleFileRemove = (type) => () => {
    if (type === 'sa') {
      setSaFile(null);
      setSaUploadResult(null);
    } else {
      setPaychexFile(null);
      setPaychexUploadResult(null);
    }
  };

  const handleUpload = async (type) => {
    const file = type === 'sa' ? saFile : paychexFile;
    if (!file) return;

    setUploading({ ...uploading, [type]: true });
    setMessage({ type: '', text: '' });

    try {
      const response = type === 'sa' 
        ? await uploadAPI.uploadServiceAutopilot(file)
        : await uploadAPI.uploadPaychex(file);

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: `${type === 'sa' ? 'Service Autopilot' : 'Paychex'} data uploaded successfully! ${response.data.data.recordsStored} records stored.`
        });

        // Store upload result for preview
        if (type === 'sa') {
          setSaUploadResult(response.data.data);
        } else {
          setPaychexUploadResult(response.data.data);
        }

        // Show errors if any
        if (response.data.data.errors && response.data.data.errors.length > 0) {
          console.warn('CSV parsing errors:', response.data.data.errors);
        }
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Upload failed. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
      console.error('Upload error:', error);
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  const handleProcessPayroll = () => {
    // Navigate to Approve page where they can process payroll
    navigate('/admin/approve');
  };

  const bothFilesUploaded = saUploadResult && paychexUploadResult;

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
        
        <FileUpload
          onFileSelect={handleFileSelect('sa')}
          onFileRemove={handleFileRemove('sa')}
          acceptedFile={saFile}
          label="Upload Service Autopilot CSV"
          description="Upload CSV containing job assignments, budgeted hours, and crew assignments"
          accept=".csv"
          maxSizeMB={10}
          disabled={uploading.sa}
        />

        {saFile && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleUpload('sa')}
              disabled={uploading.sa}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {uploading.sa ? 'Uploading...' : 'Upload Service Autopilot Data'}
            </button>
          </div>
        )}

        {saUploadResult && saUploadResult.preview && (
          <div className="mt-6">
            <CSVPreview
              data={saUploadResult.preview}
              title="Service Autopilot Data Preview"
              maxRows={10}
            />
            {saUploadResult.errors && saUploadResult.errors.length > 0 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                  Parsing Warnings ({saUploadResult.errors.length})
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {saUploadResult.errors.slice(0, 5).map((error, index) => (
                    <li key={index}>Row {error.row}: {error.error}</li>
                  ))}
                  {saUploadResult.errors.length > 5 && (
                    <li>... and {saUploadResult.errors.length - 5} more warnings</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Paychex Upload */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">⏰</span>
          Paychex Timesheet Data
        </h3>
        
        <FileUpload
          onFileSelect={handleFileSelect('paychex')}
          onFileRemove={handleFileRemove('paychex')}
          acceptedFile={paychexFile}
          label="Upload Paychex CSV"
          description="Upload CSV containing employee timesheets, clock in/out times, and pay rates"
          accept=".csv"
          maxSizeMB={10}
          disabled={uploading.paychex}
        />

        {paychexFile && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleUpload('paychex')}
              disabled={uploading.paychex}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {uploading.paychex ? 'Uploading...' : 'Upload Paychex Data'}
            </button>
          </div>
        )}

        {paychexUploadResult && paychexUploadResult.preview && (
          <div className="mt-6">
            <CSVPreview
              data={paychexUploadResult.preview}
              title="Paychex Data Preview"
              maxRows={10}
            />
            {paychexUploadResult.errors && paychexUploadResult.errors.length > 0 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                  Parsing Warnings ({paychexUploadResult.errors.length})
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {paychexUploadResult.errors.slice(0, 5).map((error, index) => (
                    <li key={index}>Row {error.row}: {error.error}</li>
                  ))}
                  {paychexUploadResult.errors.length > 5 && (
                    <li>... and {paychexUploadResult.errors.length - 5} more warnings</li>
                  )}
                </ul>
              </div>
            )}
            {paychexUploadResult.missingEmployees && paychexUploadResult.missingEmployees.length > 0 && (
              <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-orange-800 mb-2">
                  Missing Employees ({paychexUploadResult.missingEmployees.length})
                </h4>
                <p className="text-sm text-orange-700">
                  The following employee IDs were not found in the system: {paychexUploadResult.missingEmployees.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Process Payroll Button */}
      {bothFilesUploaded && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Ready to Process Payroll</h4>
              <p className="text-sm text-blue-800">
                Both files have been uploaded successfully. You can now process payroll with the uploaded data.
              </p>
            </div>
            <button
              onClick={handleProcessPayroll}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Process Payroll
            </button>
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Upload Instructions</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start">
            <span className="mr-2 font-semibold">1.</span>
            <span>Export data from Service Autopilot and Paychex in CSV format</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2 font-semibold">2.</span>
            <span>Ensure CSV files contain all required columns (see sample files in mock-data directory)</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2 font-semibold">3.</span>
            <span>Upload files for the same date range</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2 font-semibold">4.</span>
            <span>After uploading both files, use "Process Payroll" to calculate payroll with uploaded data</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2 font-semibold">5.</span>
            <span>Uploaded data will be stored in the database and used for payroll processing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
